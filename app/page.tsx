'use client';

import { useState } from 'react';
import { 
  Wand2, Save, Sparkles, AlertCircle, RefreshCcw, 
  Droplets, Wind, Mountain, Plus, X, Image as ImageIcon,
  ClipboardList
} from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  const [topNotes, setTopNotes] = useState<string[]>([]);
  const [midNotes, setMidNotes] = useState<string[]>([]);
  const [baseNotes, setBaseNotes] = useState<string[]>([]);
  const [currentTop, setCurrentTop] = useState('');
  const [currentMid, setCurrentMid] = useState('');
  const [currentBase, setCurrentBase] = useState('');
  
  // State untuk Input Bulk (Manual Copy Paste)
  const [bulkTop, setBulkTop] = useState('');
  const [bulkMid, setBulkMid] = useState('');
  const [bulkBase, setBulkBase] = useState('');

  const [brand, setBrand] = useState('');
  const [modelName, setModelName] = useState('');
  const [scentType, setScentType] = useState('Eau de Parfum');
  const [customPrompt, setCustomPrompt] = useState('');

  const [analysisResult, setAnalysisResult] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const addNote = (type: 'top' | 'mid' | 'base') => {
    if (type === 'top' && currentTop.trim()) {
      setTopNotes([...topNotes, currentTop.trim()]);
      setCurrentTop('');
    } else if (type === 'mid' && currentMid.trim()) {
      setMidNotes([...midNotes, currentMid.trim()]);
      setCurrentMid('');
    } else if (type === 'base' && currentBase.trim()) {
      setBaseNotes([...baseNotes, currentBase.trim()]);
      setCurrentBase('');
    }
  };

  const removeNote = (type: 'top' | 'mid' | 'base', index: number) => {
    if (type === 'top') setTopNotes(topNotes.filter((_, i) => i !== index));
    if (type === 'mid') setMidNotes(midNotes.filter((_, i) => i !== index));
    if (type === 'base') setBaseNotes(baseNotes.filter((_, i) => i !== index));
  };

  // Fungsi untuk memproses teks input manual
  const handleBulkInput = () => {
    const processNotes = (text: string, existingNotes: string[]) => {
      if (!text.trim()) return existingNotes;
      // Pisahkan berdasarkan koma, baris baru, atau '&'
      const newNotes = text.split(/[,&\n]/)
        .map(n => n.trim())
        .filter(n => n);
      return Array.from(new Set([...existingNotes, ...newNotes]));
    };

    if (bulkTop.trim()) setTopNotes(prev => processNotes(bulkTop, prev));
    if (bulkMid.trim()) setMidNotes(prev => processNotes(bulkMid, prev));
    if (bulkBase.trim()) setBaseNotes(prev => processNotes(bulkBase, prev));

    // Reset form bulk
    setBulkTop('');
    setBulkMid('');
    setBulkBase('');
  };

  const handleAnalyze = async () => {
    if (!brand || !modelName || topNotes.length === 0 || midNotes.length === 0 || baseNotes.length === 0) {
      setError('Mohon lengkapi Brand, Nama, dan minimal 1 note untuk setiap tingkatan.');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setAnalysisResult('');
    setImageUrl('');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand,
          modelName,
          scentType,
          topNotes,
          midNotes,
          baseNotes,
          customPrompt
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal menganalisis parfum');
      }

      const data = await response.json();
      setAnalysisResult(data.analysis);
      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat analisis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!analysisResult) return;
    
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand,
          name: modelName,
          type: scentType,
          top_notes: topNotes,
          mid_notes: midNotes,
          base_notes: baseNotes,
          ai_analysis: analysisResult,
          image_url: imageUrl || null
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal menyimpan ke database');
      }

      setSuccess('Parfum berhasil disimpan ke dalam Gallery!');
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setTopNotes([]);
    setMidNotes([]);
    setBaseNotes([]);
    setBrand('');
    setModelName('');
    setCustomPrompt('');
    setAnalysisResult('');
    setImageUrl('');
    setError('');
    setSuccess('');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 flex items-center justify-center gap-3">
          <Sparkles className="w-10 h-10 text-slate-700" />
          Le Perfumer AI
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          Arsitek Aroma Digital Anda. Bedah racikan notes dan temukan filosofi di balik setiap mahakarya parfum.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6 border-b pb-3">Informasi Profil Parfum</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Brand Parfum</label>
                <input 
                  type="text" 
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Dior, Chanel, HMNS" 
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nama / Model</label>
                <input 
                  type="text" 
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="e.g. Sauvage, Orgasm" 
                  className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all outline-none"
                />
              </div>
            </div>

            <div className="mb-8">
          <label className="block text-sm font-semibold text-slate-700 mb-1">Tipe / Konsentrasi</label>
          <select 
            value={scentType}
            onChange={(e) => setScentType(e.target.value)}
            className="w-full p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none"
          >
            <option>Eau de Cologne (EdC)</option>
            <option>Eau de Toilette (EdT)</option>
            <option>Eau de Parfum (EdP)</option>
            <option>Extrait de Parfum</option>
          </select>
        </div>

        {/* Input Manual Lengkap */}
        <div className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-slate-600" />
            Input Notes Cepat (Copy-Paste)
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Pisahkan setiap note dengan koma (,) atau baris baru pada masing-masing tingkatan.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Top Notes</label>
              <textarea
                value={bulkTop}
                onChange={(e) => setBulkTop(e.target.value)}
                rows={3}
                className="w-full p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder="Bergamot, Lemon..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Heart Notes</label>
              <textarea
                value={bulkMid}
                onChange={(e) => setBulkMid(e.target.value)}
                rows={3}
                className="w-full p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-none resize-none"
                placeholder="Rose, Jasmine..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Base Notes</label>
              <textarea
                value={bulkBase}
                onChange={(e) => setBulkBase(e.target.value)}
                rows={3}
                className="w-full p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                placeholder="Musk, Amber..."
              />
            </div>
          </div>
          <button
            onClick={handleBulkInput}
            disabled={!bulkTop.trim() && !bulkMid.trim() && !bulkBase.trim()}
            className="mt-4 px-4 py-2 bg-slate-200 text-slate-800 font-medium text-sm rounded-lg hover:bg-slate-300 disabled:opacity-50 transition-colors w-full"
          >
            Ekstrak & Input Notes
          </button>
        </div>

        <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-3">Piramida Olfaktori</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Top Notes */}
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Wind className="w-4 h-4 text-blue-500" />
                  Top Notes
                </h3>
                <div className="flex gap-2 mb-3">
                  <input 
                    type="text" 
                    value={currentTop}
                    onChange={(e) => setCurrentTop(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addNote('top')}
                    placeholder="Tambah note..." 
                    className="w-full p-2 text-sm border border-blue-200 rounded-md focus:ring-2 focus:ring-blue-400 outline-none"
                  />
                  <button onClick={() => addNote('top')} className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {topNotes.map((note, i) => (
                    <span key={i} className="inline-flex items-center text-xs bg-white border border-blue-200 text-blue-800 px-2 py-1 rounded-full">
                      {note}
                      <button onClick={() => removeNote('top', i)} className="ml-1 text-blue-400 hover:text-blue-600">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Middle Notes */}
              <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100">
                <h3 className="font-semibold text-rose-900 mb-3 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-rose-500" />
                  Heart Notes
                </h3>
                <div className="flex gap-2 mb-3">
                  <input 
                    type="text" 
                    value={currentMid}
                    onChange={(e) => setCurrentMid(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addNote('mid')}
                    placeholder="Tambah note..." 
                    className="w-full p-2 text-sm border border-rose-200 rounded-md focus:ring-2 focus:ring-rose-400 outline-none"
                  />
                  <button onClick={() => addNote('mid')} className="p-2 bg-rose-600 text-white rounded-md hover:bg-rose-700">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {midNotes.map((note, i) => (
                    <span key={i} className="inline-flex items-center text-xs bg-white border border-rose-200 text-rose-800 px-2 py-1 rounded-full">
                      {note}
                      <button onClick={() => removeNote('mid', i)} className="ml-1 text-rose-400 hover:text-rose-600">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Base Notes */}
              <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                  <Mountain className="w-4 h-4 text-amber-500" />
                  Base Notes
                </h3>
                <div className="flex gap-2 mb-3">
                  <input 
                    type="text" 
                    value={currentBase}
                    onChange={(e) => setCurrentBase(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addNote('base')}
                    placeholder="Tambah note..." 
                    className="w-full p-2 text-sm border border-amber-200 rounded-md focus:ring-2 focus:ring-amber-400 outline-none"
                  />
                  <button onClick={() => addNote('base')} className="p-2 bg-amber-600 text-white rounded-md hover:bg-amber-700">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {baseNotes.map((note, i) => (
                    <span key={i} className="inline-flex items-center text-xs bg-white border border-amber-200 text-amber-800 px-2 py-1 rounded-full">
                      {note}
                      <button onClick={() => removeNote('base', i)} className="ml-1 text-amber-400 hover:text-amber-600">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom Prompt */}
            <div className="mt-8 pt-6 border-t">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Custom Arahan AI (Opsional)</label>
              <textarea 
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Misal: Fokus pada deskripsi wangi woody-nya, atau gunakan gaya bahasa yang lebih puitis..." 
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 outline-none resize-none h-20 text-sm"
              />
            </div>

            <div className="mt-8 flex gap-3">
              <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="flex-1 bg-slate-900 text-white font-bold py-3.5 px-6 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sedang Meracik...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    Mulai Audit Parfum
                  </>
                )}
              </button>
              <button 
                onClick={handleReset}
                className="p-3.5 border border-slate-300 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
                title="Reset Form"
              >
                <RefreshCcw className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm border border-red-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}
            {success && (
              <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center gap-2 text-sm border border-green-200">
                <Sparkles className="w-4 h-4 flex-shrink-0" />
                {success}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Results & Visualization */}
        <div className="lg:col-span-5 space-y-6">
          {/* Moodboard Panel */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center min-h-[300px]">
            <h2 className="text-xl font-bold text-slate-800 mb-4 self-start w-full border-b pb-3 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-slate-500" />
              Visual Moodboard
            </h2>
            
            {imageUrl ? (
              <div className="w-full relative aspect-square rounded-xl overflow-hidden border border-slate-200 shadow-inner">
                <Image 
                  src={imageUrl} 
                  alt="Perfume Moodboard" 
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-full aspect-square bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                <ImageIcon className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm">Moodboard visual akan muncul di sini setelah Anda melakukan analisis racikan.</p>
              </div>
            )}
          </div>

          {/* Analysis Report Panel */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <h2 className="text-xl font-bold text-slate-800">Laporan Auditor</h2>
              {analysisResult && (
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 text-sm font-medium flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Menyimpan...' : 'Simpan'}
                </button>
              )}
            </div>
            
            {analysisResult ? (
              <div className="prose prose-slate prose-sm max-w-none">
                <div 
                  className="whitespace-pre-wrap text-slate-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: analysisResult.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                />
              </div>
            ) : (
              <div className="text-center text-slate-400 py-12">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Silakan isi formulir dan klik "Mulai Audit" untuk melihat bedah aroma.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
