'use client';

import { useState, type CSSProperties } from 'react';
import { FULL_DATABASE, type Note } from '@/lib/perfumeDB';
import { getCompositionName, getRandomNotesListWithLocks, getRandomRecipeWithLocks, type CompositionMode, type Layer } from '@/lib/recipeGenerator';
import { NOTE_FAMILIES, getNoteFamily } from '@/lib/noteTaxonomy';
import type { AnalyzeResponse, PerfumeAnalysis } from '@/lib/aiTypes';
import { WarmNotePicker } from '@/components/WarmNotePicker';
import { NoteFamilyVisual } from '@/components/NoteFamilyVisual';

const LAYERS: Layer[] = ['top', 'mid', 'base'];
const META: Record<Layer, { label: string; subtitle: string; className: string }> = {
  top: { label: 'Top', subtitle: 'Bright · first impression', className: 'layer-top' },
  mid: { label: 'Heart', subtitle: 'Character · the soul', className: 'layer-mid' },
  base: { label: 'Base', subtitle: 'Depth · lingering memory', className: 'layer-base' },
};
const emptyLocks = (): Record<Layer, Note[]> => ({ top: [], mid: [], base: [] });
type Composition = { mode: CompositionMode; name: string; top: Note[]; mid: Note[]; base: Note[]; notes: Note[] };

export default function GeneratorPage() {
  const [mode, setMode] = useState<CompositionMode>('pyramid');
  const [counts, setCounts] = useState<Record<Layer, number>>({ top: 2, mid: 3, base: 2 });
  const [includeExperimental, setIncludeExperimental] = useState<Record<Layer, boolean>>({ top: false, mid: false, base: false });
  const [locked, setLocked] = useState<Record<Layer, Note[]>>(emptyLocks);
  const [allowRepeated, setAllowRepeated] = useState(false);
  const [listCount, setListCount] = useState(7);
  const [listExperimental, setListExperimental] = useState(false);
  const [listLocked, setListLocked] = useState<Note[]>([]);
  const [pickerOpen, setPickerOpen] = useState<Layer | 'list' | null>(null);
  const [bulk, setBulk] = useState<Record<Layer, string>>({ top: '', mid: '', base: '' });
  const [listBulk, setListBulk] = useState('');
  const [composition, setComposition] = useState<Composition | null>(null);
  const [analysis, setAnalysis] = useState<PerfumeAnalysis | null>(null);
  const [modelUsed, setModelUsed] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const sliderPct = (value: number, max = 10) => `${((value - 1) / (max - 1)) * 100}%`;
  const clearResult = () => { setAnalysis(null); setModelUsed(''); setErrorMsg(''); setUploadStatus(''); setComposition(null); };
  const changeMode = (next: CompositionMode) => { setMode(next); clearResult(); setPickerOpen(null); };

  const setRepeatMode = (enabled: boolean) => {
    setAllowRepeated(enabled);
    if (!enabled) setLocked((previous) => {
      const seen = new Set<string>(); const next = emptyLocks();
      LAYERS.forEach((layer) => { next[layer] = previous[layer].filter((note) => { const key = note.name.toLocaleLowerCase(); if (seen.has(key)) return false; seen.add(key); return true; }); });
      return next;
    });
  };

  const toggleLock = (layer: Layer, note: Note) => setLocked((previous) => {
    const key = note.name.toLocaleLowerCase();
    if (previous[layer].some((item) => item.name.toLocaleLowerCase() === key)) return { ...previous, [layer]: previous[layer].filter((item) => item.name.toLocaleLowerCase() !== key) };
    const elsewhere = LAYERS.some((other) => other !== layer && previous[other].some((item) => item.name.toLocaleLowerCase() === key));
    if ((!allowRepeated && elsewhere) || previous[layer].length >= counts[layer]) return previous;
    return { ...previous, [layer]: [...previous[layer], note] };
  });

  const toggleListLock = (note: Note) => setListLocked((previous) => {
    const key = note.name.toLocaleLowerCase();
    if (previous.some((item) => item.name.toLocaleLowerCase() === key)) return previous.filter((item) => item.name.toLocaleLowerCase() !== key);
    if (previous.length >= listCount) return previous;
    return [...previous, note];
  });

  const clearFormula = () => { mode === 'list' ? setListLocked([]) : setLocked(emptyLocks()); clearResult(); };

  const applyBulk = () => {
    if (mode === 'list') {
      const names = listBulk.split(/[,&\n]/).map((x) => x.trim()).filter(Boolean);
      setListLocked((previous) => {
        const seen = new Set(previous.map((n) => n.name.toLocaleLowerCase())); const next = [...previous];
        names.forEach((name) => { const key = name.toLocaleLowerCase(); if (!seen.has(key) && next.length < 16) { next.push({ name: name.slice(0, 80), cat: 'Custom', layers: ['top', 'mid', 'base'] }); seen.add(key); } });
        setListCount((count) => Math.max(count, next.length)); return next;
      });
      setListBulk(''); return;
    }
    setLocked((previous) => {
      const next = { top: [...previous.top], mid: [...previous.mid], base: [...previous.base] }; const globalUsed = new Set(LAYERS.flatMap((layer) => next[layer].map((n) => n.name.toLocaleLowerCase()))); const nextCounts = { ...counts };
      LAYERS.forEach((layer) => { const layerUsed = new Set(next[layer].map((n) => n.name.toLocaleLowerCase())); bulk[layer].split(/[,&\n]/).map((x) => x.trim()).filter(Boolean).forEach((name) => { const key = name.toLocaleLowerCase(); if (!layerUsed.has(key) && (allowRepeated || !globalUsed.has(key)) && next[layer].length < 10) { next[layer].push({ name: name.slice(0, 80), cat: 'Custom', layers: [layer] }); layerUsed.add(key); globalUsed.add(key); } }); nextCounts[layer] = Math.max(nextCounts[layer], next[layer].length); });
      setCounts(nextCounts); return next;
    });
    setBulk({ top: '', mid: '', base: '' });
  };

  const generate = () => {
    setAnalysis(null); setModelUsed(''); setErrorMsg(''); setUploadStatus('');
    if (mode === 'list') { const notes = getRandomNotesListWithLocks(listCount, listExperimental, listLocked); setComposition({ mode, name: getCompositionName(notes), top: [], mid: [], base: [], notes }); return; }
    const recipe = getRandomRecipeWithLocks(counts, includeExperimental, locked); setComposition({ mode, name: recipe.name, top: recipe.top, mid: recipe.mid, base: recipe.base, notes: [] });
  };

  const analyzePerfume = async () => {
    if (!composition) return; setAiLoading(true); setErrorMsg('');
    try {
      const key = localStorage.getItem('leperfumer_gemini_key') || localStorage.getItem('gemini_user_key') || '';
      const model = localStorage.getItem('leperfumer_ai_model') || 'gemini-3.8-flash';
      const body = composition.mode === 'list' ? { mode: 'list', notes: composition.notes.map((note) => note.name) } : { mode: 'pyramid', topNotes: composition.top.map((n) => n.name), midNotes: composition.mid.map((n) => n.name), baseNotes: composition.base.map((n) => n.name) };
      const response = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(key ? { 'X-Gemini-Key': key } : {}), 'X-Gemini-Model': model }, body: JSON.stringify(body) });
      const data = await response.json(); if (!response.ok || data.error) throw new Error(data.error || 'AI analysis gagal.');
      const result = data as AnalyzeResponse; setAnalysis(result.analysis); setModelUsed(result.model);
    } catch (error: unknown) { setErrorMsg(error instanceof Error ? error.message : 'AI analysis gagal.'); } finally { setAiLoading(false); }
  };

  const copyPrompt = async () => { if (!analysis?.visualPrompt) return; await navigator.clipboard.writeText(analysis.visualPrompt); setCopied(true); window.setTimeout(() => setCopied(false), 1800); };
  const uploadToGallery = async () => {
    if (!composition || !uploadFile) return; setUploadStatus('Mengunggah moodboard…');
    try {
      const form = new FormData(); form.append('file', uploadFile); form.append('name', analysis?.name || composition.name);
      if (composition.mode === 'list') { form.append('structure_mode', 'list'); form.append('notes', composition.notes.map((n) => n.name).join(', ')); form.append('top_notes', 'Notes list'); form.append('mid_notes', composition.notes.map((n) => n.name).join(', ')); form.append('base_notes', 'Unlayered'); }
      else { form.append('top_notes', composition.top.map((n) => n.name).join(', ')); form.append('mid_notes', composition.mid.map((n) => n.name).join(', ')); form.append('base_notes', composition.base.map((n) => n.name).join(', ')); }
      const token = localStorage.getItem('leperfumer_gallery_token') || ''; const response = await fetch('/api/upload', { method: 'POST', headers: token ? { 'X-Gallery-Token': token } : undefined, body: form }); const data = await response.json(); if (!response.ok || data.error) throw new Error(data.error || 'Upload gagal.'); setUploadStatus('Moodboard tersimpan di Archive.'); setUploadFile(null);
    } catch (error: unknown) { setUploadStatus(error instanceof Error ? error.message : 'Upload gagal.'); }
  };

  const reservedForPicker = (target: Layer | 'list') => target === 'list' || allowRepeated ? new Set<string>() : new Set(LAYERS.filter((layer) => layer !== target).flatMap((layer) => locked[layer].map((n) => n.name.toLocaleLowerCase())));
  const pickerTarget: Layer | 'list' = mode === 'list' ? 'list' : 'top';

  return <main className="site-shell warm-bento-page pb-24">
    <section className="hero"><div><div className="eyebrow">A more meaningful fragrance journey</div><h1 className="display-title">Build a scent<br/><em>with intent.</em></h1><p className="hero-copy">Compose with researched materials, flexible olfactory layers and an AI critic that respects the structure you choose.</p><div className="hero-actions"><button className="primary-button" onClick={() => document.getElementById('compose')?.scrollIntoView({ behavior: 'smooth' })}>Start composing →</button><button className="soft-button" onClick={() => setPickerOpen(pickerTarget)}>Explore ingredients</button></div></div><div className="hero-stat"><strong>{FULL_DATABASE.length.toLocaleString()}</strong><span>RESEARCHED MATERIALS · MULTI-LAYER · NATURAL · MOLECULE · ACCORD</span></div></section>

    <section id="compose" className="compose-bento">
      <article className="bento-card mode-bento"><div className="bento-kicker">Composition mode</div><h2>How should the scent be read?</h2><p>Use a classic pyramid or keep the published notes deliberately unlayered.</p><div className="mode-switch"><button className={mode === 'pyramid' ? 'active' : ''} onClick={() => changeMode('pyramid')}>△ <span>Pyramid</span></button><button className={mode === 'list' ? 'active' : ''} onClick={() => changeMode('list')}>☷ <span>Notes List</span></button></div><div className="pyramid-sketch" aria-hidden="true"><span/><span/><span/></div><small>{mode === 'pyramid' ? 'Top · Heart · Base are explicit.' : 'No layer is imposed by the interface.'}</small></article>

      <article className="bento-card composition-bento"><div className="bento-head"><div><div className="bento-kicker">Scent composition</div><h2>{mode === 'pyramid' ? 'Build the pyramid.' : 'Build the note palette.'}</h2></div><button className="soft-button compact-action" onClick={() => setPickerOpen(pickerTarget)}>Browse library</button></div>
        {mode === 'pyramid' ? <div className="layer-bento-stack">{LAYERS.map((layer) => <LayerControl key={layer} layer={layer} count={counts[layer]} locked={locked[layer]} includeExperimental={includeExperimental[layer]} onCountChange={(value) => { setCounts((p) => ({ ...p, [layer]: value })); setLocked((p) => ({ ...p, [layer]: p[layer].slice(0, value) })); }} onExperimentalChange={() => setIncludeExperimental((p) => ({ ...p, [layer]: !p[layer] }))} onPickerOpen={() => setPickerOpen(layer)} onRemove={(note) => toggleLock(layer, note)} sliderPct={sliderPct(counts[layer])}/>)}</div> : <ListControl count={listCount} locked={listLocked} experimental={listExperimental} sliderPct={sliderPct(Math.max(1, listCount), 16)} onCount={(value) => { setListCount(value); setListLocked((p) => p.slice(0, value)); }} onExperimental={() => setListExperimental((value) => !value)} onPicker={() => setPickerOpen('list')} onRemove={toggleListLock}/>} 
        <details className="quick-paste"><summary>Quick paste custom notes</summary><div className="quick-paste-body">{mode === 'list' ? <textarea className="field" value={listBulk} onChange={(e) => setListBulk(e.target.value)} placeholder="Bergamot, Rose, Vanilla Absolute…"/> : <div className="grid md:grid-cols-3 gap-2">{LAYERS.map((layer) => <textarea key={layer} className="field" value={bulk[layer]} onChange={(e) => setBulk((p) => ({ ...p, [layer]: e.target.value }))} placeholder={`${META[layer].label}: Bergamot, Rose…`}/>)}</div>}<button className="soft-button" onClick={applyBulk}>Apply notes</button></div></details>
      </article>

      <article className={`bento-card repetition-bento ${allowRepeated ? 'enabled' : ''}`}><div className="repeat-symbol">∞</div><div className="bento-kicker">Intentional repetition</div><h2>Let one note echo.</h2><p>The same eligible material may intentionally appear in multiple layers. Random fill remains deduplicated.</p><button className="switch-row" onClick={() => setRepeatMode(!allowRepeated)}><span>{allowRepeated ? 'Enabled' : 'Disabled'}</span><span className={`switch ${allowRepeated ? 'on' : ''}`}/></button><blockquote>“Repetition can be a form of harmony.”</blockquote></article>

      <article className="bento-card formula-bento"><div className="bento-head"><div><div className="bento-kicker">My formula desk</div><h2>{analysis?.name || composition?.name || 'Untitled scent'}</h2></div><span className="draft-pill">● Draft</span></div>{!composition ? <div className="formula-empty"><div className="bottle-mini"/><p>Compose a formula to reveal its olfactory desk.</p></div> : <><CompositionStack composition={composition}/><button className="primary-button formula-ai" onClick={analyzePerfume} disabled={aiLoading}>{aiLoading ? 'AI is smelling the formula…' : analysis ? 'Refine with AI ↗' : 'Critique with AI ↗'}</button>{modelUsed && <small className="model-used">MODEL · {modelUsed}</small>}{errorMsg && <p className="error-copy">{errorMsg}</p>}</>}</article>

      <article className="bento-card quick-actions-bento"><div className="bento-kicker">Quick actions</div><button onClick={generate}><span>✦</span><b>Surprise me</b><small>Complete the open slots</small></button><button onClick={clearFormula}><span>⌫</span><b>Clear all</b><small>Start with a fresh canvas</small></button><button onClick={() => setPickerOpen(pickerTarget)}><span>⌕</span><b>Explore notes</b><small>Open the ingredient cabinet</small></button><button className="compose-main-action" onClick={generate}>Compose formula →</button></article>
    </section>

    <section className="family-showcase"><div className="section-heading"><div><div className="eyebrow">Ingredient cabinet</div><h2>Note families</h2></div><button className="ghost-button" onClick={() => setPickerOpen(pickerTarget)}>View all notes →</button></div><div className="family-showcase-grid">{NOTE_FAMILIES.filter((family) => family.id !== 'other').map((family) => <button key={family.id} className="family-showcase-card" onClick={() => setPickerOpen(pickerTarget)}><NoteFamilyVisual family={family}/><div><span>{family.icon}</span><strong>{family.label}</strong><small>{family.description}</small></div><em>→</em></button>)}</div></section>

    {analysis && composition && <section className="result-wrap animate-fade-in" aria-live="polite"><div className="analysis-hero"><div className="eyebrow">AI critic dossier · {analysis.structureMode === 'list' ? 'Notes list' : 'Pyramid'}</div><h2 className="analysis-name">{analysis.name}</h2><div className="analysis-tagline">{analysis.tagline}</div><p className="analysis-opening">{analysis.opening}</p></div><div className="analysis-grid"><AnalysisCard title="Narrative" wide><p>{analysis.narrative}</p></AnalysisCard><AnalysisCard title="Structure"><p>{analysis.structureSummary}</p>{analysis.structureMode === 'pyramid' ? <><LayerText label="Top" text={analysis.layers.top}/><LayerText label="Heart" text={analysis.layers.heart}/><LayerText label="Base" text={analysis.layers.base}/></> : <><LayerText label="Likely opening behaviour" text={analysis.layers.top}/><LayerText label="Likely heart behaviour" text={analysis.layers.heart}/><LayerText label="Likely drydown behaviour" text={analysis.layers.base}/></>}</AnalysisCard><AnalysisCard title="Persona & setting"><p><b>Persona.</b> {analysis.persona.profile}</p><p><b>Setting.</b> {analysis.persona.setting}</p><p><b>Season.</b> {analysis.persona.season}</p></AnalysisCard><AnalysisCard title="Real-world resonance"><ul>{analysis.references.map((item) => <li key={item.name}><b>{item.name}</b> — {item.reason}</li>)}</ul></AnalysisCard><AnalysisCard title="Critic notes"><div className="grid sm:grid-cols-2 gap-5"><div><div className="eyebrow">Strength</div><ul>{analysis.pros.map((x) => <li key={x}>{x}</li>)}</ul></div><div><div className="eyebrow">Risk</div><ul>{analysis.cons.map((x) => <li key={x}>{x}</li>)}</ul></div></div></AnalysisCard><AnalysisCard title="Verdict"><div className="score">{Math.round(analysis.verdict.score * 10)}<span>/100</span></div><p>{analysis.verdict.summary}</p></AnalysisCard><AnalysisCard title="Bottle architecture"><p><b>{analysis.soulObject.object}.</b> {analysis.soulObject.rationale}</p><p>{analysis.bottleDesign}</p></AnalysisCard><AnalysisCard title="Image-generation prompt" wide><div className="prompt-box">{analysis.visualPrompt}</div><button className="soft-button" onClick={copyPrompt}>{copied ? 'Copied ✓' : 'Copy prompt'}</button></AnalysisCard><AnalysisCard title="Archive the concept" wide><div className="archive-row"><input className="field" type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(e) => setUploadFile(e.target.files?.[0] || null)}/><button className="primary-button" disabled={!uploadFile} onClick={uploadToGallery}>Save to Archive</button></div>{uploadStatus && <p>{uploadStatus}</p>}</AnalysisCard></div></section>}

    {pickerOpen && <WarmNotePicker target={pickerOpen} maxCount={pickerOpen === 'list' ? listCount : counts[pickerOpen]} locked={pickerOpen === 'list' ? listLocked : locked[pickerOpen]} includeExperimental={pickerOpen === 'list' ? listExperimental : includeExperimental[pickerOpen]} reservedNames={reservedForPicker(pickerOpen)} repetitionEnabled={pickerOpen !== 'list' && allowRepeated} onToggle={(note) => pickerOpen === 'list' ? toggleListLock(note) : toggleLock(pickerOpen, note)} onClear={() => pickerOpen === 'list' ? setListLocked([]) : setLocked((p) => ({ ...p, [pickerOpen]: [] }))} onClose={() => setPickerOpen(null)}/>} 
  </main>;
}

function NoteChip({ note, onRemove }: { note: Note; onRemove?: () => void }) { const family = getNoteFamily(note); return <span className="note-chip"><span aria-hidden="true">{family.icon}</span>{note.name}{onRemove && <button onClick={onRemove} aria-label={`Remove ${note.name}`}>×</button>}</span>; }

function LayerControl({ layer, count, locked, includeExperimental, onCountChange, onExperimentalChange, onPickerOpen, onRemove, sliderPct }: { layer: Layer; count: number; locked: Note[]; includeExperimental: boolean; onCountChange: (v: number) => void; onExperimentalChange: () => void; onPickerOpen: () => void; onRemove: (n: Note) => void; sliderPct: string }) {
  const meta = META[layer]; return <div className={`layer-card ${meta.className}`}><div className="layer-head"><div><div className="layer-label">{meta.label} Notes</div><div className="text-[10px] mt-1" style={{ color: 'var(--muted)' }}>{meta.subtitle}</div></div><div className="layer-count">{count}</div></div><div className="layer-note-area">{locked.length ? locked.map((note) => <NoteChip key={note.name} note={note} onRemove={() => onRemove(note)}/>) : <span className="empty-chip">Choose ingredients…</span>}<button className="add-note-round" onClick={onPickerOpen}>＋</button></div><input className="lab-slider" type="range" min="1" max="10" value={count} onChange={(e) => onCountChange(Number(e.target.value))} style={{ '--pct': sliderPct } as CSSProperties}/><button type="button" className="experimental-mini" onClick={onExperimentalChange}><span className={`switch ${includeExperimental ? 'on' : ''}`}/><span>Experimental materials</span></button></div>;
}

function ListControl({ count, locked, experimental, sliderPct, onCount, onExperimental, onPicker, onRemove }: { count: number; locked: Note[]; experimental: boolean; sliderPct: string; onCount: (v: number) => void; onExperimental: () => void; onPicker: () => void; onRemove: (n: Note) => void }) {
  return <div className="layer-card layer-mid list-control"><div className="layer-head"><div><div className="layer-label">Unlayered Notes</div><div className="text-[10px] mt-1" style={{ color: 'var(--muted)' }}>Published as a list, not an official pyramid</div></div><div className="layer-count">{count}</div></div><div className="layer-note-area">{locked.length ? locked.map((note) => <NoteChip key={note.name} note={note} onRemove={() => onRemove(note)}/>) : <span className="empty-chip">Choose ingredients…</span>}<button className="add-note-round" onClick={onPicker}>＋</button></div><input className="lab-slider" type="range" min="2" max="16" value={count} onChange={(e) => onCount(Number(e.target.value))} style={{ '--pct': sliderPct } as CSSProperties}/><button className="experimental-mini" onClick={onExperimental}><span className={`switch ${experimental ? 'on' : ''}`}/><span>Experimental materials</span></button></div>;
}

function CompositionStack({ composition }: { composition: Composition }) {
  if (composition.mode === 'list') return <div className="formula-stack"><div className="formula-row"><div className="formula-row-title">Notes · unlayered</div><div className="formula-note-grid">{composition.notes.map((note) => <NoteChip key={note.name} note={note}/>)}</div></div></div>;
  const repeats = new Map<string, number>(); [...composition.top, ...composition.mid, ...composition.base].forEach((note) => repeats.set(note.name.toLocaleLowerCase(), (repeats.get(note.name.toLocaleLowerCase()) || 0) + 1));
  return <div className="formula-stack">{LAYERS.map((layer) => { const items = layer === 'top' ? composition.top : layer === 'mid' ? composition.mid : composition.base; return <div className={`formula-row formula-${layer}`} key={layer}><div className="formula-row-title">{META[layer].label} notes</div><div className="formula-note-grid">{items.map((note) => <span key={`${layer}-${note.name}`} className="formula-note-item"><NoteChip note={note}/>{(repeats.get(note.name.toLocaleLowerCase()) || 0) > 1 && <b className="repeat-badge">↻</b>}</span>)}</div></div>; })}</div>;
}

function AnalysisCard({ title, wide = false, children }: { title: string; wide?: boolean; children: React.ReactNode }) { return <article className={`analysis-card ${wide ? 'wide' : ''}`}><h3>{title}</h3>{children}</article>; }
function LayerText({ label, text }: { label: string; text: string }) { return <div className="layer-text"><div className="eyebrow">{label}</div><p>{text}</p></div>; }
