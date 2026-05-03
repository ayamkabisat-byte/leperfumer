'use client';

import { useState } from 'react';
import { getRandomRecipe, type Recipe } from '@/lib/perfumeDB';
import { Sparkles, Beaker, Copy, CloudUpload } from 'lucide-react';

export default function GeneratorPage() {
  const [counts, setCounts] = useState({ top: 2, mid: 3, base: 2 });
  const [includeSynth, setIncludeSynth] = useState({
    top: false,
    mid: false,
    base: false,
  });
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [promptText, setPromptText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Upload states (opsional, bisa ditambahkan nanti)
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleGenerate = () => {
    setAiResult('');
    setPromptText('');
    setErrorMsg('');
    setUploadStatus('');

    const newRecipe = getRandomRecipe(counts, includeSynth);
    setRecipe(newRecipe);
  };

  const analyzePerfume = async () => {
    if (!recipe) return;

    setAiLoading(true);
    setErrorMsg('');

    const userKey = localStorage.getItem('gemini_user_key') || '';

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userKey ? { 'X-Gemini-Key': userKey } : {}),
        },
        body: JSON.stringify({
          topNotes: recipe.top.map((n) => n.name),
          midNotes: recipe.mid.map((n) => n.name),
          baseNotes: recipe.base.map((n) => n.name),
        }),
      });

      const data = await res.json();
      if (data.error) {
        setErrorMsg(data.error);
        return;
      }

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
      // fallback
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert(message);
    });
  };

  const handleUpload = async () => {
    if (!uploadFile || !recipe) return;
    setUploadStatus('Mengunggah...');

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('name', recipe.name);
    formData.append('top_notes', recipe.top.map(n => n.name).join(', '));
    formData.append('mid_notes', recipe.mid.map(n => n.name).join(', '));
    formData.append('base_notes', recipe.base.map(n => n.name).join(', '));

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.error) {
        setUploadStatus(`❌ ${data.error}`);
      } else {
        setUploadStatus('✅ Berhasil diunggah ke Galeri!');
        setUploadFile(null);
      }
    } catch (err: any) {
      setUploadStatus(`❌ Error: ${err.message}`);
    }
  };

  return (
    <main className="p-4 md:p-8 max-w-6xl mx-auto">
      <header className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 font-serif">Laboratorium Aroma</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Database 1.800+ notes. Racik dan bedah mahakarya Anda.
        </p>
      </header>

      {/* Konfigurasi */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border max-w-4xl mx-auto mb-8">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2 font-serif">Formula</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {['top', 'mid', 'base'].map((layer) => (
            <div key={layer}>
              <label className="block text-sm font-medium capitalize mb-1">
                {layer} Notes: {counts[layer as keyof typeof counts]}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={counts[layer as keyof typeof counts]}
                onChange={(e) =>
                  setCounts({ ...counts, [layer]: parseInt(e.target.value) })
                }
                className="w-full cursor-pointer accent-indigo-600"
              />
              <label className="mt-2 flex items-center justify-center bg-gray-50 dark:bg-gray-700 p-2 rounded-md border cursor-pointer hover:bg-gray-100">
                <input
                  type="checkbox"
                  checked={includeSynth[layer as keyof typeof includeSynth]}
                  onChange={(e) =>
                    setIncludeSynth({ ...includeSynth, [layer]: e.target.checked })
                  }
                  className="rounded text-indigo-600"
                />
                <span className="ml-2 text-xs font-medium">+ Sintetis & Unik</span>
              </label>
            </div>
          ))}
        </div>
        <button
          onClick={handleGenerate}
          className="w-full md:w-auto mx-auto block bg-gray-900 dark:bg-indigo-600 hover:bg-gray-800 text-white font-bold py-3 px-10 rounded-full shadow-lg transition-transform hover:scale-105"
        >
          ✨ Putar Roda Aroma
        </button>
      </div>

      {/* Hasil Racikan */}
      {recipe && (
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold font-serif">{recipe.name}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <NotesCard title="Top Notes" items={recipe.top} color="yellow" />
            <NotesCard title="Heart Notes" items={recipe.mid} color="pink" />
            <NotesCard title="Base Notes" items={recipe.base} color="stone" />
          </div>

          <div className="flex flex-wrap justify-center gap-4 border-t pt-8">
            <button
              onClick={analyzePerfume}
              disabled={aiLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-xl flex items-center gap-2 disabled:opacity-50"
            >
              {aiLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Beaker className="w-5 h-5" />
              )}
              Bedah Aroma dengan AI
            </button>
          </div>

          {errorMsg && <p className="text-red-500 text-center mt-4">{errorMsg}</p>}

          {/* AI Result */}
          {aiResult && (
            <div className="mt-8 bg-white dark:bg-gray-800 p-8 rounded-2xl border shadow-sm animate-fade-in">
              <div dangerouslySetInnerHTML={{ __html: aiResult }} />

              {promptText && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => copyToClipboard(promptText, 'Prompt moodboard disalin!')}
                    className="bg-stone-800 hover:bg-stone-700 text-white py-2 px-6 rounded-full flex items-center gap-2 text-sm"
                  >
                    <Copy className="w-4 h-4" /> Salin Prompt Moodboard
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Upload Section */}
          {aiResult && (
            <div className="mt-12 bg-indigo-50 dark:bg-indigo-900/10 p-8 rounded-2xl border text-center animate-fade-in">
              <CloudUpload className="w-10 h-10 mx-auto text-indigo-500 mb-3" />
              <h3 className="text-2xl font-bold font-serif mb-2">Simpan Karya ke Galeri</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Pilih gambar hasil render prompt Anda dan simpan ke Supabase.
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="block w-full max-w-sm mx-auto mb-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700"
              />
              <button
                onClick={handleUpload}
                disabled={!uploadFile}
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-8 rounded-full font-bold disabled:opacity-50"
              >
                Unggah Sekarang
              </button>
              {uploadStatus && <p className="mt-3 text-sm font-medium">{uploadStatus}</p>}
            </div>
          )}
        </div>
      )}
    </main>
  );
}

// Komponen kecil untuk card layer notes
function NotesCard({ title, items, color }: { title: string; items: { name: string; cat: string }[]; color: string }) {
  const bgMap: Record<string, string> = {
    yellow: 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-100 dark:border-yellow-900/30',
    pink: 'bg-pink-50 dark:bg-pink-900/10 border-pink-100 dark:border-pink-900/30',
    stone: 'bg-stone-50 dark:bg-stone-800/30 border-stone-100 dark:border-stone-700',
  };
  const textMap: Record<string, string> = {
    yellow: 'text-yellow-800 dark:text-yellow-400',
    pink: 'text-pink-800 dark:text-pink-400',
    stone: 'text-stone-800 dark:text-stone-300',
  };

  return (
    <div className={`p-5 rounded-xl border ${bgMap[color] || ''}`}>
      <h3 className={`font-bold mb-3 border-b pb-2 ${textMap[color] || ''}`}>{title}</h3>
      <ul className="space-y-2">
        {items.map((n, i) => (
          <li
            key={i}
            className="text-sm bg-white dark:bg-gray-800 p-2 rounded shadow-sm flex justify-between"
          >
            <span>{n.name}</span>
            <span className="text-[10px] text-gray-400">{n.cat}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}