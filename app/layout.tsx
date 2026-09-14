import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Le Parfumeur — Olfactory Atelier',
  description: 'Racik formula aroma, analisis dengan AI, dan arsipkan konsep parfum Anda.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Space+Grotesk:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="app-nav-wrap">
          <nav className="app-nav site-shell flex items-center justify-between px-5 md:px-6">
            <Link href="/" className="flex items-center gap-3 no-underline" style={{ color: 'var(--paper)' }}>
              <span className="brand-mark" aria-hidden="true" />
              <span className="brand-name font-serif-lab text-[22px] tracking-[0.02em]">Le Parfumeur</span>
            </Link>
            <div className="nav-links flex items-center gap-7 font-mono-lab uppercase text-[11px] tracking-[0.1em]">
              <Link href="/" className="nav-link">Atelier</Link>
              <Link href="/gallery" className="nav-link">Archive</Link>
              <Link href="/settings" className="nav-link">Settings</Link>
            </div>
          </nav>
        </div>
        {children}
      </body>
    </html>
  );
}
