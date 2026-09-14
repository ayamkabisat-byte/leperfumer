'use client';

import { useEffect, useState } from 'react';

const MODELS = [
  { value: 'gemini-3.8-flash', label: 'Gemini 3.8 Flash', note: 'Recommended · latest stable' },
  { value: 'gemini-3.7-flash', label: 'Gemini 3.7 Flash', note: 'Stable fallback' },
  { value: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash', note: 'Stable compatibility' },
];

export default function SettingsPage() {
  const [geminiKey, setGeminiKey] = useState('');
  const [galleryToken, setGalleryToken] = useState('');
  const [model, setModel] = useState('gemini-3.8-flash');
  const [showSecrets, setShowSecrets] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const legacyKey = localStorage.getItem('gemini_user_key') || '';
    setGeminiKey(localStorage.getItem('leperfumer_gemini_key') || legacyKey);
    setGalleryToken(localStorage.getItem('leperfumer_gallery_token') || '');
    setModel(localStorage.getItem('leperfumer_ai_model') || 'gemini-3.8-flash');
  }, []);

  const save = () => {
    const key = geminiKey.trim();
    const token = galleryToken.trim();
    if (key) localStorage.setItem('leperfumer_gemini_key', key); else localStorage.removeItem('leperfumer_gemini_key');
    if (token) localStorage.setItem('leperfumer_gallery_token', token); else localStorage.removeItem('leperfumer_gallery_token');
    localStorage.setItem('leperfumer_ai_model', model);
    localStorage.removeItem('gemini_user_key');
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  const clearSecrets = () => {
    localStorage.removeItem('leperfumer_gemini_key');
    localStorage.removeItem('leperfumer_gallery_token');
    localStorage.removeItem('gemini_user_key');
    setGeminiKey('');
    setGalleryToken('');
  };

  return (
    <main className="site-shell pb-24">
      <section className="hero" style={{ gridTemplateColumns: '1fr' }}>
        <div>
          <div className="eyebrow">Atelier configuration</div>
          <h1 className="display-title">Settings.</h1>
          <p className="hero-copy">Pilih model AI dan simpan kredensial BYOK hanya pada browser ini. Server key tetap menjadi fallback bila field Gemini dikosongkan.</p>
        </div>
      </section>

      <div className="grid lg:grid-cols-[1fr_.7fr] gap-4 max-w-5xl">
        <section className="atelier-panel">
          <div className="panel-kicker">AI engine</div>
          <label className="block mb-5">
            <span className="eyebrow block mb-2">Model</span>
            <select className="field" value={model} onChange={(event) => setModel(event.target.value)}>
              {MODELS.map((item) => <option key={item.value} value={item.value}>{item.label} — {item.note}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="eyebrow block mb-2">Google Gemini API key · optional</span>
            <input className="field font-mono-lab text-[12px]" type={showSecrets ? 'text' : 'password'} value={geminiKey} onChange={(event) => setGeminiKey(event.target.value)} placeholder="AIza…" autoComplete="off" />
          </label>
          <p className="mt-2 text-[11px] leading-5" style={{ color: 'var(--muted)' }}>Kosongkan untuk memakai GEMINI_API_KEY milik server. Key BYOK dikirim ke route server lalu diteruskan ke Google melalui header, bukan URL query.</p>

          <div className="mt-7 pt-6" style={{ borderTop: '1px solid var(--line)' }}>
            <label className="block">
              <span className="eyebrow block mb-2">Archive upload token</span>
              <input className="field font-mono-lab text-[12px]" type={showSecrets ? 'text' : 'password'} value={galleryToken} onChange={(event) => setGalleryToken(event.target.value)} placeholder="Same value as GALLERY_UPLOAD_TOKEN" autoComplete="off" />
            </label>
            <p className="mt-2 text-[11px] leading-5" style={{ color: 'var(--muted)' }}>Wajib untuk deployment production. Nilainya harus sama dengan GALLERY_UPLOAD_TOKEN di environment server.</p>
          </div>

          <div className="flex flex-wrap gap-2 mt-7">
            <button className="primary-button px-6 py-3 text-[11px] uppercase tracking-[0.1em]" onClick={save}>{saved ? 'Saved ✓' : 'Save settings'}</button>
            <button className="soft-button px-5 py-3 text-[11px]" onClick={() => setShowSecrets((value) => !value)}>{showSecrets ? 'Hide secrets' : 'Show secrets'}</button>
            <button className="ghost-button px-5 py-3 text-[11px]" onClick={clearSecrets}>Clear secrets</button>
          </div>
        </section>

        <aside className="atelier-panel h-fit">
          <div className="panel-kicker">Security notes</div>
          <div className="space-y-5 text-[12px] leading-6" style={{ color: 'var(--paper-soft)' }}>
            <p><strong style={{ color: 'var(--paper)' }}>AI output is structured JSON.</strong><br/>UI tidak lagi menyuntik HTML hasil model ke DOM.</p>
            <p><strong style={{ color: 'var(--paper)' }}>Local storage is convenience, not a vault.</strong><br/>Gunakan key dengan quota/restriction dan hapus dari browser yang bukan milik Anda.</p>
            <p><strong style={{ color: 'var(--paper)' }}>Archive writes are protected.</strong><br/>Service role Supabase tetap server-side dan route upload membutuhkan token pada production.</p>
          </div>
          <a className="soft-button block mt-7 px-4 py-3 text-center text-[11px] no-underline" style={{ color: 'var(--paper-soft)' }} href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">Open Google AI Studio ↗</a>
        </aside>
      </div>
    </main>
  );
}
