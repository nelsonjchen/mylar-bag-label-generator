'use client';

import React from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { LabelPdf } from './LabelPdf';

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
    return (
        <div style={{ height: '800px', border: '1px solid #e5e5e5', borderRadius: '8px', overflow: 'hidden' }}>
            <PDFViewer width="100%" height="100%" showToolbar={true}>
                <LabelPdf data={data} />
            </PDFViewer>
        </div>
    );
}
