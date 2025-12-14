'use client';

import { useState } from 'react';

interface ProductData {
  title: string;
  image: string;
  source: string;
  url: string;
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [data, setData] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
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
      {/* Header & Input Section - Hidden when printing */}
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

          {error && (
            <div style={{ color: 'var(--destructive)', marginTop: '0.5rem' }}>
              Error: {error}
            </div>
          )}
        </div>
      </div>

      {/* Preview / Print Area */}
      {data && (
        <div className="print-area preview-area">
          <div className="no-print" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Preview</h2>
            <button onClick={() => window.print()}>🖨️ Print Labels</button>
          </div>

          <div className="label-preview-container">
            {/* Label 1 */}
            <LabelView data={data} />

            {/* Label 2 */}
            <LabelView data={data} />
          </div>
        </div>
      )}
    </main>
  );
}

function LabelView({ data }: { data: ProductData }) {
  return (
    <div className="label">
      {data.image && (
        <img src={data.image} alt={data.title} crossOrigin="anonymous" />
      )}
      <h2>{data.title}</h2>
      <div className="source">Source: {data.source}</div>
    </div>
  );
}
