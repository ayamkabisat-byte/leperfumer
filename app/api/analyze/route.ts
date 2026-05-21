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

    // Prompt lengkap: Gabungan Lineage Akurat (Adi Ale Van/Lattafa) dengan Metode Soul Object & Environment Dinamis
    const prompt = `Sebagai seorang Master Perfumer dan Kritikus Sastra yang sangat elegan dan puitis, Anda baru saja meracik parfum dengan komposisi berikut:
    Top Notes: ${topStr}
    Heart Notes: ${midStr}
    Base Notes: ${baseStr}
    
    Tugas Anda adalah membedah parfum ini sebagai sebuah maha karya seni dan emosi. Gunakan bahasa Indonesia yang sangat elegan, berkelas, dan metaforis tingkat tinggi, NAMUN TETAP MASUK AKAL DAN REALISTIS. Tulis dalam format HTML (hanya h2, h3, p, ul, li, strong) tanpa \`\`\`html.
    
    Struktur wajib:
    <h2>[WAJIB 1 ATAU MAKSIMAL 2 KATA SAJA. Ciptakan nama parfum yang SANGAT ARTISTIK, ELEGAN, dan BERKELAS. Gunakan kosakata dari bahasa Prancis, Latin, Arab, atau Italia. Contoh: 'Ombre Nomade', 'Oud Maracuja', 'Fumée', 'Acqua Serena'. DILARANG KERAS menggunakan kata generik atau sekadar menggabungkan nama notes. Pikirkan nama yang memancing rasa penasaran intelektual!]</h2>
    
    <Paragraf pembuka dramatis (2-3 kalimat). Ciptakan metafora yang puitis dan sangat spesifik, NAMUN TETAP MASUK AKAL (Grounded Reality). Contoh: Jika wanginya woody/smoky, bayangkan "Bara perapian yang perlahan padam di sebuah kabin bersalju di Pegunungan Alpen". Jika wanginya floral/aquatic, bayangkan "Kelopak mawar putih yang basah oleh embun pagi di taman rahasia Florence". JANGAN pernah menyebut kopi V60 dan JANGAN gunakan elemen sci-fi/sihir yang mustahil.>
    
    <h3>1. Narasi Aroma</h3><p>(Ceritakan perjalanan aroma ini bagaikan sebuah naskah film pendek yang sangat sinematik dan nyata).</p>
    <h3>2. Anatomi Aroma per Layer</h3><ul>(Bedah setiap layer secara detail. Jelaskan tekstur dan suhu yang dirasakan otak saat menghirupnya).</ul>
    <h3>3. Vibe & Persona</h3><p>(Deskripsikan Vibe. Di ruang, sejarah, atau lokasi dunia nyata mana parfum ini eksis? Siapa sosok elegan atau ekstrem yang memakainya?).</p>
    <h3>4. Resonansi di Dunia Nyata</h3><p>(Sebutkan 3-4 parfum niche/desainer nyata yang se-frekuensi, sertakan alasannya).</p>
    <h3>5. Evaluasi Sang Kritikus</h3><ul>(Sebutkan Kekuatan/Pros, serta Kelemahan/Cons seperti volatilitas atau profil yang mungkin terlalu 'menantang' untuk hidung awam).</ul>
    <h3>6. Verdict Penilaian Akhir</h3><p>...</p>
    <h3>7. Prompt Visualisasi (Moodboard Persona)</h3>
    <blockquote>A seamless 4-quadrant photographic moodboard collage in HIGH-END EDITORIAL REALISM aesthetic (Vogue, Kinfolk, Acqua di Parma, or Tom Ford campaign style), strictly without any text, labels, borders, or white frames. In the exact center, overlapping all four background images, sits an ultra-luxurious, conceptually designed perfume bottle.

★ BOTTLE ARCHITECTURE & AESTHETIC LINEAGE (Select ONE lineage that perfectly aligns with the notes' character):
  - ROMANIAN ARTISANAL WABI-SABI (Adi Ale Van style): 100% handcrafted, intentionally imperfect. Each piece unique, impossible to reproduce. Bottle body painted with acrylic earth pigments — mottled, cracked, worn. Decorated with hammered oxidized metal (rusted iron, tarnished copper wire), raw leather cords, and thick wax seals stamped with Orthodox or folkloric symbols. THE CAP IS MANDATORY NATURE SCULPTURE: a real dried forest mushroom with visible mycelium texture, a gnarled driftwood plug, or a hand-forged iron Orthodox cross, heavily distressed. Comes in a hand-painted WOODEN BOX lined with aged leather. (Best for: smoky, earthy, dark leather, incense, dark tobacco notes).
  - GULF MAXIMALIST OPULENCE (Lattafa / Swiss Arabian style): Extremely heavy faceted glass — thick walls, jewel-cut geometry inspired by Islamic architecture and arabesque patterns. Colors: deep amber, midnight sapphire, emerald, or onyx matte. Body embossed with arabesques, geometric latticework, or Arabic calligraphy in raised gold or platinum. WEIGHT IS KEY. THE CAP: a bold sculptural statement — a coiled golden falcon, dual cresting stallion heads, a jeweled crescent moon, or a hexagonal crystal dome with embedded gem. Never a plain dome. (Best for: rich oud, saffron, heavy woods, sweet gourmands).
  - FRENCH-ARABIC HYBRID LUXE (French Avenue / Fragrance World style): Blends French minimalist silhouettes with Middle Eastern opulent details. Smooth, polished heavy glass in a clean architectural shape — octagonal, tapered, or faceted — paired with rich warm color gradients (cognac-amber to deep ruby, or dusty rose to gold). Gold-plated collar and base ring. THE CAP: a polished solid-metal geometric shape — pyramid, faceted cube, or a stylized flame/crescent motif in brushed gold. Finish is flawless and weighty. (Best for: floral-oriental, fruity-spicy, accessible luxury).
  - ELEVATED ALCHEMICAL (Slumberhouse / Aesop style): Heavy dark violet or cobalt thick glass, premium ground-glass stoppers wrapped in twine, thick textured cotton labels with wax seals, vintage brass or copper measuring elements. (Best for herbal, boozy, earthy, aromatic notes).

★ BOTTLE CONCEPT — ORGANIC DERIVATION METHOD (MANDATORY PROCESS):
STEP 1 — IDENTIFY THE "SOUL OBJECT":
Analyze the psychological and sensory profile of these notes: Top (${topStr}) · Heart (${midStr}) · Base (${baseStr}).
Identify ONE non-perfume physical object from the real world that this scent would BE if it were a tangible thing. 
This object must come from one of these categories:
  - A found natural object (e.g., a dried fungi cluster, a chunk of raw amber resin, a fossilized sea creature)
  - A hand-tool or instrument of craft (e.g., an old Damascus-steel knife, a worn leather-bound apothecary scale, a brass astrolabe)
  - An architectural fragment (e.g., a carved muqarnas tile, a single onyx column capital, a weathered iron door hinge)
  - A ritual or ceremonial object (e.g., a wax-sealed reliquary, an incense burner, a prayer bead made of fossilized wood)

Write ONE sentence: "This fragrance IS a [Soul Object] because [2-sentence sensory/emotional justification]."

STEP 2 — TRANSLATE TO BOTTLE ARCHITECTURE:
Design the bottle by FUSING your chosen "Soul Object" with the strict rules of your chosen "Aesthetic Lineage".
Rules:
- Body material must obey the Lineage but evoke the Soul Object's texture (e.g., if Romanian Wabi-Sabi + Damascus steel, the bottle has hammered rusted layers).
- The Cap MUST BE a miniature sculptural echo of the Soul Object, adapted to the lineage (e.g., a golden sculptural version for Gulf Opulence, or a raw iron forged version for Romanian Wabi-Sabi).
- One deliberate subversive element: NO standard spray nozzle visible from the front (hide it, recess it, or disguise it as part of the design).

★ BANNED CLICHÉS & STRICT RULES (CRITICAL FOR MOODBOARD BACKGROUNDS):
- NO brutalist concrete buildings on cliffs or near the ocean.
- NO sci-fi elements, cyberpunk cities, glowing neon streets, or futuristic laboratories.
- NO impossible physics, floating objects, or surrealism. Gravity and real-world physics must apply!
- NO blank-staring models in generic suits/dresses.
- Everything must look like a multi-million dollar real-world photography shoot, deeply rooted in high-end luxury, nature, or curated still life.

★ DYNAMIC ENVIRONMENT DIRECTIVE (Invent the setting based on the notes' mood!):
  Analyze the psychological profile, temperature, and mood of the notes, then INVENT a highly specific, realistic luxury location, geography, and season that perfectly embodies this scent. 
  IDEAS FOR INSPIRATION: A sun-drenched Amalfi balcony, a snowy European street in deep winter, a serene minimalist Japanese temple, a pristine Bali beach at golden hour, a lavish Parisian apartment with spilled wine, a dusty mahogany library in a Scottish castle, a luxury yacht deck in the Mediterranean, a vibrant Moroccan riad, or ingredients resting beautifully on warm tropical sand. Let the notes dictate the geography and climate!

COMPOSITION RULES — Pick ONE highly creative but realistic archetype below for the human/action element (VARY THIS CONSTANTLY, do not always hide faces):
- THE CURATED STILL LIFE: Ingredients meticulously arranged like a high-end culinary or botanical photoshoot (e.g., spices scattered on dark slate, exotic fruits creatively arranged on pristine beach sand, flowers resting on aged wood or wet stones).
- THE CINEMATIC MOMENT: A realistic but dynamic fraction of a second (e.g., water splashing over fresh mint leaves, smoke billowing from a piece of burning agarwood).
- THE HUMAN ELEMENT (PERSONA): A human subject that perfectly embodies the perfume's mood. Randomly select the pose and vibe: It can be a striking front-facing portrait, a natural candid lifestyle moment (laughing, walking, reading), a mysterious "from behind" shoot looking at the scenery, a dramatic faceless crop (focusing on lips, neck, or hands with luxurious textures), or a playful/seductive interaction with the environment. VARY THIS CONSTANTLY! The styling, emotion, and pose MUST organically match the scent's psychological profile and the chosen climate.
- THE BREATHTAKING LOCATION: A purely scenic shot of your invented dynamic environment.

Distribute these four content types organically across the quadrants:
1. Editorial still-life macro of top/heart notes arranged beautifully on a surface relevant to the environment.
2. The breathtaking Location or Luxury Lifestyle object (from your Dynamic Environment).
3. The Human Element (Persona) OR The Cinematic Moment.
4. Macro texture/material shot representing base notes.

Lighting must be highly cinematic, mimicking natural sunlight or atmospheric real-world lighting (golden hour, moody overcast, candle-lit, or stark studio flash). Color grading must perfectly match the scent's profile. Shallow depth of field on every quadrant. The four quadrants blend smoothly at their seams without visible borders.</blockquote>`;

    // Panggil Gemini API (Model stabil: gemini-3-flash-preview)
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

    // Bersihkan markdown code fences
    let html = candidateText.replace(/```html|```/gi, '');

    // Sanitasi untuk mencegah CSP violation
    html = sanitizeHtml(html);

    // Ekstrak nama AI dari tag <h2>
    const h2Match = html.match(/<h2>([\s\S]*?)<\/h2>/i);
    const suggestedName = h2Match ? h2Match[1].trim() : '';
    // Hapus h2 dari html agar tidak tercetak dua kali di dalam UI hasil analisis
    html = html.replace(/<h2>[\s\S]*?<\/h2>/i, '');

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

    // Return nama bersama dengan html dan prompt
    return NextResponse.json({ name: suggestedName, html, promptText });
  } catch (err: any) {
    console.error('Gemini API error:', err);
    return NextResponse.json(
      { error: err.message || 'Terjadi kesalahan saat menghubungi AI.' },
      { status: 500 }
    );
  }
}
