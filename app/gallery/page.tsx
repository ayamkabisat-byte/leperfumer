// app/gallery/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';

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

  const fetchGallery = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('perfumes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching gallery:', error);
    } else {
      setPerfumes(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-serif font-bold mb-8 text-center">📸 Koleksi Moodboard</h1>

      {loading && (
        <div className="text-center py-20">
          <div className="inline-block w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {!loading && perfumes.length === 0 && (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border">
          <p className="text-gray-500">Belum ada parfum yang diunggah.</p>
          <p className="text-sm text-gray-400 mt-2">
            Silakan buat racikan dan unggah gambar dari halaman Racik.
          </p>
        </div>
      )}

      {!loading && perfumes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {perfumes.map((perfume) => (
            <div
              key={perfume.id}
              className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden shadow-md group"
            >
              {/* Gambar penuh */}
              <Image
                src={perfume.image_url}
                alt={perfume.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              {/* Overlay vignette hitam di bawah */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              {/* Teks overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h2 className="text-lg font-bold font-serif mb-2">{perfume.name}</h2>
                <div className="space-y-1 text-xs">
                  <p><span className="font-semibold text-yellow-300">Top:</span> {perfume.top_notes}</p>
                  <p><span className="font-semibold text-pink-300">Heart:</span> {perfume.mid_notes}</p>
                  <p><span className="font-semibold text-stone-300">Base:</span> {perfume.base_notes}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <div className="text-center mt-8">
          <button
            onClick={fetchGallery}
            className="text-sm bg-white dark:bg-gray-800 border px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            🔄 Segarkan
          </button>
        </div>
      )}
    </div>
  );
}