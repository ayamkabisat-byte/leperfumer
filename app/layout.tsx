import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import './warm-bento-v2.css';

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
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Space+Grotesk:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div className="app-nav-wrap">
          <nav className="app-nav site-shell flex items-center justify-between px-4 md:px-6">
            <Link href="/" className="flex items-center gap-3 no-underline">
              <span className="brand-mark" aria-hidden="true" />
              <span>
                <span className="brand-name font-serif-lab text-[24px] leading-none tracking-[-0.02em] block">Le Parfumeur</span>
                <span className="hidden md:block font-mono-lab text-[6px] uppercase tracking-[.24em] mt-1" style={{color:'var(--muted)'}}>Olfactory atelier</span>
              </span>
            </Link>
            <div className="nav-links flex items-center gap-6 md:gap-8 text-[11px]">
              <Link href="/" className="nav-link">Compose</Link>
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
