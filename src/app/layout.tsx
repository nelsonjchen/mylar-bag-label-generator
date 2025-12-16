import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mylar Bag Label Generator",
  description: "Generate professional filament labels for your Mylar bags from Bambu Store URLs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <footer className="no-print" style={{ textAlign: 'center', padding: '2rem 1rem', fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
          <a
            href="https://github.com/nelsonjchen/mylar-bag-label-generator"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'inherit', textDecoration: 'underline', textUnderlineOffset: '4px' }}
          >
            View source on GitHub
          </a>
        </footer>
      </body>
    </html>
  );
}
