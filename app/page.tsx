'use client';

import { useState } from 'react';
import { getRandomRecipe, type Recipe } from '@/lib/perfumeDB';

const AMBER  = 'oklch(72% 0.18 68)';
const PURPLE = 'oklch(72% 0.18 300)';
const BLUE   = 'oklch(72% 0.18 228)';

export default function GeneratorPage() {
  const [counts, setCounts] = useState({ top: 2, mid: 3, base: 2 });
  const [includeSynth, setIncludeSynth] = useState({ top: false, mid: false, base: false });
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [promptText, setPromptText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const sliderPct = (val: number) => `${((val - 1) / 9 * 100).toFixed(1)}%`;

  const handleGenerate = () => {
    setAiResult('');
    setPromptText('');
    setErrorMsg('');
    setUploadStatus('');
    setRecipe(getRandomRecipe(counts, includeSynth));
  };

  const analyzePerfume = async () => {
    if (!recipe) return;
    setAiLoading(true);
    setErrorMsg('');
    const userKey = localStorage.getItem('gemini_user_key') || '';
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(userKey ? { 'X-Gemini-Key': userKey } : {}) },
        body: JSON.stringify({
          topNotes:  recipe.top.map(n => n.name),
          midNotes:  recipe.mid.map(n => n.name),
          baseNotes: recipe.base.map(n => n.name),
        }),
      });
      const data = await res.json();
      if (data.error) { setErrorMsg(data.error); return; }
      setAiResult(data.html);
      setPromptText(data.promptText || '');
    } catch (err: any) {
      setErrorMsg(`Gagal memuat AI: ${err.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const copyToClipboard = (text: string, message = 'Berhasil disalin!') => {
    navigator.clipboard.writeText(text).then(() => alert(message)).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta); alert(message);
    });
  };

  const handleUpload = async () => {
    if (!uploadFile || !recipe) return;
    setUploadStatus('Mengunggah...');
    const fd = new FormData();
    fd.append('file', uploadFile);
    fd.append('name', recipe.name);
    fd.append('top_notes',  recipe.top.map(n => n.name).join(', '));
    fd.append('mid_notes',  recipe.mid.map(n => n.name).join(', '));
    fd.append('base_notes', recipe.base.map(n => n.name).join(', '));
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.error) setUploadStatus(`❌ ${data.error}`);
      else { setUploadStatus('✓ Berhasil diunggah ke Galeri!'); setUploadFile(null); }
    } catch (err: any) {
      setUploadStatus(`❌ Error: ${err.message}`);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-5 pb-20">
      {/* Header */}
      <header className="text-center pt-16 pb-12">
        <h1 className="font-serif-lab font-light"
          style={{
            fontSize: 'clamp(42px, 7vw, 72px)',
            letterSpacing: '0.02em',
            lineHeight: 1.1,
            background: `linear-gradient(135deg, ${AMBER} 0%, #e8e6e0 55%, ${PURPLE} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
          Laboratorium Aroma
        </h1>
        <p className="font-mono-lab uppercase mt-3"
          style={{ fontSize: '12px', letterSpacing: '0.12em', color: '#7a7872' }}>
          Database 1.800+ notes · Racik dan bedah mahakarya Anda
        </p>
        <div className="flex items-center justify-center gap-3 mt-5 mx-auto" style={{ width: 200 }}>
          <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${AMBER})` }}></div>
          <div className="w-1 h-1 rounded-full" style={{ background: AMBER }}></div>
          <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${AMBER}, transparent)` }}></div>
        </div>
      </header>

      {/* Formula Panel */}
      <div className="panel-lab p-7 mb-4">
        <div className="flex items-center gap-3 mb-5 font-mono-lab uppercase"
          style={{ fontSize: '11px', letterSpacing: '0.18em', color: '#7a7872' }}>
          Formula
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.14)' }}></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          {(['top','mid','base'] as const).map(layer => {
            const color = layer === 'top' ? AMBER : layer === 'mid' ? PURPLE : BLUE;
            return (
              <div key={layer}>
                <label className="flex justify-between items-baseline mb-2.5 font-mono-lab uppercase"
                  style={{ fontSize: '11px', letterSpacing: '0.12em', color: '#b0aca4' }}>
                  <span>{layer === 'mid' ? 'Mid' : layer.charAt(0).toUpperCase() + layer.slice(1)} Notes</span>
                  <span className="font-serif-lab font-light" style={{ fontSize: '20px', color: '#e8e6e0' }}>
                    {counts[layer]}
                  </span>
                </label>

                <input
                  type="range" min="1" max="10" value={counts[layer]}
                  onChange={e => setCounts({ ...counts, [layer]: parseInt(e.target.value) })}
                  className={`lab-slider ${layer === 'mid' ? 'mid' : layer === 'base' ? 'base' : ''} mb-3`}
                  style={{ ['--pct' as any]: sliderPct(counts[layer]) }}
                />

                <label
                  onClick={() => setIncludeSynth({ ...includeSynth, [layer]: !includeSynth[layer] })}
                  className="flex items-center gap-2 cursor-pointer rounded-lg px-3 py-1.5 transition"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <div className="relative rounded-full transition-colors"
                    style={{
                      width: 28, height: 15,
                      background: includeSynth[layer] ? `${color}40` : 'rgba(255,255,255,0.1)',
                    }}>
                    <div className="absolute rounded-full transition-transform"
                      style={{
                        top: 2, left: 2, width: 11, height: 11,
                        background: includeSynth[layer] ? color : '#7a7872',
                        transform: includeSynth[layer] ? 'translateX(13px)' : 'translateX(0)',
                      }}></div>
                  </div>
                  <span className="font-mono-lab uppercase" style={{ fontSize: '10px', letterSpacing: '0.08em', color: '#7a7872' }}>
                    + Sintetis &amp; Unik
                  </span>
                </label>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleGenerate}
          className="block mx-auto px-8 py-3.5 rounded-full font-mono-lab uppercase transition-all hover:-translate-y-px"
          style={{
            fontSize: '12px', letterSpacing: '0.14em',
            background: 'linear-gradient(135deg, rgba(200,150,50,0.12), rgba(160,100,220,0.08))',
            border: '1px solid rgba(200,150,60,0.4)',
            color: '#e8e6e0',
            boxShadow: '0 0 0 rgba(200,150,60,0)',
            cursor: 'pointer',
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 24px rgba(200,150,60,0.18)'; e.currentTarget.style.borderColor = 'rgba(200,150,60,0.7)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 0 rgba(200,150,60,0)'; e.currentTarget.style.borderColor = 'rgba(200,150,60,0.4)'; }}
        >
          ✦ &nbsp; Putar Roda Aroma
        </button>
      </div>

      {/* Recipe */}
      {recipe && (
        <div className="animate-fade-in">
          <div className="text-center pt-9 pb-7">
            <h2 className="font-serif-lab font-light"
              style={{ fontSize: 'clamp(28px, 5vw, 44px)', letterSpacing: '0.06em', color: '#e8e6e0' }}>
              {recipe.name}
            </h2>
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: AMBER, boxShadow: `0 0 8px ${AMBER}` }}></div>
              <div className="w-6 h-px" style={{ background: 'rgba(255,255,255,0.14)' }}></div>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: PURPLE, boxShadow: `0 0 8px ${PURPLE}` }}></div>
              <div className="w-6 h-px" style={{ background: 'rgba(255,255,255,0.14)' }}></div>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: BLUE, boxShadow: `0 0 8px ${BLUE}` }}></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-6">
            <NotesCard title="Top Notes"   items={recipe.top}  color={AMBER}  label="top"/>
            <NotesCard title="Heart Notes" items={recipe.mid}  color={PURPLE} label="heart"/>
            <NotesCard title="Base Notes"  items={recipe.base} color={BLUE}   label="base"/>
          </div>

          <div className="flex justify-center pt-5 pb-2">
            <button
              onClick={analyzePerfume}
              disabled={aiLoading}
              className="flex items-center gap-2.5 px-7 py-3 rounded-xl font-mono-lab uppercase transition-all hover:-translate-y-px disabled:opacity-50"
              style={{
                fontSize: '11px', letterSpacing: '0.12em',
                background: 'linear-gradient(135deg, rgba(120,60,200,0.15), rgba(80,120,220,0.1))',
                border: '1px solid rgba(140,80,220,0.4)',
                color: '#e8e6e0',
                cursor: aiLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {aiLoading ? (
                <div className="w-4 h-4 rounded-full spin-lab"
                  style={{ border: '2px solid rgba(255,255,255,0.15)', borderTopColor: PURPLE }}></div>
              ) : (
                <span className="inline-flex items-center justify-center rounded-md text-white font-bold"
                  style={{
                    width: 20, height: 20, fontSize: 9,
                    background: `linear-gradient(135deg, ${PURPLE}, ${BLUE})`,
                  }}>AI</span>
              )}
              {aiLoading ? 'Menganalisis...' : 'Bedah Aroma dengan AI'}
            </button>
          </div>

          {errorMsg && (
            <p className="text-center mt-3 font-mono-lab" style={{ fontSize: 12, color: 'oklch(70% 0.18 25)' }}>
              {errorMsg}
            </p>
          )}

          {/* AI Result */}
          {aiResult && (
            <div className="animate-fade-in mt-4">
              <Divider label="Analisis AI" />
              <div className="panel-lab p-7">
                <div className="flex items-center gap-3 mb-5 font-mono-lab uppercase"
                  style={{ fontSize: '11px', letterSpacing: '0.18em', color: '#7a7872' }}>
                  Bedah Aroma
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.14)' }}></div>
                </div>
                <div className="ai-content" style={{ color: '#b0aca4', fontSize: 14, lineHeight: 1.75 }}
                  dangerouslySetInnerHTML={{ __html: aiResult }} />
              </div>

              {promptText && (
                <>
                  <Divider label="Prompt Visualisasi" />
                  <div className="panel-lab p-6">
                    <div className="flex items-center gap-3 mb-4 font-mono-lab uppercase"
                      style={{ fontSize: '11px', letterSpacing: '0.18em', color: '#7a7872' }}>
                      Moodboard Prompt
                      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.14)' }}></div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 items-start">
                      <div className="flex-1 rounded-lg px-4 py-3.5 font-mono-lab"
                        style={{
                          background: 'rgba(0,0,0,0.3)',
                          border: '1px solid rgba(255,255,255,0.07)',
                          fontSize: 11, lineHeight: 1.65, color: '#b0aca4',
                          letterSpacing: '0.03em', minHeight: 90, wordBreak: 'break-word',
                        }}>
                        {promptText}
                      </div>
                      <button
                        onClick={() => copyToClipboard(promptText, 'Prompt moodboard disalin!')}
                        className="px-4 py-2.5 rounded-lg font-mono-lab uppercase whitespace-nowrap transition"
                        style={{
                          fontSize: 10, letterSpacing: '0.1em',
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.14)',
                          color: '#b0aca4', cursor: 'pointer',
                        }}>
                        Salin Prompt
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Upload */}
              <Divider label="Simpan ke Galeri" />
              <div className="panel-lab p-7 text-center">
                <div className="mx-auto mb-4 flex items-center justify-center rounded-2xl"
                  style={{
                    width: 48, height: 48,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1.5px solid rgba(255,255,255,0.14)',
                  }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b0aca4" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M12 16V4m0 0L8 8m4-4l4 4"/>
                    <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"/>
                  </svg>
                </div>
                <h3 className="font-serif-lab font-light mb-1.5" style={{ fontSize: 24 }}>
                  Simpan Karya ke Galeri
                </h3>
                <p className="font-mono-lab mb-5"
                  style={{ fontSize: 12, color: '#7a7872', letterSpacing: '0.06em' }}>
                  Pilih gambar hasil render prompt Anda dan simpan ke arsip.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-mono-lab uppercase cursor-pointer transition"
                    style={{
                      fontSize: 10, letterSpacing: '0.1em',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.14)',
                      color: '#b0aca4',
                    }}>
                    Choose File
                    <input type="file" accept="image/*"
                      onChange={e => setUploadFile(e.target.files?.[0] || null)}
                      style={{ display: 'none' }} />
                  </label>
                  <span className="font-mono-lab" style={{ fontSize: 10, color: '#7a7872', letterSpacing: '0.06em' }}>
                    {uploadFile ? uploadFile.name : 'No file chosen'}
                  </span>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={!uploadFile}
                  className="px-8 py-3 rounded-lg font-mono-lab uppercase transition disabled:opacity-40"
                  style={{
                    fontSize: 11, letterSpacing: '0.12em',
                    background: 'linear-gradient(135deg, rgba(50,100,200,0.15), rgba(80,60,180,0.1))',
                    border: '1px solid rgba(60,130,220,0.4)',
                    color: '#e8e6e0',
                    cursor: uploadFile ? 'pointer' : 'not-allowed',
                  }}>
                  Unggah Sekarang
                </button>
                {uploadStatus && (
                  <p className="mt-3 font-mono-lab"
                    style={{ fontSize: 11, color: '#b0aca4', letterSpacing: '0.08em' }}>
                    {uploadStatus}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI content custom styles */}
      <style jsx global>{`
        .ai-content h1, .ai-content h2, .ai-content h3 {
          font-family: 'Cormorant Garamond', Georgia, serif;
          color: #e8e6e0;
          margin-top: 20px;
          margin-bottom: 8px;
          font-weight: 400;
        }
        .ai-content h3 { font-size: 18px; }
        .ai-content p  { margin-bottom: 12px; }
        .ai-content ul { padding-left: 20px; margin-bottom: 12px; }
        .ai-content li { margin-bottom: 4px; }
        .ai-content strong { color: #e8e6e0; font-weight: 500; }
      `}</style>
    </main>
  );
}

// ─────────────── Sub-components ───────────────

function NotesCard({ title, items, color, label }: {
  title: string;
  items: { name: string; cat: string }[];
  color: string;
  label: 'top' | 'heart' | 'base';
}) {
  return (
    <div className="rounded-xl p-4 relative overflow-hidden transition"
      style={{
        background: '#181c22',
        border: '1px solid rgba(255,255,255,0.07)',
      }}>
      <div className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}></div>

      <div className="flex items-center gap-2 mb-3 pb-2.5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="w-2.5 h-2.5 rounded-full"
          style={{ background: color, boxShadow: `0 0 10px ${color}` }}></div>
        <span className="font-mono-lab uppercase"
          style={{ fontSize: 10, letterSpacing: '0.14em', color }}>{title}</span>
      </div>

      <ul className="space-y-1.5">
        {items.map((n, i) => (
          <li key={i}
            className="flex justify-between items-baseline py-1.5"
            style={{
              fontSize: 13, color: '#e8e6e0',
              borderBottom: i < items.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
            }}>
            <span>{n.name}</span>
            <span className="font-mono-lab uppercase"
              style={{ fontSize: 9, letterSpacing: '0.08em', color: '#7a7872' }}>{n.cat}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 my-7 font-mono-lab uppercase"
      style={{ fontSize: 9, letterSpacing: '0.16em', color: '#7a7872' }}>
      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }}></div>
      {label}
      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }}></div>
    </div>
  );
}