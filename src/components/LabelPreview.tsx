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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <a
                    href={instance.url!}
                    download={`label-${data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`}
                    style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#000',
                        color: '#fff',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontSize: '14px',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download PDF
                </a>
            </div>

            <div style={{ height: '800px', border: '1px solid #e5e5e5', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#525659' }}>
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
        </div>
    );
}
