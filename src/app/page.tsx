'use client';


import { useState } from 'react';
import dynamic from 'next/dynamic';
import QRCode from 'qrcode';

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
  imageBase64?: string;
  source: string;
  url: string;
  color?: string;
  colorImage?: string;
  qrCodeBase64?: string;
}

export default function Home() {
  const [mode, setMode] = useState<'url' | 'manual'>('url');

  // Manual Input State
  const [manualTitle, setManualTitle] = useState('');
  const [manualColor, setManualColor] = useState('');
  const [manualBrand, setManualBrand] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  const [manualImage, setManualImage] = useState<string>('');

  const [url, setUrl] = useState('');
  const [labelQuantity, setLabelQuantity] = useState(2);
  const [data, setData] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setManualImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManualGenerate = async () => {
    if (!manualTitle) {
      setError('Product Name is required');
      return;
    }

    setLoading(true);
    setError('');
    setData(null);

    try {
      let qrCodeBase64 = '';
      if (manualUrl) {
        qrCodeBase64 = await QRCode.toDataURL(manualUrl, { width: 100, margin: 0 });
      }

      setData({
        title: manualTitle,
        color: manualColor,
        source: manualBrand,
        image: manualImage, // base64 directly
        imageBase64: manualImage,
        url: manualUrl || '',
        qrCodeBase64
      });
    } catch (err: any) {
      setError(err.message || 'Failed to generate label');
    } finally {
      setLoading(false);
    }
  };

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

      // Generate QR Code
      const qrCodeBase64 = await QRCode.toDataURL(json.url, { width: 100, margin: 0 });

      setData({ ...json, qrCodeBase64 });
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
          <p>
            Generate professional labels for your filament storage.
          </p>
          {mode === 'url' && (
            <p style={{
              fontSize: '0.8rem',
              color: 'var(--muted-foreground)',
              marginTop: '0.5rem',
              backgroundColor: 'rgba(255, 165, 0, 0.1)',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              display: 'inline-block',
              border: '1px solid rgba(255, 165, 0, 0.2)'
            }}>
              ⚠️ Currently supports Bambu Lab store URLs only for auto-scraping
            </p>
          )}
        </header>

        <div className="card">
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <button
              onClick={() => { setMode('url'); setError(''); }}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: mode === 'url' ? '2px solid var(--foreground)' : '2px solid transparent',
                color: mode === 'url' ? 'var(--foreground)' : 'var(--muted-foreground)',
                fontWeight: mode === 'url' ? 'bold' : 'normal',
                cursor: 'pointer',
                padding: '0.5rem'
              }}
            >
              Bambu URL
            </button>
            <button
              onClick={() => { setMode('manual'); setError(''); }}
              style={{
                background: 'none',
                border: 'none',
                borderBottom: mode === 'manual' ? '2px solid var(--foreground)' : '2px solid transparent',
                color: mode === 'manual' ? 'var(--foreground)' : 'var(--muted-foreground)',
                fontWeight: mode === 'manual' ? 'bold' : 'normal',
                cursor: 'pointer',
                padding: '0.5rem'
              }}
            >
              Manual Input
            </button>
          </div>

          {/* Label Quantity Settings */}
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '0 0.5rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--foreground)' }}>Labels per page:</span>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--foreground)' }}>
                <input
                  type="radio"
                  name="labelQuantity"
                  checked={labelQuantity === 1}
                  onChange={() => setLabelQuantity(1)}
                  style={{ accentColor: 'var(--foreground)' }}
                />
                <span style={{ fontSize: '0.9rem' }}>1 Label for one side of bag</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--foreground)' }}>
                <input
                  type="radio"
                  name="labelQuantity"
                  checked={labelQuantity === 2}
                  onChange={() => setLabelQuantity(2)}
                  style={{ accentColor: 'var(--foreground)' }}
                />
                <span style={{ fontSize: '0.9rem' }}>2 Labels for both sides of bag</span>
              </label>
            </div>
          </div>

          {mode === 'url' ? (
            <>
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
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Filament Name <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="e.g. PLA Basic"
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Color</label>
                  <input
                    type="text"
                    value={manualColor}
                    onChange={(e) => setManualColor(e.target.value)}
                    placeholder="e.g. Red"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Brand</label>
                  <input
                    type="text"
                    value={manualBrand}
                    onChange={(e) => setManualBrand(e.target.value)}
                    placeholder="e.g. Sunlu"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Product Image (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid var(--border)', borderRadius: '4px' }}
                />
                {manualImage && <p style={{ fontSize: '0.8rem', color: 'green', marginTop: '0.25rem' }}>Image loaded ✓</p>}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Product URL (for QR Code)</label>
                <input
                  type="text"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  placeholder="https://..."
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}
                />
              </div>

              <button
                onClick={handleManualGenerate}
                disabled={loading}
                style={{
                  marginTop: '0.5rem',
                  backgroundColor: 'var(--foreground)',
                  color: 'var(--background)',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: 'none',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                {loading ? 'Generating...' : 'Generate Label'}
              </button>
            </div>
          )}

          {error && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              backgroundColor: '#FEF2F2', // Red-50
              border: '1px solid #F87171', // Red-400
              borderRadius: '8px',
              color: '#991B1B', // Red-800
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>🚫</span>
              <div>
                <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#7F1D1D' }}>Unable to Generate Label</strong>
                <span style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>{error}</span>
              </div>
            </div>
          )}
        </div>

        <div className="card" style={{ marginTop: '1.5rem', borderTop: '4px solid var(--foreground)' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Recommended Supplies</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* Mylar Bags */}
            <a
              href="https://amzn.to/4qvoRvt"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                transition: 'border-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--foreground)'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: '1.3' }}>1.5 Gallon Mylar Bags</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>For 1KG spools w/ desiccant</p>
              <div style={{ fontSize: '0.8rem', color: '#ea580c', fontWeight: 500, marginTop: 'auto', paddingTop: '0.5rem' }}>View on Amazon &rarr;</div>
            </a>

            {/* Labels */}
            <a
              href="https://amzn.to/3N1ngPb"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                transition: 'border-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--foreground)'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, lineHeight: '1.3' }}>Half Sheet Labels</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>Self-adhesive, size optimized</p>
              <div style={{ fontSize: '0.8rem', color: '#ea580c', fontWeight: 500, marginTop: 'auto', paddingTop: '0.5rem' }}>View on Amazon &rarr;</div>
            </a>
          </div>
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

          <LabelPreview data={data} quantity={labelQuantity} />
        </div>
      )}
    </main>
  );
}

