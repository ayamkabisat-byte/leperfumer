'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import { FULL_DATABASE, type Note } from '@/lib/perfumeDB';
import {
  categoryLabel, getCompositionName, getNoteLayerProfile, getRandomNotesListWithLocks,
  getRandomRecipeWithLocks, isExperimentalNote, type CompositionMode, type Layer,
} from '@/lib/recipeGenerator';
import type { AnalyzeResponse, PerfumeAnalysis } from '@/lib/aiTypes';

const LAYERS: Layer[] = ['top', 'mid', 'base'];
const META: Record<Layer, { label: string; subtitle: string; className: string }> = {
  top: { label: 'Top', subtitle: 'Lift · first impression', className: 'layer-top' },
  mid: { label: 'Heart', subtitle: 'Character · body', className: 'layer-mid' },
  base: { label: 'Base', subtitle: 'Depth · persistence', className: 'layer-base' },
};
const emptyLocks = (): Record<Layer, Note[]> => ({ top: [], mid: [], base: [] });

type Composition = {
  mode: CompositionMode;
  name: string;
  top: Note[];
  mid: Note[];
  base: Note[];
  notes: Note[];
};

export default function GeneratorPage() {
  const [mode, setMode] = useState<CompositionMode>('pyramid');
  const [counts, setCounts] = useState<Record<Layer, number>>({ top: 2, mid: 3, base: 2 });
  const [includeExperimental, setIncludeExperimental] = useState<Record<Layer, boolean>>({ top: false, mid: false, base: false });
  const [locked, setLocked] = useState<Record<Layer, Note[]>>(emptyLocks);
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

  const resetResult = () => { setAnalysis(null); setModelUsed(''); setErrorMsg(''); setUploadStatus(''); setComposition(null); };
  const changeMode = (next: CompositionMode) => { setMode(next); resetResult(); setPickerOpen(null); };

  const toggleLock = (layer: Layer, note: Note) => {
    setLocked((previous) => {
      const key = note.name.toLocaleLowerCase();
      const exists = previous[layer].some((item) => item.name.toLocaleLowerCase() === key);
      if (exists) return { ...previous, [layer]: previous[layer].filter((item) => item.name.toLocaleLowerCase() !== key) };
      const elsewhere = LAYERS.some((other) => other !== layer && previous[other].some((item) => item.name.toLocaleLowerCase() === key));
      if (elsewhere || previous[layer].length >= counts[layer]) return previous;
      return { ...previous, [layer]: [...previous[layer], note] };
    });
  };

  const toggleListLock = (note: Note) => {
    setListLocked((previous) => {
      const key = note.name.toLocaleLowerCase();
      if (previous.some((item) => item.name.toLocaleLowerCase() === key)) return previous.filter((item) => item.name.toLocaleLowerCase() !== key);
      if (previous.length >= listCount) return previous;
      return [...previous, note];
    });
  };

  const applyBulk = () => {
    if (mode === 'list') {
      const names = listBulk.split(/[,&\n]/).map((x) => x.trim()).filter(Boolean);
      setListLocked((previous) => {
        const seen = new Set(previous.map((n) => n.name.toLocaleLowerCase()));
        const next = [...previous];
        names.forEach((name) => {
          const key = name.toLocaleLowerCase();
          if (!seen.has(key) && next.length < 16) { next.push({ name: name.slice(0, 80), cat: 'Custom', layers: ['top','mid','base'] }); seen.add(key); }
        });
        setListCount((count) => Math.max(count, next.length));
        return next;
      });
      setListBulk('');
      return;
    }
    setLocked((previous) => {
      const next = { top: [...previous.top], mid: [...previous.mid], base: [...previous.base] };
      const used = new Set(LAYERS.flatMap((layer) => next[layer].map((n) => n.name.toLocaleLowerCase())));
      const nextCounts = { ...counts };
      LAYERS.forEach((layer) => {
        bulk[layer].split(/[,&\n]/).map((x) => x.trim()).filter(Boolean).forEach((name) => {
          const key = name.toLocaleLowerCase();
          if (!used.has(key) && next[layer].length < 10) { next[layer].push({ name: name.slice(0,80), cat: 'Custom', layers: [layer] }); used.add(key); }
        });
        nextCounts[layer] = Math.max(nextCounts[layer], next[layer].length);
      });
      setCounts(nextCounts); return next;
    });
    setBulk({ top: '', mid: '', base: '' });
  };

  const generate = () => {
    setAnalysis(null); setModelUsed(''); setErrorMsg(''); setUploadStatus('');
    if (mode === 'list') {
      const notes = getRandomNotesListWithLocks(listCount, listExperimental, listLocked);
      setComposition({ mode, name: getCompositionName(notes), top: [], mid: [], base: [], notes });
      return;
    }
    const recipe = getRandomRecipeWithLocks(counts, includeExperimental, locked);
    setComposition({ mode, name: recipe.name, top: recipe.top, mid: recipe.mid, base: recipe.base, notes: [] });
  };

  const analyzePerfume = async () => {
    if (!composition) return;
    setAiLoading(true); setErrorMsg('');
    try {
      const key = localStorage.getItem('leperfumer_gemini_key') || localStorage.getItem('gemini_user_key') || '';
      const model = localStorage.getItem('leperfumer_ai_model') || 'gemini-3.8-flash';
      const body = composition.mode === 'list'
        ? { mode: 'list', notes: composition.notes.map((note) => note.name) }
        : { mode: 'pyramid', topNotes: composition.top.map((n) => n.name), midNotes: composition.mid.map((n) => n.name), baseNotes: composition.base.map((n) => n.name) };
      const response = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(key ? { 'X-Gemini-Key': key } : {}), 'X-Gemini-Model': model }, body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || 'AI analysis gagal.');
      const result = data as AnalyzeResponse; setAnalysis(result.analysis); setModelUsed(result.model);
    } catch (error: unknown) { setErrorMsg(error instanceof Error ? error.message : 'AI analysis gagal.'); }
    finally { setAiLoading(false); }
  };

  const copyPrompt = async () => { if (!analysis?.visualPrompt) return; await navigator.clipboard.writeText(analysis.visualPrompt); setCopied(true); window.setTimeout(() => setCopied(false), 1800); };

  const uploadToGallery = async () => {
    if (!composition || !uploadFile) return;
    setUploadStatus('Mengunggah moodboard…');
    try {
      const form = new FormData(); form.append('file', uploadFile); form.append('name', analysis?.name || composition.name);
      if (composition.mode === 'list') {
        form.append('structure_mode', 'list'); form.append('notes', composition.notes.map((n) => n.name).join(', '));
        form.append('top_notes', 'Notes list'); form.append('mid_notes', composition.notes.map((n) => n.name).join(', ')); form.append('base_notes', 'Unlayered');
      } else {
        form.append('top_notes', composition.top.map((n) => n.name).join(', ')); form.append('mid_notes', composition.mid.map((n) => n.name).join(', ')); form.append('base_notes', composition.base.map((n) => n.name).join(', '));
      }
      const token = localStorage.getItem('leperfumer_gallery_token') || '';
      const response = await fetch('/api/upload', { method: 'POST', headers: token ? { 'X-Gallery-Token': token } : undefined, body: form });
      const data = await response.json(); if (!response.ok || data.error) throw new Error(data.error || 'Upload gagal.');
      setUploadStatus('Moodboard tersimpan di Archive.'); setUploadFile(null);
    } catch (error: unknown) { setUploadStatus(error instanceof Error ? error.message : 'Upload gagal.'); }
  };

  return (
    <main className="site-shell pb-24">
      <section className="hero"><div><div className="eyebrow">Olfactory composition studio</div><h1 className="display-title">Build a scent<br/><em>with intent.</em></h1><p className="hero-copy">Racik sebagai piramida klasik atau daftar notes bebas. Setiap material kini memahami posisi yang lazim sekaligus seluruh layer yang masuk akal.</p></div><div className="hero-stat"><strong>{FULL_DATABASE.length.toLocaleString()}</strong><span>RESEARCHED NOTES · MULTI-LAYER · NATURAL · MOLECULE · ACCORD</span></div></section>

      <div className="flex gap-2 mt-8 mb-3">
        <button className={mode === 'pyramid' ? 'primary-button px-5 py-3 text-[11px]' : 'soft-button px-5 py-3 text-[11px]'} onClick={() => changeMode('pyramid')}>△ Pyramid</button>
        <button className={mode === 'list' ? 'primary-button px-5 py-3 text-[11px]' : 'soft-button px-5 py-3 text-[11px]'} onClick={() => changeMode('list')}>≡ Notes List</button>
      </div>
      <p className="text-[11px] mb-5" style={{ color: 'var(--muted)' }}>{mode === 'pyramid' ? 'Top · Heart · Base ditetapkan secara eksplisit.' : 'Satu daftar notes tanpa memaksakan pyramid. Ini tidak otomatis berarti parfum linear.'}</p>

      <section className="atelier-grid">
        <div className="atelier-panel">
          <div className="panel-kicker">01 · {mode === 'pyramid' ? 'Compose the pyramid' : 'Compose the note palette'}</div>
          {mode === 'pyramid' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">{LAYERS.map((layer) => <LayerControl key={layer} layer={layer} count={counts[layer]} locked={locked[layer]} includeExperimental={includeExperimental[layer]} onCountChange={(value) => { setCounts((p) => ({...p,[layer]:value})); setLocked((p) => ({...p,[layer]:p[layer].slice(0,value)})); }} onExperimentalChange={() => setIncludeExperimental((p) => ({...p,[layer]:!p[layer]}))} onPickerOpen={() => setPickerOpen(layer)} onRemove={(note) => toggleLock(layer,note)} sliderPct={sliderPct(counts[layer])} />)}</div>
          ) : (
            <div className="layer-card layer-mid">
              <div className="layer-head"><div><div className="layer-label">Unlayered notes</div><div className="text-[10px] mt-1" style={{color:'var(--muted)'}}>No imposed top / heart / base</div></div><div className="layer-count">{listCount}</div></div>
              <input className="lab-slider" type="range" min="2" max="16" value={listCount} onChange={(e) => { const value=Number(e.target.value); setListCount(value); setListLocked((p)=>p.slice(0,value)); }} style={{'--pct': sliderPct(Math.max(1,listCount),16)} as CSSProperties}/>
              <button type="button" className="switch-row w-full border-0 bg-transparent p-0 text-left" onClick={()=>setListExperimental((v)=>!v)}><span>Experimental + beverage</span><span className={`switch ${listExperimental?'on':''}`}/></button>
              <button className="soft-button w-full mt-3 py-2 text-[10px] uppercase tracking-[0.1em]" onClick={()=>setPickerOpen('list')}>Choose notes · {listLocked.length}/{listCount}</button>
              {listLocked.length>0 && <div className="flex flex-wrap gap-1.5 mt-3">{listLocked.map((note)=><span className="note-chip" key={note.name}>{note.name}<button onClick={()=>toggleListLock(note)}>×</button></span>)}</div>}
            </div>
          )}

          <div className="mt-6 pt-6" style={{borderTop:'1px solid var(--line)'}}><div className="eyebrow mb-2">Quick paste</div><p className="text-[12px] mb-3" style={{color:'var(--muted)'}}>Tambahkan note custom dengan koma, ampersand, atau baris baru.</p>
            {mode === 'list' ? <textarea className="field min-h-[76px] resize-none text-[12px]" value={listBulk} onChange={(e)=>setListBulk(e.target.value)} placeholder="Bergamot, Rose, Vanilla Absolute…"/> : <div className="grid grid-cols-1 md:grid-cols-3 gap-2">{LAYERS.map((layer)=><textarea key={layer} className="field min-h-[72px] resize-none text-[12px]" value={bulk[layer]} onChange={(e)=>setBulk((p)=>({...p,[layer]:e.target.value}))} placeholder={`${META[layer].label}: Bergamot, Rose…`}/>)}</div>}
            <div className="flex gap-2 mt-3"><button className="soft-button px-4 py-2 text-[11px]" onClick={applyBulk}>Apply notes</button><button className="ghost-button px-4 py-2 text-[11px]" onClick={()=>mode==='list'?setListLocked([]):setLocked(emptyLocks())}>Clear locked</button></div>
          </div>
          <button className="primary-button w-full mt-7 py-4 uppercase text-[11px] tracking-[0.14em]" onClick={generate}>Compose formula</button>
        </div>

        <aside className="atelier-panel md:sticky md:top-[92px]"><div className="panel-kicker">02 · Formula desk</div>{!composition ? <div className="py-8"><div className="font-serif-lab text-[34px] leading-tight" style={{color:'var(--paper-soft)'}}>Your formula will appear here.</div><p className="mt-4 text-[13px] leading-6" style={{color:'var(--muted)'}}>Layer placement sekarang bersifat multi-position. Pilih Notes List jika struktur produk memang tidak menyebut pyramid.</p></div> : <div className="animate-fade-in"><div className="eyebrow">{composition.mode==='list'?'Unlayered composition':'Working title'}</div><h2 className="font-serif-lab text-[43px] leading-none mt-2 mb-5">{analysis?.name || composition.name}</h2><CompositionStack composition={composition}/><button className="primary-button w-full mt-5 py-3.5 text-[11px] uppercase tracking-[0.12em]" onClick={analyzePerfume} disabled={aiLoading}>{aiLoading?'AI is smelling the formula…':analysis?'Re-analyze formula':'Critique with AI'}</button>{modelUsed&&<div className="text-center mt-2 font-mono-lab text-[9px]" style={{color:'var(--muted)'}}>MODEL · {modelUsed}</div>}{errorMsg&&<p className="mt-3 text-[12px]" style={{color:'#d98b8b'}}>{errorMsg}</p>}</div>}</aside>
      </section>

      {analysis && composition && <section className="result-wrap animate-fade-in"><div className="analysis-hero"><div className="eyebrow">AI critic’s dossier · {analysis.structureMode === 'list' ? 'Notes list' : 'Pyramid'}</div><h2 className="analysis-name">{analysis.name}</h2><div className="analysis-tagline">{analysis.tagline}</div><p className="analysis-opening">{analysis.opening}</p></div><div className="analysis-grid">
        <AnalysisCard title="Narrative" wide><p>{analysis.narrative}</p></AnalysisCard>
        <AnalysisCard title="Structure"><p>{analysis.structureSummary}</p>{analysis.structureMode==='pyramid'?<><LayerText label="Top" text={analysis.layers.top}/><LayerText label="Heart" text={analysis.layers.heart}/><LayerText label="Base" text={analysis.layers.base}/></>:<><LayerText label="Likely opening behaviour" text={analysis.layers.top}/><LayerText label="Likely heart behaviour" text={analysis.layers.heart}/><LayerText label="Likely drydown behaviour" text={analysis.layers.base}/></>}</AnalysisCard>
        <AnalysisCard title="Persona & setting"><p><strong style={{color:'var(--paper)'}}>Persona.</strong> {analysis.persona.profile}</p><p><strong style={{color:'var(--paper)'}}>Setting.</strong> {analysis.persona.setting}</p><p><strong style={{color:'var(--paper)'}}>Season.</strong> {analysis.persona.season}</p></AnalysisCard>
        <AnalysisCard title="Real-world resonance"><ul className="space-y-2 pl-4 list-disc">{analysis.references.map((item)=><li key={item.name}><strong style={{color:'var(--paper)'}}>{item.name}</strong> — {item.reason}</li>)}</ul></AnalysisCard>
        <AnalysisCard title="Critic notes"><div className="grid sm:grid-cols-2 gap-5"><div><div className="eyebrow mb-2">Strength</div><ul className="space-y-1 pl-4 list-disc">{analysis.pros.map((x)=><li key={x}>{x}</li>)}</ul></div><div><div className="eyebrow mb-2">Risk</div><ul className="space-y-1 pl-4 list-disc">{analysis.cons.map((x)=><li key={x}>{x}</li>)}</ul></div></div></AnalysisCard>
        <AnalysisCard title="Verdict"><div className="score">{analysis.verdict.score.toFixed(1)}<span className="text-[18px]" style={{color:'var(--muted)'}}>/10</span></div><p>{analysis.verdict.summary}</p></AnalysisCard>
        <AnalysisCard title="Bottle architecture"><p><strong style={{color:'var(--paper)'}}>{analysis.soulObject.object}.</strong> {analysis.soulObject.rationale}</p><p>{analysis.bottleDesign}</p></AnalysisCard>
        <AnalysisCard title="Image-generation prompt" wide><div className="prompt-box">{analysis.visualPrompt}</div><button className="soft-button px-4 py-2.5 mt-3 text-[11px]" onClick={copyPrompt}>{copied?'Copied ✓':'Copy prompt'}</button></AnalysisCard>
        <AnalysisCard title="Archive the concept" wide><div className="grid md:grid-cols-[1fr_auto] gap-3 items-end"><div><input className="field text-[12px]" type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(e)=>setUploadFile(e.target.files?.[0]||null)}/><p className="mt-2 text-[11px]" style={{color:'var(--muted)'}}>Upload moodboard maksimal 12 MB.</p></div><button className="primary-button px-6 py-3 text-[11px]" disabled={!uploadFile} onClick={uploadToGallery}>Save to Archive</button></div>{uploadStatus&&<p className="mt-3 text-[12px]" style={{color:'var(--paper-soft)'}}>{uploadStatus}</p>}</AnalysisCard>
      </div></section>}

      {pickerOpen && <NotePicker target={pickerOpen} maxCount={pickerOpen==='list'?listCount:counts[pickerOpen]} locked={pickerOpen==='list'?listLocked:locked[pickerOpen]} includeExperimental={pickerOpen==='list'?listExperimental:includeExperimental[pickerOpen]} reservedNames={pickerOpen==='list'?new Set():new Set(LAYERS.filter((layer)=>layer!==pickerOpen).flatMap((layer)=>locked[layer].map((n)=>n.name.toLocaleLowerCase())))} onToggle={(note)=>pickerOpen==='list'?toggleListLock(note):toggleLock(pickerOpen,note)} onClear={()=>pickerOpen==='list'?setListLocked([]):setLocked((p)=>({...p,[pickerOpen]:[]}))} onClose={()=>setPickerOpen(null)}/>} 
    </main>
  );
}

function LayerControl({layer,count,locked,includeExperimental,onCountChange,onExperimentalChange,onPickerOpen,onRemove,sliderPct}:{layer:Layer;count:number;locked:Note[];includeExperimental:boolean;onCountChange:(v:number)=>void;onExperimentalChange:()=>void;onPickerOpen:()=>void;onRemove:(n:Note)=>void;sliderPct:string}) {
  const meta=META[layer]; return <div className={`layer-card ${meta.className}`}><div className="layer-head"><div><div className="layer-label">{meta.label}</div><div className="text-[10px] mt-1" style={{color:'var(--muted)'}}>{meta.subtitle}</div></div><div className="layer-count">{count}</div></div><input className="lab-slider" type="range" min="1" max="10" value={count} onChange={(e)=>onCountChange(Number(e.target.value))} style={{'--pct':sliderPct} as CSSProperties}/><button type="button" className="switch-row w-full border-0 bg-transparent p-0 text-left" onClick={onExperimentalChange}><span>Experimental + beverage</span><span className={`switch ${includeExperimental?'on':''}`}/></button><button className="soft-button w-full mt-3 py-2 text-[10px] uppercase tracking-[0.1em]" onClick={onPickerOpen}>Choose notes · {locked.length}/{count}</button>{locked.length>0&&<div className="flex flex-wrap gap-1.5 mt-3">{locked.map((note)=><span className="note-chip" key={note.name}>{note.name}<button onClick={()=>onRemove(note)}>×</button></span>)}</div>}</div>;
}

function CompositionStack({composition}:{composition:Composition}) {
  if(composition.mode==='list') return <div className="formula-row"><div className="formula-row-title">Notes · unlayered</div><div className="flex flex-wrap gap-1.5">{composition.notes.map((note)=><span className="note-chip" key={note.name}>{note.name}</span>)}</div></div>;
  return <div className="formula-stack">{LAYERS.map((layer)=>{const items=layer==='top'?composition.top:layer==='mid'?composition.mid:composition.base;return <div className="formula-row" key={layer}><div className="formula-row-title">{META[layer].label} notes</div><div className="flex flex-wrap gap-1.5">{items.map((note)=><span className="note-chip" key={`${layer}-${note.name}`}>{note.name}</span>)}</div></div>;})}</div>;
}
function AnalysisCard({title,wide=false,children}:{title:string;wide?:boolean;children:React.ReactNode}) { return <article className={`analysis-card ${wide?'wide':''}`}><h3>{title}</h3>{children}</article>; }
function LayerText({label,text}:{label:string;text:string}) { return <div className="mb-4 last:mb-0"><div className="eyebrow mb-1">{label}</div><p>{text}</p></div>; }

function NotePicker({target,maxCount,locked,includeExperimental,reservedNames,onToggle,onClear,onClose}:{target:Layer|'list';maxCount:number;locked:Note[];includeExperimental:boolean;reservedNames:Set<string>;onToggle:(n:Note)=>void;onClear:()=>void;onClose:()=>void}) {
  const [search,setSearch]=useState(''); const [custom,setCustom]=useState('');
  const selected=useMemo(()=>new Set(locked.map((n)=>n.name.toLocaleLowerCase())),[locked]);
  const notes=useMemo(()=>{const query=search.trim().toLocaleLowerCase();return FULL_DATABASE.filter((note)=>target==='list'||note.layers.includes(target)).filter((note)=>includeExperimental||!isExperimentalNote(note)).filter((note)=>!reservedNames.has(note.name.toLocaleLowerCase())).filter((note)=>!query||note.name.toLocaleLowerCase().includes(query));},[target,includeExperimental,reservedNames,search]);
  const grouped=useMemo(()=>{const map=new Map<string,Note[]>();const seen=new Set<string>();notes.forEach((note)=>{const key=note.name.toLocaleLowerCase();if(seen.has(key))return;seen.add(key);const label=categoryLabel(note.cat);map.set(label,[...(map.get(label)||[]),note]);});return [...map.entries()];},[notes]);
  const addCustom=()=>{const name=custom.trim().slice(0,80);if(!name||locked.length>=maxCount||reservedNames.has(name.toLocaleLowerCase()))return;onToggle({name,cat:'Custom',layers:target==='list'?['top','mid','base']:[target]});setCustom('');};
  return <div className="modal-backdrop" onClick={onClose}><div className="modal-panel flex flex-col" onClick={(e)=>e.stopPropagation()}><div className="flex items-center justify-between gap-3 p-5" style={{borderBottom:'1px solid var(--line)'}}><div><div className="eyebrow">Select {target==='list'?'unlayered':META[target].label} notes</div><div className="font-serif-lab text-[28px] mt-1">{locked.length} / {maxCount} locked</div></div><button className="ghost-button w-10 h-10" onClick={onClose}>×</button></div><div className="p-5 grid md:grid-cols-[1fr_1fr_auto] gap-2" style={{borderBottom:'1px solid var(--line)'}}><input className="field text-[12px]" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search note…" autoFocus/><input className="field text-[12px]" value={custom} onChange={(e)=>setCustom(e.target.value)} onKeyDown={(e)=>{if(e.key==='Enter')addCustom();}} placeholder="Custom note…"/><button className="soft-button px-4 text-[11px]" disabled={!custom.trim()||locked.length>=maxCount} onClick={addCustom}>Add</button></div><div className="overflow-y-auto p-5 flex-1">{grouped.length===0&&<p className="text-center py-14" style={{color:'var(--muted)'}}>No matching notes.</p>}{grouped.map(([category,items])=><div key={category} className="mb-6"><div className="eyebrow mb-2">{category} · {items.length}</div><div className="flex flex-wrap gap-1.5">{items.map((note)=>{const isSelected=selected.has(note.name.toLocaleLowerCase());const disabled=!isSelected&&locked.length>=maxCount;const lp=getNoteLayerProfile(note);return <button key={note.name} className="chip-button px-2.5 py-1.5 text-[11px] text-left" disabled={disabled} onClick={()=>onToggle(note)} title={`${lp.rationale} Allowed: ${lp.allowedLayers.join(', ')}`} style={{background:isSelected?'rgba(201,165,104,.16)':'rgba(255,255,255,.025)',color:isSelected?'var(--brass-bright)':'var(--paper-soft)',opacity:disabled?.35:1}}><span>{isSelected?'✓ ':''}{note.name}</span><span className="ml-1 opacity-50 text-[8px] uppercase">{lp.typicalLayer==='mid'?'H':lp.typicalLayer==='top'?'T':'B'} · {lp.allowedLayers.map((x)=>x==='mid'?'H':x==='top'?'T':'B').join('/')}</span></button>;})}</div></div>)}</div><div className="flex justify-between gap-2 p-5" style={{borderTop:'1px solid var(--line)'}}><button className="ghost-button px-4 py-2 text-[11px]" onClick={onClear}>Clear</button><div className="text-[9px] self-center hidden sm:block" style={{color:'var(--muted)'}}>T/H/B = allowed layers · first letter = typical layer</div><button className="primary-button px-6 py-2.5 text-[11px]" onClick={onClose}>Done</button></div></div></div>;
}
