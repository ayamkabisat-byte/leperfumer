'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';

const AMBER  = 'oklch(72% 0.18 68)';
const PURPLE = 'oklch(72% 0.18 300)';
const BLUE   = 'oklch(72% 0.18 228)';

interface Perfume {
  id: number; name: string;
  top_notes: string; mid_notes: string; base_notes: string;
  image_url: string; created_at: string;
}

export default function GalleryPage() {
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const fetchGallery = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('perfumes').select('*').order('created_at', { ascending: false });
    if (error) console.error(error); else setPerfumes(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchGallery(); }, []);

  // keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (activeIdx === null) return;
      if (e.key === 'Escape') setActiveIdx(null);
      if (e.key === 'ArrowLeft')  setActiveIdx((i) => i === null ? null : (i - 1 + perfumes.length) % perfumes.length);
      if (e.key === 'ArrowRight') setActiveIdx((i) => i === null ? null : (i + 1) % perfumes.length);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeIdx, perfumes.length]);

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('id-ID', { year:'numeric', month:'long', day:'numeric' });
  const parseNotes = (s: string) => s.split(',').map(n => n.trim()).filter(Boolean);

  return (
    <main className="max-w-[1320px] mx-auto px-6 pb-20">
      <header className="text-center pt-14 pb-10">
        <h1 className="font-serif-lab font-light"
          style={{ fontSize: 'clamp(32px, 5vw, 52px)', letterSpacing: '0.04em',
            background: `linear-gradient(135deg, ${AMBER} 0%, #e8e6e0 55%, ${PURPLE} 100%)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Koleksi Moodboard
        </h1>
        <p className="font-mono-lab uppercase mt-2" style={{ fontSize: 11, letterSpacing: '0.14em', color: '#7a7872' }}>
          Arsip mahakarya aroma Anda
        </p>
      </header>

      <div className="flex items-center justify-between mb-5">
        <div className="font-mono-lab" style={{ fontSize: 11, letterSpacing: '0.1em', color: '#7a7872' }}>
          {loading ? 'Memuat...' : <><span style={{ color: AMBER }}>{perfumes.length}</span> karya tersimpan</>}
        </div>
        <button onClick={fetchGallery}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-mono-lab uppercase"
          style={{ fontSize: 10, letterSpacing: '0.1em',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.14)',
            color: '#b0aca4', cursor: 'pointer' }}>
          ↻ Segarkan
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 gap-3">
          <div className="w-7 h-7 rounded-full spin-lab"
            style={{ border: '2px solid rgba(255,255,255,0.08)', borderTopColor: AMBER }}></div>
          <span className="font-mono-lab uppercase" style={{ fontSize: 11, letterSpacing: '0.12em', color: '#7a7872' }}>
            Memuat koleksi...
          </span>
        </div>
      )}

      {!loading && perfumes.length === 0 && (
        <div className="panel-lab p-16 text-center">
          <h3 className="font-serif-lab font-light mb-2" style={{ fontSize: 28, color: '#b0aca4' }}>Koleksi kosong</h3>
          <p className="font-mono-lab" style={{ fontSize: 11, color: '#7a7872' }}>
            Buat racikan dan unggah gambar moodboard-nya.
          </p>
        </div>
      )}

      {!loading && perfumes.length > 0 && (
        <div className="grid gap-2.5"
          style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
          {perfumes.map((p, idx) => (
            <div key={p.id} onClick={() => setActiveIdx(idx)}
              className="relative cursor-pointer rounded-xl overflow-hidden transition group"
              style={{ aspectRatio: '9 / 14', background: '#181c22',
                border: '1px solid rgba(255,255,255,0.07)' }}>
              <Image src={p.image_url} alt={p.name} fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="(max-width: 800px) 33vw, 20vw"/>
              <div className="absolute inset-0 transition"
                style={{ background: 'linear-gradient(to top, rgba(8,8,10,0.95) 0%, rgba(8,8,10,0.5) 50%, transparent 100%)' }}></div>
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="font-serif-lab" style={{ fontSize: 14, color: '#e8e6e0', marginBottom: 6 }}>
                  {p.name}
                </div>
                <div style={{ fontSize: 9, lineHeight: 1.5, color: '#7a7872' }}>
                  <div className="truncate"><span style={{ color: AMBER, fontFamily: 'Space Mono, monospace' }}>Top </span>{p.top_notes}</div>
                  <div className="truncate"><span style={{ color: PURPLE, fontFamily: 'Space Mono, monospace' }}>Heart </span>{p.mid_notes}</div>
                  <div className="truncate"><span style={{ color: BLUE, fontFamily: 'Space Mono, monospace' }}>Base </span>{p.base_notes}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {activeIdx !== null && perfumes[activeIdx] && (
        <div onClick={() => setActiveIdx(null)}
          className="fixed inset-0 z-[200] flex items-center justify-center p-5"
          style={{ background: 'rgba(6,7,9,0.96)', backdropFilter: 'blur(8px)' }}>
          <div onClick={e => e.stopPropagation()}
            className="flex flex-col md:flex-row gap-8 max-w-5xl w-full max-h-[90vh]">
            <div className="relative rounded-2xl overflow-hidden flex-shrink-0"
              style={{ width: 'min(420px, 48vw)', aspectRatio: '9 / 14',
                border: '1px solid rgba(255,255,255,0.14)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.7)' }}>
              <Image src={perfumes[activeIdx].image_url} alt={perfumes[activeIdx].name} fill className="object-cover" sizes="420px"/>
            </div>
            <div className="flex-1 min-w-0 pt-2">
              <h2 className="font-serif-lab font-light mb-1"
                style={{ fontSize: 36, letterSpacing: '0.04em', color: '#e8e6e0' }}>
                {perfumes[activeIdx].name}
              </h2>
              <div className="font-mono-lab uppercase mb-7" style={{ fontSize: 10, letterSpacing: '0.1em', color: '#7a7872' }}>
                {formatDate(perfumes[activeIdx].created_at)}
              </div>

              {[
                { label: 'Top Notes',   notes: perfumes[activeIdx].top_notes,  c: AMBER },
                { label: 'Heart Notes', notes: perfumes[activeIdx].mid_notes,  c: PURPLE },
                { label: 'Base Notes',  notes: perfumes[activeIdx].base_notes, c: BLUE },
              ].map(({ label, notes, c }) => (
                <div key={label} className="mb-5">
                  <div className="flex items-center gap-2 mb-2 font-mono-lab uppercase"
                    style={{ fontSize: 9, letterSpacing: '0.14em', color: c }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: c, boxShadow: `0 0 8px ${c}` }}></div>
                    {label}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {parseNotes(notes).map((n, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-full"
                        style={{ fontSize: 11, background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.07)', color: '#b0aca4' }}>
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex gap-2 mt-7">
                <button onClick={() => setActiveIdx((activeIdx - 1 + perfumes.length) % perfumes.length)}
                  className="px-4 py-2 rounded-lg font-mono-lab uppercase"
                  style={{ fontSize: 10, letterSpacing: '0.1em',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.14)',
                    color: '#b0aca4', cursor: 'pointer' }}>← Sebelumnya</button>
                <button onClick={() => setActiveIdx((activeIdx + 1) % perfumes.length)}
                  className="px-4 py-2 rounded-lg font-mono-lab uppercase"
                  style={{ fontSize: 10, letterSpacing: '0.1em',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.14)',
                    color: '#b0aca4', cursor: 'pointer' }}>Selanjutnya →</button>
              </div>

              <div className="mt-4 font-mono-lab" style={{ fontSize: 9, color: '#7a7872', letterSpacing: '0.1em' }}>
                {activeIdx + 1} / {perfumes.length}
              </div>
            </div>
          </div>

          <button onClick={() => setActiveIdx(null)}
            className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.14)',
              color: '#b0aca4', cursor: 'pointer' }}>✕</button>
        </div>
      )}
    </main>
  );
}