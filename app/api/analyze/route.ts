import { NextResponse } from 'next/server';

/**
 * Membersihkan HTML dari tag <script>, atribut event handler,
 * dan komentar yang berpotensi memicu pelanggaran Content Security Policy (CSP).
 */
function sanitizeHtml(html: string): string {
  html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/\s+on\w+\s*=\s*"[^"]*"/gi, '');
  html = html.replace(/\s+on\w+\s*=\s*'[^']*'/gi, '');
  html = html.replace(/<!--[\s\S]*?-->/g, '');
  return html;
}

export async function POST(request: Request) {
  try {
    const { topNotes, midNotes, baseNotes } = await request.json();

    if (!topNotes || !midNotes || !baseNotes) {
      return NextResponse.json(
        { error: 'Data topNotes, midNotes, dan baseNotes wajib diisi.' },
        { status: 400 }
      );
    }

    const customKey = request.headers.get('X-Gemini-Key')?.trim();
    const apiKey = customKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API Key tidak tersedia. Masukkan melalui halaman Setelan atau atur di server.' },
        { status: 401 }
      );
    }

    const topStr = topNotes.join(', ');
    const midStr = midNotes.join(', ');
    const baseStr = baseNotes.join(', ');

    // --- PROMPT KREATIF OLFACTORY-DRIVEN ---
    const prompt = `Sebagai seorang Master Perfumer dan Kritikus Sastra yang sangat elegan dan puitis, Anda baru saja meracik parfum dengan komposisi berikut:
Top Notes: ${topStr}
Heart Notes: ${midStr}
Base Notes: ${baseStr}

Bedah parfum ini sebagai mahakarya seni dan emosi. Gunakan bahasa Indonesia yang sangat elegan, metaforis tinggi, namun tetap masuk akal dan realistis. Tulis dalam format HTML (hanya h2, h3, p, ul, li, strong, blockquote) tanpa \`\`\`html.

Struktur wajib:
<h2>[WAJIB 1 ATAU MAKSIMAL 2 KATA SAJA. Ciptakan nama parfum yang SANGAT ARTISTIK, ELEGAN, dan BERKELAS dari bahasa Prancis, Latin, Arab, atau Italia. Contoh: 'Ombre Nomade', 'Oud Maracuja', 'Fumée', 'Acqua Serena'. DILARANG KERAS menggunakan kata generik atau sekadar menggabungkan nama notes. Nama harus memancing rasa penasaran intelektual.]</h2>

<Paragraf pembuka dramatis (2-3 kalimat). Metafora puitis dan sangat spesifik, namun tetap grounded. Contoh: "Bara perapian yang perlahan padam di kabin bersalju Pegunungan Alpen". Jangan gunakan elemen sci-fi/sihir mustahil.>

<h3>1. Narasi Aroma</h3><p>(Perjalanan aroma layaknya naskah film pendek sinematik dan nyata.)</p>
<h3>2. Anatomi Aroma per Layer</h3><ul>(Bedah setiap layer, tekstur, dan suhu yang dirasakan saat menghirup.)</ul>
<h3>3. Vibe & Persona</h3><p>(Di ruang/sejarah/lokasi dunia nyata mana parfum ini eksis? Siapa sosok elegan atau ekstrem pemakainya?)</p>
<h3>4. Resonansi di Dunia Nyata</h3><p>(Sebutkan 3-4 parfum niche/desainer nyata yang se-frekuensi, dengan alasan singkat.)</p>
<h3>5. Evaluasi Sang Kritikus</h3><ul>(Kekuatan/Pros dan Kelemahan/Cons, termasuk volatilitas atau profil yang terlalu menantang.)</ul>
<h3>6. Verdict Penilaian Akhir</h3><p>...</p>
<h3>7. Prompt Visualisasi (Moodboard Persona & Konsep Botol Unik)</h3>
<blockquote>
A seamless 4-quadrant photographic moodboard collage in HIGH-END EDITORIAL REALISM aesthetic, strictly without any text, labels, borders, or white frames. In the exact center, overlapping all four background images, sits an ultra-luxurious, conceptually designed perfume bottle that emerges from the scent itself.

★ OLFACTORY-DRIVEN BOTTLE ARCHITECTURE (PALING PENTING):
Rancang botol dengan menerjemahkan karakter aroma secara langsung ke dalam bentuk, material, dan tekstur.
- Nada gelap, berasap, animalik → permukaan kasar, hangus, bertekstur, atau teroksidasi.
- Nada terang, akuatik, sitrus → bentuk transparan, kristalin, atau mengalir.
- Nada kayu, rempah, balsamik → material hangat, retak, berlapis resin.
JANGAN PERNAH menggunakan botol kaca bening generik.

★ CAKRAWALA REFERENSI (INSPIRASI, BUKAN KEWAJIBAN):
Anda boleh menimba inspirasi dari estetika berikut, tetapi Anda BEBAS MELAMPAUINYA dan menciptakan bahasa desain hibrida baru yang belum pernah ada:
- Artisanal Wabi-Sabi (Adi Ale Van): material mentah, cacat indah, pigmen bumi, logam berkarat, lilin, patung alam.
- Kemewahan Industrial Presisi (French Avenue): geometri tajam, lapisan matte, aksen logam berat, motif berani seperti ular atau peluru.
- Maximalis Teluk (Lattafa): kaca tebal berukir, kaligrafi emas, permata, tutup mahkota.
Gunakan hanya sebagai batu loncatan, lalu lepaskan – biarkan aroma yang memimpin desain final.

★ METODE DERIVASI ORGANIK (WAJIB):
1. SOUL OBJECT: Pilih SATU benda fisik nyata yang TERINSPIRASI LANGSUNG dari salah satu note atau perpaduannya. Benda tersebut harus berasal dari kategori: objek alam purba (fosil, resin, akar), alat kriya kuno (pisau Damaskus, timbangan apotek), fragmen arsitektur (pualam, engsel besi tempa), atau objek ritual (wadah peninggalan, rosario kayu purba).
   Tulis: "Parfum ini ADALAH sebuah [Soul Object] karena [alasan sensoris & emosional 2 kalimat]."
2. FUSI MATERIAL: Gabungkan filosofi material dari cakrawala referensi yang paling selaras dengan Soul Object. Rumuskan SATU kalimat deskripsi taktil yang literal tentang tekstur akhir botol (contoh: "Botol onyx hitam matte dengan inlay tembaga teroksidasi, tutupnya berupa serpihan fosil amber yang dipahat kasar.").
3. TUTUP BOTOL HARUS merupakan gema skulptural mini dari Soul Object, disesuaikan dengan hasil fusi. SEMBUNYIKAN atau samarkan nosel semprot dari tampak depan.

★ MOODBOARD & ENVIRONMENT (DINAMIS BERDASARKAN NADA):
Ciptakan latar yang sangat spesifik, realistis, dan mewah sesuai suhu dan psikologi notes (contoh: balkon Amalfi yang disinari mentari, jalanan bersalju Eropa, perpustakaan mahoni di kastil Skotlandia, pantai Bali yang hangat).
DISTRIBUSIKAN EMPAT KUADRAN TANPA BINGKAI:
- Kuadran 1: Still-life makro notes (top/heart) di atas permukaan yang relevan dengan latar.
- Kuadran 2: Lokasi atau objek gaya hidup mewah dari Dynamic Environment.
- Kuadran 3: Elemen manusia ATAU momen sinematik (VARIASIKAN terus – potret depan, kandid, dari belakang, close-up tangan/bibir, interaksi playful dengan lingkungan. Jangan selalu wajah menghadap kamera atau model generic berbusana kaku.)
- Kuadran 4: Foto makro ekstrem tekstur botol (tunjukkan pori, retakan, beludru, atau oksidasi logam secara taktil).

★ LARANGAN KLISE (CRITICAL):
- NO bangunan brutalist di tebing atau dekat laut.
- NO sci-fi, cyberpunk, neon, laboratorium futuristik.
- NO fisika mustahil, objek melayang, atau surealisme.
- NO botol kaca bening generik, NO CGI.
Pencahayaan sinematik alami (golden hour, overcast, cahaya lilin), shallow depth of field, color grading yang selaras dengan profil aroma.</blockquote>`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
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

    let html = candidateText.replace(/```html|```/gi, '');
    html = sanitizeHtml(html);

    // Ekstrak nama dari h2 (akan dipakai sebagai judul, lalu dihapus dari isi)
    const h2Match = html.match(/<h2>([\s\S]*?)<\/h2>/i);
    const suggestedName = h2Match ? h2Match[1].trim() : '';
    html = html.replace(/<h2>[\s\S]*?<\/h2>/i, '');

    // Ekstrak isi blockquote untuk prompt gambar
    const blockquoteMatch = html.match(/<blockquote>([\s\S]*?)<\/blockquote>/i);
    const promptText = blockquoteMatch ? blockquoteMatch[1].trim() : '';

    // Beri kelas Tailwind agar tampilan langsung cantik
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

    return NextResponse.json({
      name: suggestedName,
      html,
      promptText,
    });
  } catch (err: any) {
    console.error('Gemini API error:', err);
    return NextResponse.json(
      { error: err.message || 'Terjadi kesalahan saat menghubungi AI.' },
      { status: 500 }
    );
  }
}
