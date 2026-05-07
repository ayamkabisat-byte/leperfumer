'use client';

import { useState, useEffect } from 'react';

const AMBER = 'oklch(72% 0.18 68)';

export default function SettingsPage() {
  const [geminiKey, setGeminiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('gemini_user_key');
    if (stored) setGeminiKey(stored);
  }, []);

  const handleSave = () => {
    localStorage.setItem('gemini_user_key', geminiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleClear = () => {
    localStorage.removeItem('gemini_user_key');
    setGeminiKey('');
  };

  return (
    <main className="max-w-lg mx-auto px-5 pb-20">
      <header className="text-center pt-16 pb-10">
        <h1 className="font-serif-lab font-light"
          style={{ fontSize: 'clamp(36px, 6vw, 52px)', letterSpacing: '0.04em',
            background: `linear-gradient(135deg, ${AMBER} 0%, #e8e6e0 100%)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Setelan
        </h1>
        <p className="font-mono-lab uppercase mt-2" style={{ fontSize: 11, letterSpacing: '0.14em', color: '#7a7872' }}>
          Konfigurasi laboratorium
        </p>
      </header>

      <div className="panel-lab p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full" style={{ background: AMBER, boxShadow: `0 0 8px ${AMBER}` }}></div>
          <span className="font-mono-lab uppercase" style={{ fontSize: 10, letterSpacing: '0.16em', color: '#7a7872' }}>
            Google Gemini API Key
          </span>
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }}></div>
        </div>

        <div className="relative mb-3">
          <input type={showKey ? 'text' : 'password'}
            value={geminiKey} onChange={e => setGeminiKey(e.target.value)}
            placeholder="AIza..."
            className="w-full px-4 py-3 pr-12 rounded-xl outline-none font-mono-lab"
            style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.08)',
              color: '#e8e6e0', fontSize: 13, letterSpacing: geminiKey && !showKey ? '0.2em' : '0.04em' }}/>
          <button onClick={() => setShowKey(v => !v)} type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7a7872' }}>
            {showKey ? '🙈' : '👁'}
          </button>
        </div>

        <p className="font-mono-lab mb-5" style={{ fontSize: 10, color: '#7a7872', lineHeight: 1.6, letterSpacing: '0.04em' }}>
          Jika dikosongkan, aplikasi menggunakan key server bawaan.<br/>
          Key disimpan di browser Anda (localStorage).
        </p>

        <div className="flex gap-3">
          <button onClick={handleSave}
            className="flex-1 py-3 rounded-xl font-mono-lab uppercase transition"
            style={{ fontSize: 11, letterSpacing: '0.12em',
              background: saved ? 'rgba(60,180,100,0.15)' : 'linear-gradient(135deg, rgba(200,150,50,0.15), rgba(140,80,200,0.1))',
              border: saved ? '1px solid rgba(60,180,100,0.4)' : '1px solid rgba(200,150,60,0.4)',
              color: '#e8e6e0', cursor: 'pointer' }}>
            {saved ? '✓ Tersimpan' : 'Simpan Key'}
          </button>
          {geminiKey && (
            <button onClick={handleClear}
              className="px-5 py-3 rounded-xl font-mono-lab uppercase"
              style={{ fontSize: 11, letterSpacing: '0.12em',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                color: '#7a7872', cursor: 'pointer' }}>
              Hapus
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl px-5 py-4 font-mono-lab"
        style={{ background: 'rgba(180,130,60,0.05)', border: '1px solid rgba(180,130,60,0.12)',
          fontSize: 10, color: '#7a7872', lineHeight: 1.7, letterSpacing: '0.04em' }}>
        Dapatkan API key gratis di{' '}
        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer"
          style={{ color: AMBER, textDecoration: 'underline' }}>aistudio.google.com</a>
      </div>
    </main>
  );
}