import Link from 'next/link';
import './globals.css';

export const metadata = {
  title: 'Le Parfumeur — Laboratorium Aroma',
  description: 'Laboratorium parfum AI. Database 1.800+ notes.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
        <nav className="sticky top-0 z-50 backdrop-blur-md"
          style={{ background: 'rgba(12,13,15,0.82)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">
            <Link href="/"
              className="font-serif-lab text-xl font-normal flex items-center gap-2"
              style={{ letterSpacing: '0.04em', color: '#e8e6e0' }}>
              <span className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-full"
                style={{ border: '1.5px solid oklch(72% 0.18 68)', opacity: 0.85 }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <circle cx="5" cy="5" r="4" stroke="oklch(72% 0.18 68)" strokeWidth="1.2" fill="none"/>
                  <circle cx="5" cy="5" r="1.5" fill="oklch(72% 0.18 68)" opacity="0.7"/>
                </svg>
              </span>
              Le Parfumeur
            </Link>

            <div className="flex gap-7 font-mono-lab uppercase"
              style={{ fontSize: '13px', letterSpacing: '0.06em' }}>
              <Link href="/"         className="nav-link" style={{ color: '#7a7872', textDecoration: 'none' }}>Racik</Link>
              <Link href="/gallery"  className="nav-link" style={{ color: '#7a7872', textDecoration: 'none' }}>Galeri</Link>
              <Link href="/settings" className="nav-link" style={{ color: '#7a7872', textDecoration: 'none' }}>Setelan</Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}