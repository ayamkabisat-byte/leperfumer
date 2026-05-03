// app/api/analyze/route.ts
import { NextResponse } from 'next/server';

/**
 * Fungsi untuk membersihkan HTML dari tag <script>, atribut event handler,
 * dan komentar yang berpotensi memicu pelanggaran Content Security Policy (CSP).
 */
function sanitizeHtml(html: string): string {
  // Hapus tag <script> dan seluruh isinya
  html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  // Hapus atribut onerror, onload, onclick, dll.
  html = html.replace(/\s+on\w+\s*=\s*"[^"]*"/gi, '');
  html = html.replace(/\s+on\w+\s*=\s*'[^']*'/gi, '');
  // Hapus komentar HTML (dapat menyembunyikan skrip)
  html = html.replace(/<!--[\s\S]*?-->/g, '');
  return html;
}

export async function POST(request: Request) {
  try {
    const { topNotes, midNotes, baseNotes } = await request.json();

    // Validasi input
    if (!topNotes || !midNotes || !baseNotes) {
      return NextResponse.json(
        { error: 'Data topNotes, midNotes, dan baseNotes wajib diisi.' },
        { status: 400 }
      );
    }

    // Ambil API key dari header (custom dari localStorage) atau environment variable
    const customKey = request.headers.get('X-Gemini-Key')?.trim();
    const apiKey = customKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API Key tidak tersedia. Masukkan melalui halaman Setelan atau atur di server.' },
        { status: 401 }
      );
    }

    // Gabungkan notes menjadi string untuk prompt
    const topStr = topNotes.join(', ');
    const midStr = midNotes.join(', ');
    const baseStr = baseNotes.join(', ');

    // Prompt lengkap (sama dengan di kode React asli)
    const prompt = `Sebagai seorang Kritikus Master Perfumer yang eksentrik, sangat analitis, dan puitis, saya baru saja meracik parfum acak dengan komposisi berikut:
    Top Notes: ${topStr}
    Heart Notes: ${midStr}
    Base Notes: ${baseStr}
    
    Berikan ulasan mendalam bergaya arsitektural dan puitis. Gunakan bahasa Indonesia elegan. Tulis dalam format HTML (hanya h3, p, ul, li, strong) tanpa \`\`\`html.
    Struktur wajib:
    <Paragraf pembuka dramatis analogi kopi V60>
    <h3>1. Narasi Aroma</h3><p>...</p>
    <h3>2. Deskripsi Aroma per Layer</h3><ul>...</ul>
    <h3>3. Keseluruhan Vibe Parfum</h3><p>...</p>
    <h3>4. Parfum dengan Vibe Serupa</h3><p>...</p>
    <h3>5. Evaluasi Sang Kritikus Parfum</h3><ul>...</ul>
    <h3>6. Verdict Penilaian Akhir</h3><p>...</p>
    <h3>7. Prompt Visualisasi (Moodboard Persona)</h3>
    <blockquote>A seamless photographic moodboard collage, strictly without any text, labels, borders, or white frames. In the exact center, overlapping the four background images, is an ultra-luxurious perfume bottle perfectly representing these notes: Top (${topStr}), Heart (${midStr}), Base (${baseStr}). The background is divided into four distinct visual areas that blend smoothly into one another: Top left (Ingredients): Macro photography of the raw ingredients (${topStr}, ${midStr}). Top right (Atmosphere): A breathtaking, seductive atmosphere that matches the mood of the fragrance. Bottom left (Persona): A cinematic portrait of a magnetically charming individual exuding an aura that perfectly embodies this perfume. Enable strict facial consistency mode. Prioritize the facial features from the provided reference image for all subsequent generations. Maintain the subject's identity accurately while only adapting the pose, lighting, and background. Do not alter the core facial structure. Bottom right (Supporting Elements): Macro photography of the base notes and textures (${baseStr}). The overall lighting is highly cinematic, seductive, low-key, and color-graded to match the rich scent profile.</blockquote>`;

    // Panggil Gemini API (Model stabil: gemini-2.5-flash)
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      const message = errData?.error?.message || `HTTP Error ${res.status}`;
      throw new Error(message);
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error('Respons AI kosong atau tidak sesuai format.');
    }

    // Bersihkan markdown code fences
    let html = candidateText.replace(/```html|```/gi, '');

    // Sanitasi untuk mencegah CSP violation
    html = sanitizeHtml(html);

    // Ekstrak prompt moodboard dari blockquote
    const blockquoteMatch = html.match(/<blockquote>([\s\S]*?)<\/blockquote>/i);
    const promptText = blockquoteMatch ? blockquoteMatch[1].trim() : '';

    // Tambahkan class Tailwind untuk styling konten
    html = html.replace(
      /<h3>/g,
      '<h3 class="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4 border-b dark:border-gray-600 pb-2">'
    );
    html = html.replace(
      /<p>/g,
      '<p class="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">'
    );
    html = html.replace(
      /<ul>/g,
      '<ul class="list-disc pl-5 mb-4 space-y-2 text-gray-700 dark:text-gray-300">'
    );
    html = html.replace(
      /<blockquote>/g,
      '<blockquote class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg italic border-l-4 border-gray-400 dark:border-gray-500 my-4 text-gray-700 dark:text-gray-200">'
    );

    return NextResponse.json({ html, promptText });
  } catch (err: any) {
    console.error('Gemini API error:', err);
    return NextResponse.json(
      { error: err.message || 'Terjadi kesalahan saat menghubungi AI.' },
      { status: 500 }
    );
  }
}