import type { Metadata } from 'next';
import Link from 'next/link';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import './globals.css';
import './warm-bento-v2.css';
import './nocturne.css';

export const metadata: Metadata = {
  title: 'Le Parfumeur — Olfactory Atelier',
  description: 'Racik formula aroma, analisis dengan AI, dan arsipkan konsep parfum Anda.',
};

const themeBootstrap = `
(function () {
  try {
    var stored = localStorage.getItem('leperfumer_theme');
    var preference = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
    var dark = preference === 'dark' || (preference === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    var root = document.documentElement;
    root.dataset.themePreference = preference;
    root.dataset.theme = dark ? 'dark' : 'light';
    root.style.colorScheme = dark ? 'dark' : 'light';
  } catch (_) {}
})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
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
            <div className="nav-actions">
              <div className="nav-links flex items-center gap-6 md:gap-8 text-[11px]">
                <Link href="/" className="nav-link">Compose</Link>
                <Link href="/gallery" className="nav-link">Archive</Link>
                <Link href="/settings" className="nav-link">Settings</Link>
              </div>
              <ThemeSwitcher />
            </div>
          </nav>
        </div>
        {children}
      </body>
    </html>
  );
}
