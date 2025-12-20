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

    const handleDownload = () => {
        if (!instance.url) return;
        
        const link = document.createElement('a');
        link.href = instance.url;
        link.download = `label-${new Date().getTime()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div>
            <div className="no-print" style={{ 
                marginBottom: '1rem', 
                display: 'flex', 
                gap: '1rem',
                justifyContent: 'flex-start',
                alignItems: 'center'
            }}>
                <button
                    onClick={handleDownload}
                    aria-label="Download PDF file"
                    style={{
                        backgroundColor: 'var(--foreground)',
                        color: 'var(--background)',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '6px',
                        border: 'none',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <span aria-hidden="true">⬇️</span>
                    Download PDF
                </button>
                <span style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>
                    Or use the print button in the PDF viewer below
                </span>
            </div>
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
        </div>
    );
}
