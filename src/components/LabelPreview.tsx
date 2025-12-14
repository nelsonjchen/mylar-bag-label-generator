'use client';

import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';

interface ProductData {
    title: string;
    image: string;
    imageBase64?: string;
    source: string;
    url: string;
}

interface LabelPreviewProps {
    data: ProductData;
}

export default function LabelPreview({ data }: LabelPreviewProps) {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'in',
                format: 'letter'
            });

            const pageWidth = 8.5;
            const pageHeight = 11;
            const labelHeight = pageHeight / 2;

            // Draw Label 1
            drawLabel(doc, data, 0, 0, pageWidth, labelHeight);

            // Draw Dashed Separator
            doc.setLineDashPattern([0.1, 0.1], 0);
            doc.setLineWidth(0.01);
            doc.line(0, labelHeight, pageWidth, labelHeight);
            doc.setLineDashPattern([], 0); // Reset

            // Draw Label 2
            drawLabel(doc, data, 0, labelHeight, pageWidth, labelHeight);

            const url = doc.output('bloburl');
            setPdfUrl(url.toString());
            setError(null);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to generate PDF');
        }
    }, [data]);

    if (error) {
        return <div style={{ color: 'red', padding: '1rem' }}>Error generating PDF: {error}</div>;
    }

    if (!pdfUrl) {
        return <div style={{ padding: '1rem' }}>Generating PDF...</div>;
    }

    return (
        <div style={{ height: '800px', border: '1px solid #e5e5e5', borderRadius: '8px', overflow: 'hidden' }}>
            <iframe
                src={pdfUrl || ''}
                width="100%"
                height="100%"
                style={{ border: 'none' }}
                title="Label PDF"
            />
        </div>
    );
}

function drawLabel(doc: jsPDF, data: ProductData, x: number, y: number, w: number, h: number) {
    const margin = 0.5;
    const contentX = x + margin;
    const contentY = y + margin;
    const contentW = w - (margin * 2);
    const contentH = h - (margin * 2);

    // Layout: Image 35%, Text 65%
    const imageW = contentW * 0.35;
    const textX = contentX + imageW + 0.2; // gap
    const textW = contentW - imageW - 0.2;

    // Draw Image
    if (data.imageBase64) {
        try {
            // Calculate aspect ratio fit if possible, usually jspdf does this if w/h provided?
            // We just center it in the image box area
            doc.addImage(data.imageBase64, 'JPEG', contentX, contentY, imageW, contentH, undefined, 'FAST');
        } catch (e) {
            console.warn('Image add failed', e);
        }
    }

    // Draw Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);

    // Text wrapping
    const lines = doc.splitTextToSize(data.title, textW);
    doc.text(lines, textX, contentY + 0.5);

    // Draw Source
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`SOURCE: ${data.source}`, textX, contentY + 0.5 + (lines.length * 0.4) + 0.3);
    doc.setTextColor(0);
}
