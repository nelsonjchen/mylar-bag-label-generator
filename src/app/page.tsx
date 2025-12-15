'use client';


import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the PDF Preview wrapper with SSR disabled
// This isolates all @react-pdf/renderer imports to the client side only
const LabelPreview = dynamic(() => import('../components/LabelPreview'), {
  ssr: false,
  loading: () => (
    <div style={{ padding: '2rem', textAlign: 'center', background: '#f4f4f5', borderRadius: '8px' }}>
      <p>Loading PDF Generator...</p>
    </div>
  ),
});

interface ProductData {
  title: string;
  image: string;
  source: string;
  url: string;
  color?: string;
  colorImage?: string;
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [data, setData] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    // ... existing logic ...
    if (!url) return;

    setLoading(true);
    setError('');
    setData(null);

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Failed to fetch data');
      }

      setData(json);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      {/* ... header and preview area ... */}
      <div className="no-print">
        <header className="header">
          <h1>Mylar Bag Label Generator</h1>
          <p>Generate professional labels for your filament storage.</p>
        </header>

        <div className="card">
          <div className="input-group">
            <input
              type="text"
              placeholder="Paste Bambu Store URL here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <button onClick={handleGenerate} disabled={loading}>
              {loading ? 'Gener...' : 'Generate'}
            </button>
          </div>

          <div style={{ marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--muted-foreground)', marginRight: '0.5rem' }}>No URL handy?</span>
            <button
              onClick={() => setUrl('https://us.store.bambulab.com/products/pla-silk-upgrade?variant=564681970696351763')}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
                height: 'auto',
                padding: '0.4rem 0.8rem',
                fontSize: '0.8rem'
              }}
            >
              Load Demo URL
            </button>
          </div>

          {error && (
            <div style={{ color: 'var(--destructive)', marginTop: '0.5rem' }}>
              Error: {error}
            </div>
          )}
        </div>
      </div>

      {/* Preview / Print Area */}
      {data && (
        <div className="preview-area" style={{ marginTop: '2rem' }}>
          <div className="no-print" style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Preview & Print</h2>
            <p style={{ fontSize: '0.9rem', color: '#888' }}>
              The PDF below is print-ready. Use the print button in the PDF toolbar.
            </p>
          </div>

          <LabelPreview data={data} />
        </div>
      )}
    </main>
  );
}

