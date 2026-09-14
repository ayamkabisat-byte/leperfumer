'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Perfume {
  id: number;
  name: string;
  top_notes: string;
  mid_notes: string;
  base_notes: string;
  image_url: string;
  created_at: string;
}

export default function GalleryPage() {
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<number | null>(null);

  const fetchGallery = async () => {
    setLoading(true);
    setError('');
    const { data, error: galleryError } = await supabase
      .from('perfumes')
      .select('id,name,top_notes,mid_notes,base_notes,image_url,created_at')
      .order('created_at', { ascending: false });
    if (galleryError) setError(galleryError.message); else setPerfumes((data || []) as Perfume[]);
    setLoading(false);
  };

  useEffect(() => { void fetchGallery(); }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    if (!needle) return perfumes;
    return perfumes.filter((item) => [item.name, item.top_notes, item.mid_notes, item.base_notes].some((value) => value.toLocaleLowerCase().includes(needle)));
  }, [perfumes, query]);

  const activeIndex = activeId === null ? -1 : filtered.findIndex((item) => item.id === activeId);
  const active = activeIndex >= 0 ? filtered[activeIndex] : null;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!active || filtered.length < 1) return;
      if (event.key === 'Escape') setActiveId(null);
      if (event.key === 'ArrowLeft') setActiveId(filtered[(activeIndex - 1 + filtered.length) % filtered.length].id);
      if (event.key === 'ArrowRight') setActiveId(filtered[(activeIndex + 1) % filtered.length].id);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, activeIndex, filtered]);

  const parseNotes = (value: string) => value.split(',').map((item) => item.trim()).filter(Boolean);
  const date = (value: string) => new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(value));

  return (
    <main className="site-shell pb-24">
      <section className="hero">
        <div>
          <div className="eyebrow">Visual scent archive</div>
          <h1 className="display-title">The Archive.</h1>
          <p className="hero-copy">Kumpulan formula dan moodboard yang sudah melewati meja racik. Cari berdasarkan nama maupun note.</p>
        </div>
        <div className="hero-stat"><strong>{perfumes.length}</strong><span>CONCEPTS SAVED</span></div>
      </section>

      <section className="atelier-panel">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between mb-6">
          <div className="panel-kicker !mb-0 flex-1">Collection</div>
          <div className="flex gap-2 sm:w-[420px]">
            <input className="field flex-1 text-[12px]" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search perfume or note…" />
            <button className="soft-button px-4 text-[11px]" onClick={() => void fetchGallery()}>Refresh</button>
          </div>
        </div>

        {loading && <div className="py-24 text-center"><div className="inline-block w-7 h-7 rounded-full spin-lab" style={{ border: '1px solid var(--line)', borderTopColor: 'var(--brass)' }} /><div className="eyebrow mt-3">Loading archive</div></div>}
        {!loading && error && <div className="py-16 text-center"><p style={{ color: '#d98b8b' }}>{error}</p><button className="soft-button px-4 py-2 mt-3 text-[11px]" onClick={() => void fetchGallery()}>Try again</button></div>}
        {!loading && !error && filtered.length === 0 && <div className="py-24 text-center"><div className="font-serif-lab text-[38px]" style={{ color: 'var(--paper-soft)' }}>{query ? 'No matching formula.' : 'The archive is empty.'}</div><p className="mt-2 text-[12px]" style={{ color: 'var(--muted)' }}>{query ? 'Try another note or perfume name.' : 'Generate a formula, create its moodboard, then save it here.'}</p></div>}

        {!loading && !error && filtered.length > 0 && (
          <div className="gallery-grid">
            {filtered.map((perfume) => (
              <button key={perfume.id} className="gallery-card text-left" onClick={() => setActiveId(perfume.id)} aria-label={`Open ${perfume.name}`}>
                <Image src={perfume.image_url} alt={perfume.name} fill className="object-cover" sizes="(max-width: 640px) 50vw, (max-width: 1000px) 33vw, 240px" />
                <span className="gallery-shade" />
                <span className="gallery-meta">
                  <span className="eyebrow block mb-1">{date(perfume.created_at)}</span>
                  <span className="font-serif-lab text-[26px] leading-none block">{perfume.name}</span>
                  <span className="text-[10px] mt-3 block truncate" style={{ color: 'var(--paper-soft)' }}>{perfume.top_notes}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {active && (
        <div className="modal-backdrop" onClick={() => setActiveId(null)}>
          <div className="modal-panel grid md:grid-cols-[minmax(280px,.8fr)_1fr] overflow-y-auto" onClick={(event) => event.stopPropagation()}>
            <div className="relative min-h-[420px] md:min-h-[680px]">
              <Image src={active.image_url} alt={active.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 420px" priority />
            </div>
            <div className="p-6 md:p-8">
              <div className="eyebrow">{date(active.created_at)}</div>
              <h2 className="font-serif-lab text-[48px] leading-none mt-2 mb-7">{active.name}</h2>
              {[
                ['Top notes', active.top_notes],
                ['Heart notes', active.mid_notes],
                ['Base notes', active.base_notes],
              ].map(([label, notes]) => <div className="formula-row" key={label}><div className="formula-row-title">{label}</div><div className="flex flex-wrap gap-1.5">{parseNotes(notes).map((note) => <span className="note-chip" key={note}>{note}</span>)}</div></div>)}
              <div className="flex gap-2 mt-7">
                <button className="soft-button px-4 py-2 text-[11px]" onClick={() => setActiveId(filtered[(activeIndex - 1 + filtered.length) % filtered.length].id)}>← Previous</button>
                <button className="soft-button px-4 py-2 text-[11px]" onClick={() => setActiveId(filtered[(activeIndex + 1) % filtered.length].id)}>Next →</button>
              </div>
            </div>
            <button className="ghost-button absolute top-4 right-4 w-10 h-10 bg-black/50" onClick={() => setActiveId(null)} aria-label="Close preview">×</button>
          </div>
        </div>
      )}
    </main>
  );
}
