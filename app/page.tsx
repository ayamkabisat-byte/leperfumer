'use client';

import { useState, useMemo } from 'react';
import {
  getRandomRecipeWithLocks,
  FULL_DATABASE,
  type Recipe,
  type Note,
} from '@/lib/perfumeDB';

const AMBER  = 'oklch(72% 0.18 68)';
const PURPLE = 'oklch(72% 0.18 300)';
const BLUE   = 'oklch(72% 0.18 228)';

type Layer = 'top' | 'mid' | 'base';

export default function GeneratorPage() {
  const [counts, setCounts] = useState({ top: 2, mid: 3, base: 2 });
  const [includeSynth, setIncludeSynth] = useState({ top: false, mid: false, base: false });
  const [locked, setLocked] = useState<{ top: Note[]; mid: Note[]; base: Note[] }>({ top: [], mid: [], base: [] });
  const [pickerOpen, setPickerOpen] = useState<Layer | null>(null);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [promptText, setPromptText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState('');

  // State untuk Input Bulk (Manual Copy Paste)
  const [bulkTop, setBulkTop] = useState('');
  const [bulkMid, setBulkMid] = useState('');
  const [bulkBase, setBulkBase] = useState('');

  const sliderPct = (val: number) => `${((val - 1) / 9 * 100).toFixed(1)}%`;

  const toggleLock = (layer: Layer, note: Note) => {
    setLocked(prev => {
      const exists = prev[layer].some(n => n.name === note.name);
      if (exists) return { ...prev, [layer]: prev[layer].filter(n => n.name !== note.name) };
      if (prev[layer].length >= counts[layer]) return prev; // max reached
      return { ...prev, [layer]: [...prev[layer], note] };
    });
  };

  // Add a custom note from free text
  const addCustomNote = (layer: Layer, noteName: string) => {
    const name = noteName.trim();
    if (!name) return;
    if (locked[layer].length >= counts[layer]) return;
    const customNote: Note = {
      name,
      cat: 'Custom',
      layers: [layer],
    };
    toggleLock(layer, customNote);
  };

  const clearLocks = (layer: Layer) => setLocked(prev => ({ ...prev, [layer]: [] }));

  // Fungsi untuk memproses teks input manual
  const handleBulkInput = () => {
    const newLocked = { ...locked };
    const newCounts = { ...counts };

    const processLayer = (layer: Layer, text: string) => {
      if (!text.trim()) return;
      const names = text.split(/[,&\n]/).map(n => n.trim()).filter(n => n);

      names.forEach(name => {
        // Cek apakah note sudah ada di array locked agar tidak duplikat
        if (!newLocked[layer].some(n => n.name.toLowerCase() === name.toLowerCase())) {
          newLocked[layer] = [...newLocked[layer], { name, cat: 'Custom', layers: [layer] }];
        }
      });

      // Otomatis menaikkan batas slider jika notes yang di-paste melebihi jumlah slider saat ini
      if (newLocked[layer].length > newCounts[layer]) {
        newCounts[layer] = Math.min(10, newLocked[layer].length); // max 10
        if (newLocked[layer].length > 10) {
          newLocked[layer] = newLocked[layer].slice(0, 10);
        }
      }
    };

    processLayer('top', bulkTop);
    processLayer('mid', bulkMid);
    processLayer('base', bulkBase);

    setLocked(newLocked);
    setCounts(newCounts);

    // Reset form bulk
    setBulkTop('');
    setBulkMid('');
    setBulkBase('');
  };

  const handleGenerate = () => {
    setAiResult(''); setPromptText(''); setErrorMsg(''); setUploadStatus('');
    setRecipe(getRandomRecipeWithLocks(counts, includeSynth, locked));
  };

  const analyzePerfume = async () => {
    if (!recipe) return;
    setAiLoading(true); setErrorMsg('');
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
      setAiResult(data.html); setPromptText(data.promptText || '');
    } catch (err: any) { setErrorMsg(`Gagal memuat AI: ${err.message}`); }
    finally { setAiLoading(false); }
  };

  const copyToClipboard = (text: string, msg = 'Berhasil disalin!') => {
    navigator.clipboard.writeText(text).then(() => alert(msg)).catch(() => alert('Gagal menyalin'));
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
    } catch (err: any) { setUploadStatus(`❌ Error: ${err.message}`); }
  };

  return (
    <main className="max-w-3xl mx-auto px-5 pb-20">
      <header className="text-center pt-16 pb-12">
        <h1 className="font-serif-lab font-light"
          style={{ fontSize: 'clamp(42px, 7vw, 72px)', letterSpacing: '0.02em', lineHeight: 1.1,
            background: `linear-gradient(135deg, ${AMBER} 0%, #e8e6e0 55%, ${PURPLE} 100%)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Laboratorium Aroma
        </h1>
        <p className="font-mono-lab uppercase mt-3" style={{ fontSize: '12px', letterSpacing: '0.12em', color: '#7a7872' }}>
          Database 1.800+ notes · Racik dan bedah mahakarya Anda
        </p>
      </header>

      {/* Formula Panel */}
      <div className="panel-lab p-7 mb-4">
        <div className="flex items-center gap-3 mb-5 font-mono-lab uppercase"
          style={{ fontSize: '11px', letterSpacing: '0.18em', color: '#7a7872' }}>
          Formula
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.14)' }}></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          {(['top','mid','base'] as Layer[]).map(layer => {
            const color = layer === 'top' ? AMBER : layer === 'mid' ? PURPLE : BLUE;
            const lockedList = locked[layer];
            return (
              <div key={layer}>
                <label className="flex justify-between items-baseline mb-2.5 font-mono-lab uppercase"
                  style={{ fontSize: '11px', letterSpacing: '0.12em', color: '#b0aca4' }}>
                  <span>{layer === 'mid' ? 'Mid' : layer.charAt(0).toUpperCase() + layer.slice(1)} Notes</span>
                  <span className="font-serif-lab font-light" style={{ fontSize: '20px', color: '#e8e6e0' }}>
                    {counts[layer]}
                  </span>
                </label>

                <input type="range" min="1" max="10" value={counts[layer]}
                  onChange={e => {
                    const v = parseInt(e.target.value);
                    setCounts({ ...counts, [layer]: v });
                    // trim locked if exceeds
                    if (lockedList.length > v) setLocked({ ...locked, [layer]: lockedList.slice(0, v) });
                  }}
                  className={`lab-slider ${layer === 'mid' ? 'mid' : layer === 'base' ? 'base' : ''} mb-3`}
                  style={{ ['--pct' as any]: sliderPct(counts[layer]) }} />

                <label
                  onClick={() => setIncludeSynth({ ...includeSynth, [layer]: !includeSynth[layer] })}
                  className="flex items-center gap-2 cursor-pointer rounded-lg px-3 py-1.5 mb-2 transition"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="relative rounded-full transition-colors"
                    style={{ width: 28, height: 15, background: includeSynth[layer] ? `${color}40` : 'rgba(255,255,255,0.1)' }}>
                    <div className="absolute rounded-full transition-transform"
                      style={{ top: 2, left: 2, width: 11, height: 11,
                        background: includeSynth[layer] ? color : '#7a7872',
                        transform: includeSynth[layer] ? 'translateX(13px)' : 'translateX(0)' }}></div>
                  </div>
                  <span className="font-mono-lab uppercase" style={{ fontSize: '10px', letterSpacing: '0.08em', color: '#7a7872' }}>
                    + Sintetis &amp; Unik
                  </span>
                </label>

                {/* Lock notes button */}
                <button onClick={() => setPickerOpen(layer)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg font-mono-lab uppercase transition"
                  style={{ fontSize: 10, letterSpacing: '0.08em',
                    background: lockedList.length > 0 ? `${color}15` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${lockedList.length > 0 ? `${color}60` : 'rgba(255,255,255,0.07)'}`,
                    color: lockedList.length > 0 ? color : '#7a7872', cursor: 'pointer' }}>
                  <span className="flex items-center gap-1.5">
                    <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                      <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.4"/>
                    </svg>
                    Pilih Manual
                  </span>
                  <span>{lockedList.length}/{counts[layer]}</span>
                </button>

                {/* Locked notes chips */}
                {lockedList.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {lockedList.map((n, i) => (
                      <span key={i}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs"
                        style={{ background: `${color}20`, color: color, border: `1px solid ${color}40` }}>
                        {n.name}
                        <button onClick={() => toggleLock(layer, n)}
                          style={{ background: 'none', border: 'none', color, cursor: 'pointer', padding: 0, fontSize: 12, lineHeight: 1 }}>×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* --- TAMBAHAN: INPUT BULK MANUAL KOMA --- */}
        <div className="mt-8 pt-5 pb-2 mb-6" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="font-mono-lab uppercase mb-3 flex items-center gap-2" style={{ fontSize: '10px', letterSpacing: '0.12em', color: '#b0aca4' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
            </svg>
            Input Notes Cepat (Pisahkan dengan koma)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <textarea
              value={bulkTop}
              onChange={(e) => setBulkTop(e.target.value)}
              placeholder="Top (mis: Lemon, Mint)"
              rows={2}
              className="w-full px-3 py-2 outline-none rounded-lg font-mono-lab transition-all"
              style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${bulkTop ? AMBER : 'rgba(255,255,255,0.07)'}`, color: '#e8e6e0', fontSize: 11, resize: 'none' }}
            />
            <textarea
              value={bulkMid}
              onChange={(e) => setBulkMid(e.target.value)}
              placeholder="Heart (mis: Rose, Jasmine)"
              rows={2}
              className="w-full px-3 py-2 outline-none rounded-lg font-mono-lab transition-all"
              style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${bulkMid ? PURPLE : 'rgba(255,255,255,0.07)'}`, color: '#e8e6e0', fontSize: 11, resize: 'none' }}
            />
            <textarea
              value={bulkBase}
              onChange={(e) => setBulkBase(e.target.value)}
              placeholder="Base (mis: Oud, Musk)"
              rows={2}
              className="w-full px-3 py-2 outline-none rounded-lg font-mono-lab transition-all"
              style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${bulkBase ? BLUE : 'rgba(255,255,255,0.07)'}`, color: '#e8e6e0', fontSize: 11, resize: 'none' }}
            />
          </div>
          <button
            onClick={handleBulkInput}
            disabled={!bulkTop.trim() && !bulkMid.trim() && !bulkBase.trim()}
            className="w-full py-2.5 rounded-lg font-mono-lab uppercase transition hover:-translate-y-px disabled:opacity-50"
            style={{ 
              fontSize: 10, letterSpacing: '0.1em', 
              background: (!bulkTop.trim() && !bulkMid.trim() && !bulkBase.trim()) ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)', 
              border: '1px solid rgba(255,255,255,0.14)', color: '#e8e6e0', cursor: (!bulkTop.trim() && !bulkMid.trim() && !bulkBase.trim()) ? 'not-allowed' : 'pointer' 
            }}
          >
            Ekstrak &amp; Kunci Notes
          </button>
        </div>
        {/* --- AKHIR TAMBAHAN --- */}

        <button onClick={handleGenerate}
          className="block mx-auto px-8 py-3.5 rounded-full font-mono-lab uppercase transition-all hover:-translate-y-px"
          style={{ fontSize: '12px', letterSpacing: '0.14em',
            background: 'linear-gradient(135deg, rgba(200,150,50,0.12), rgba(160,100,220,0.08))',
            border: '1px solid rgba(200,150,60,0.4)', color: '#e8e6e0', cursor: 'pointer' }}>
          ✦ &nbsp; Putar Roda Aroma
        </button>
      </div>

      {/* Recipe + AI + Upload */}
      {recipe && (
        <div className="animate-fade-in">
          <div className="text-center pt-9 pb-7">
            <h2 className="font-serif-lab font-light"
              style={{ fontSize: 'clamp(28px, 5vw, 44px)', letterSpacing: '0.06em', color: '#e8e6e0' }}>
              {recipe.name}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-6">
            <NotesCard title="Top Notes"   items={recipe.top}  color={AMBER}  locked={locked.top}/>
            <NotesCard title="Heart Notes" items={recipe.mid}  color={PURPLE} locked={locked.mid}/>
            <NotesCard title="Base Notes"  items={recipe.base} color={BLUE}   locked={locked.base}/>
          </div>

          {/* Copy Blueprint */}
          <div className="flex justify-center">
            <button
              onClick={() => {
                const blueprint =
                  `Perfume Blueprint\n` +
                  `Top Note : ${recipe.top.map(n => n.name).join(', ')}\n` +
                  `Mid/Heart Note : ${recipe.mid.map(n => n.name).join(', ')}\n` +
                  `Base Note : ${recipe.base.map(n => n.name).join(', ')}`;
                copyToClipboard(blueprint, 'Blueprint disalin!');
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-mono-lab uppercase transition hover:-translate-y-px"
              style={{
                fontSize: 10,
                letterSpacing: '0.12em',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.14)',
                color: '#b0aca4',
                cursor: 'pointer',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <rect x="4" y="4" width="9" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M3 11V3a1 1 0 011-1h7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              Salin Blueprint
            </button>
          </div>

          <div className="flex justify-center pt-5 pb-2">
            <button onClick={analyzePerfume} disabled={aiLoading}
              className="flex items-center gap-2.5 px-7 py-3 rounded-xl font-mono-lab uppercase transition-all disabled:opacity-50"
              style={{ fontSize: '11px', letterSpacing: '0.12em',
                background: 'linear-gradient(135deg, rgba(120,60,200,0.15), rgba(80,120,220,0.1))',
                border: '1px solid rgba(140,80,220,0.4)', color: '#e8e6e0',
                cursor: aiLoading ? 'not-allowed' : 'pointer' }}>
              {aiLoading
                ? <div className="w-4 h-4 rounded-full spin-lab" style={{ border: '2px solid rgba(255,255,255,0.15)', borderTopColor: PURPLE }}></div>
                : <span className="inline-flex items-center justify-center rounded-md text-white font-bold"
                    style={{ width: 20, height: 20, fontSize: 9, background: `linear-gradient(135deg, ${PURPLE}, ${BLUE})` }}>AI</span>}
              {aiLoading ? 'Menganalisis...' : 'Bedah Aroma dengan AI'}
            </button>
          </div>

          {errorMsg && <p className="text-center mt-3 font-mono-lab" style={{ fontSize: 12, color: 'oklch(70% 0.18 25)' }}>{errorMsg}</p>}

          {aiResult && (
            <div className="animate-fade-in mt-4">
              <Divider label="Analisis AI" />
              <div className="panel-lab p-7">
                <div className="ai-content" style={{ color: '#b0aca4', fontSize: 14, lineHeight: 1.75 }}
                  dangerouslySetInnerHTML={{ __html: aiResult }} />
              </div>

              {promptText && (
                <>
                  <Divider label="Prompt Visualisasi" />
                  <div className="panel-lab p-6">
                    <div className="flex flex-col md:flex-row gap-4 items-start">
                      <div className="flex-1 rounded-lg px-4 py-3.5 font-mono-lab"
                        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.07)',
                          fontSize: 11, lineHeight: 1.65, color: '#b0aca4', minHeight: 90, wordBreak: 'break-word' }}>
                        {promptText}
                      </div>
                      <button onClick={() => copyToClipboard(promptText, 'Prompt disalin!')}
                        className="px-4 py-2.5 rounded-lg font-mono-lab uppercase whitespace-nowrap"
                        style={{ fontSize: 10, letterSpacing: '0.1em', background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.14)', color: '#b0aca4', cursor: 'pointer' }}>
                        Salin Prompt
                      </button>
                    </div>
                  </div>
                </>
              )}

              <Divider label="Simpan ke Galeri" />
              <div className="panel-lab p-7 text-center">
                <h3 className="font-serif-lab font-light mb-1.5" style={{ fontSize: 24 }}>Simpan Karya ke Galeri</h3>
                <p className="font-mono-lab mb-5" style={{ fontSize: 12, color: '#7a7872' }}>
                  Pilih gambar moodboard Anda dan simpan ke arsip.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-mono-lab uppercase cursor-pointer"
                    style={{ fontSize: 10, letterSpacing: '0.1em', background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.14)', color: '#b0aca4' }}>
                    Choose File
                    <input type="file" accept="image/*" onChange={e => setUploadFile(e.target.files?.[0] || null)} style={{ display: 'none' }}/>
                  </label>
                  <span className="font-mono-lab" style={{ fontSize: 10, color: '#7a7872' }}>
                    {uploadFile ? uploadFile.name : 'No file chosen'}
                  </span>
                </div>
                <button onClick={handleUpload} disabled={!uploadFile}
                  className="px-8 py-3 rounded-lg font-mono-lab uppercase disabled:opacity-40"
                  style={{ fontSize: 11, letterSpacing: '0.12em',
                    background: 'linear-gradient(135deg, rgba(50,100,200,0.15), rgba(80,60,180,0.1))',
                    border: '1px solid rgba(60,130,220,0.4)', color: '#e8e6e0',
                    cursor: uploadFile ? 'pointer' : 'not-allowed' }}>
                  Unggah Sekarang
                </button>
                {uploadStatus && <p className="mt-3 font-mono-lab" style={{ fontSize: 11, color: '#b0aca4' }}>{uploadStatus}</p>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Note Picker Modal */}
      {pickerOpen && (
        <NotePicker
          layer={pickerOpen}
          maxCount={counts[pickerOpen]}
          locked={locked[pickerOpen]}
          includeSynth={includeSynth[pickerOpen]}
          onToggle={(note) => toggleLock(pickerOpen, note)}
          onClear={() => clearLocks(pickerOpen)}
          onClose={() => setPickerOpen(null)}
          onAddCustom={(name) => addCustomNote(pickerOpen, name)}
        />
      )}

      <style jsx global>{`
        .ai-content h1, .ai-content h2, .ai-content h3 {
          font-family: 'Cormorant Garamond', Georgia, serif;
          color: #e8e6e0; margin-top: 20px; margin-bottom: 8px; font-weight: 400;
        }
        .ai-content h3 { font-size: 18px; }
        .ai-content p  { margin-bottom: 12px; }
        .ai-content strong { color: #e8e6e0; font-weight: 500; }
      `}</style>
    </main>
  );
}

// ─────────── NotesCard ───────────
function NotesCard({ title, items, color, locked }: {
  title: string; items: Note[]; color: string; locked: Note[];
}) {
  const lockedNames = new Set(locked.map(n => n.name));
  return (
    <div className="rounded-xl p-4 relative overflow-hidden"
      style={{ background: '#181c22', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}></div>
      <div className="flex items-center gap-2 mb-3 pb-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}` }}></div>
        <span className="font-mono-lab uppercase" style={{ fontSize: 10, letterSpacing: '0.14em', color }}>{title}</span>
      </div>
      <ul className="space-y-1.5">
        {items.map((n, i) => {
          const isLocked = lockedNames.has(n.name);
          return (
            <li key={i} className="flex justify-between items-baseline py-1.5"
              style={{ fontSize: 13, color: '#e8e6e0',
                borderBottom: i < items.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
              <span className="flex items-center gap-1.5">
                {isLocked && (
                  <svg width="9" height="9" viewBox="0 0 16 16" fill="none" style={{ color }}>
                    <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
                    <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.6"/>
                  </svg>
                )}
                {n.name}
              </span>
              <span className="font-mono-lab uppercase" style={{ fontSize: 9, color: '#7a7872' }}>{n.cat}</span>
            </li>
          );
        })}
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

// ─────────── Note Picker Modal ───────────
function NotePicker({ layer, maxCount, locked, includeSynth, onToggle, onClear, onClose, onAddCustom }: {
  layer: Layer; maxCount: number; locked: Note[]; includeSynth: boolean;
  onToggle: (note: Note) => void; onClear: () => void; onClose: () => void;
  onAddCustom: (name: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [customInput, setCustomInput] = useState('');
  const color = layer === 'top' ? AMBER : layer === 'mid' ? PURPLE : BLUE;
  const lockedNames = useMemo(() => new Set(locked.map(n => n.name)), [locked]);

  const allNotes: Note[] = useMemo(() => {
    return FULL_DATABASE.filter(n => {
      if (!includeSynth && (n.cat === 'Synth/Weird' || n.cat === 'Beverage')) return false;
      return n.layers.includes(layer);
    });
  }, [layer, includeSynth]);

  const grouped = useMemo(() => {
    const filtered = search
      ? allNotes.filter(n => n.name.toLowerCase().includes(search.toLowerCase()))
      : allNotes;
    const map: Record<string, Note[]> = {};
    filtered.forEach(n => {
      if (!map[n.cat]) map[n.cat] = [];
      map[n.cat].push(n);
    });
    return map;
  }, [allNotes, search]);

  const handleAddCustom = () => {
    const name = customInput.trim();
    if (!name) return;
    if (locked.length >= maxCount) return; 
    onAddCustom(name);
    setCustomInput('');
  };

  return (
    <div onClick={onClose}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(6,7,9,0.94)', backdropFilter: 'blur(8px)' }}>
      <div onClick={e => e.stopPropagation()}
        className="panel-lab w-full max-w-3xl max-h-[85vh] flex flex-col"
        style={{ background: '#111318' }}>

        <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }}></div>
              <span className="font-mono-lab uppercase" style={{ fontSize: 10, letterSpacing: '0.16em', color }}>
                Pilih {layer === 'top' ? 'Top' : layer === 'mid' ? 'Mid' : 'Base'} Notes
              </span>
            </div>
            <p className="font-mono-lab" style={{ fontSize: 11, color: '#7a7872' }}>
              {locked.length} dari {maxCount} terkunci · sisanya akan dirandom
            </p>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.14)', color: '#b0aca4', cursor: 'pointer' }}>
            ✕
          </button>
        </div>

        <div className="p-5 pb-3 space-y-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari note (mis. Bergamot, Rose, Oud...)"
            className="w-full px-4 py-2.5 rounded-lg outline-none"
            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.07)',
              color: '#e8e6e0', fontSize: 13 }}/>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddCustom(); }}
              placeholder="Atau tulis note baru (mis. andaliman)..."
              className="flex-1 px-4 py-2.5 rounded-lg outline-none"
              style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${color}40`,
                color: '#e8e6e0', fontSize: 13 }}
            />
            <button
              onClick={handleAddCustom}
              disabled={locked.length >= maxCount || !customInput.trim()}
              className="px-4 py-2.5 rounded-lg font-mono-lab uppercase transition"
              style={{
                fontSize: 10,
                letterSpacing: '0.1em',
                background: locked.length >= maxCount ? 'rgba(255,255,255,0.05)' : `${color}20`,
                border: `1px solid ${color}60`,
                color: locked.length >= maxCount ? '#7a7872' : color,
                cursor: locked.length >= maxCount || !customInput.trim() ? 'not-allowed' : 'pointer',
                opacity: locked.length >= maxCount || !customInput.trim() ? 0.5 : 1,
              }}
            >
              + Tambah
            </button>
          </div>

          {locked.length > 0 && (
            <button onClick={onClear}
              className="font-mono-lab uppercase"
              style={{ fontSize: 10, letterSpacing: '0.1em', color: '#7a7872',
                background: 'none', border: 'none', cursor: 'pointer' }}>
              ↻ Hapus semua kunci
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {Object.keys(grouped).length === 0 && (
            <p className="text-center font-mono-lab py-10" style={{ fontSize: 11, color: '#7a7872' }}>
              Tidak ada hasil untuk "{search}"
            </p>
          )}
          {Object.entries(grouped).map(([cat, notes]) => (
            <div key={cat} className="mb-5">
              <div className="font-mono-lab uppercase mb-2" style={{ fontSize: 9, letterSpacing: '0.14em', color: '#7a7872' }}>
                {cat} <span style={{ color: '#4a4842' }}>({notes.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {notes.map((n) => {
                  const isLocked = lockedNames.has(n.name);
                  const isFull = !isLocked && locked.length >= maxCount;
                  return (
                    <button key={n.name} onClick={() => onToggle(n)} disabled={isFull}
                      className="px-2.5 py-1 rounded-md text-xs transition"
                      style={{
                        background: isLocked ? `${color}25` : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${isLocked ? `${color}80` : 'rgba(255,255,255,0.08)'}`,
                        color: isLocked ? color : isFull ? '#4a4842' : '#b0aca4',
                        cursor: isFull ? 'not-allowed' : 'pointer',
                        opacity: isFull ? 0.5 : 1,
                      }}>
                      {isLocked && '🔒 '}{n.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-5" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button onClick={onClose}
            className="w-full py-3 rounded-lg font-mono-lab uppercase"
            style={{ fontSize: 11, letterSpacing: '0.12em',
              background: `${color}20`, border: `1px solid ${color}60`, color: '#e8e6e0', cursor: 'pointer' }}>
            ✓ Selesai ({locked.length}/{maxCount})
          </button>
        </div>
      </div>
    </div>
  );
}
