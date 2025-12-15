'use client';

import React from 'react';
import { usePDF } from '@react-pdf/renderer';
import { LabelPdf } from './LabelPdf';

interface ProductData {
    title: string;
    image: string;
    imageBase64?: string;
    source: string;
    url: string;
    color?: string;
    colorImage?: string;
    qrCodeBase64?: string;
    dryingTemp?: string;
    dryingDuration?: string;
}

interface LabelPreviewProps {
    data: ProductData;
    quantity: number;
}

export default function LabelPreview({ data, quantity }: LabelPreviewProps) {
    const [instance] = usePDF({ document: <LabelPdf data={data} quantity={quantity} /> });

    if (instance.loading) {
        return (
            <div style={{
                height: '800px',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f4f4f5'
            }}>
                <p>Generating PDF...</p>
            </div>
        );
    }

    if (instance.error) {
        return (
            <div style={{
                padding: '2rem',
                color: 'red',
                border: '1px solid red',
                borderRadius: '8px'
            }}>
                Error generating PDF: {instance.error}
            </div>
        );
    }

    return (
        <div style={{ height: '800px', border: '1px solid #e5e5e5', borderRadius: '8px', overflow: 'hidden' }}>
            {instance.url && (
                <iframe
                    src={instance.url}
                    width="100%"
                    height="100%"
                    style={{ border: 'none' }}
                    title="Label Preview"
                />
            )}
        </div>
    );
}
