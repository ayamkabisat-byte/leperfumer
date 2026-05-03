import Link from 'next/link';
import './globals.css';

export const metadata = {
  title: 'Le Parfumeur',
  description: 'Laboratorium parfum AI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-[#faf9f6] dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
        <nav className="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-6xl mx-auto flex justify-between items-center p-4">
            <Link href="/" className="text-xl font-serif font-bold flex items-center gap-2">
              <span>🧪</span> Le Parfumeur
            </Link>
            <div className="space-x-4 text-sm font-medium">
              <Link href="/" className="hover:underline">Racik</Link>
              <Link href="/gallery" className="hover:underline">Galeri</Link>
              <Link href="/settings" className="hover:underline">Setelan</Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}