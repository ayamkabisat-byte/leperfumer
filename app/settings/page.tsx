// app/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [geminiKey, setGeminiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('gemini_user_key');
    if (stored) setGeminiKey(stored);
  }, []);

  const handleSave = () => {
    localStorage.setItem('gemini_user_key', geminiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <main className="max-w-lg mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-serif font-bold mb-6">⚙️ Setelan API</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border shadow-sm">
        <label className="block text-sm font-semibold mb-2">Google Gemini API Key</label>
        <input
          type="password"
          value={geminiKey}
          onChange={(e) => setGeminiKey(e.target.value)}
          placeholder="AIza... (opsional)"
          className="w-full px-4 py-3 border rounded-xl bg-gray-50 dark:bg-gray-900"
        />
        <p className="text-xs text-gray-500 mt-2">
          Jika dikosongkan, aplikasi akan menggunakan key bawaan server.
        </p>
        <button
          onClick={handleSave}
          className="mt-4 w-full bg-gray-900 dark:bg-indigo-600 hover:bg-gray-800 text-white font-medium py-2 rounded-xl transition"
        >
          {saved ? '✅ Tersimpan' : 'Simpan'}
        </button>
      </div>
    </main>
  );
}