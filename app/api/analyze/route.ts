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

    // Prompt lengkap: Menggabungkan desain botol master Anda dengan Anti-Cliché & Realistic Luxury Environment
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
    <blockquote>A seamless 4-quadrant photographic moodboard collage in HIGH-END EDITORIAL REALISM aesthetic (Vogue, Kinfolk, Acqua di Parma, or Tom Ford campaign style), strictly without any text, labels, borders, or white frames. In the exact center, overlapping all four background images, sits an ultra-luxurious, conceptually designed perfume bottle. The bottle's DESIGN must be organically derived from these notes: Top (${topStr}), Heart (${midStr}), Base (${baseStr}). Do NOT default to generic clear-glass-with-gold-cap. First select an AESTHETIC LINEAGE that matches the scent's spirit, then derive all other parameters consistently with that lineage:

★ AESTHETIC LINEAGE (pick ONE that matches the note character):
  - MAINSTREAM LUXURY — refined, polished, editorial-elegant notes (Initio, MFK, Tom Ford Private Blend, Penhaligon's, Le Labo, Amouage, Roja Parfums direction)
  - ARTISANAL / WABI-SABI — raw, folkloric, religious, ritual, deep oriental, animalic-smoky notes (Adi ale Van, Mendittorosa, Naomi Goodsir direction): hand-painted ceramic with mottled patina, raw clay urn, copper/bronze sculpted reliquary with tool marks, glass body wrapped in leather/twine/wood, imperfect handcrafted surface, wax-sealed
  - FUTURISTIC / MOLECULAR — clean, aromatic, synthetic, aquatic, ozonic, modern aldehydic notes (Escentric Molecules, Goest, Phlur, Akro direction): minimal medical-grade vial, capsule cylinder, monolithic frosted block, lab-grade clinical white, anodized aluminum tube, magnetic disc cap, no visible seams
  - BRUTALIST / ARCHITECTURAL — conceptual, dark-modern, unconventional, masculine experimental notes (Comme des Garçons Series, Beaufort London, Strangelove NYC, UNUM direction): concrete-textured surface, raw cast metal, asymmetric geometric volume, exposed industrial seam, oversized monolithic proportions
  - APOTHECARY / VINTAGE — boozy, gourmand, dark herbal, retro, medicinal notes (Slumberhouse, D.S. & Durga, Imaginary Authors, Bruno Acampora direction): amber pharmacy bottle with cork stopper, typewritten or stamped label, hand-tied string, wax-sealed cap, old laboratory aesthetic, hand-numbered
  - SURREALIST / CONCEPTUAL — narrative, theatrical, eccentric, story-driven notes (Etat Libre d'Orange, Histoires de Parfums, Stora Skuggan direction): bottle shaped like an unrelated object (book, fruit, anatomical form, sacred totem), trompe-l'œil illusion, illustration-on-glass, art-installation feel

★ BODY COLOR — must echo the dominant scent character within the chosen lineage. Examples: oxblood/burgundy (spicy oriental), cognac amber (tobacco/leather), midnight navy or seafoam (aquatic), charcoal smoked-glass (oud/incense), dusty rose or mauve (floral-powdery), champagne (citrus aldehydic), sage olive (green), cream ivory or opaque white (vanilla-gourmand), patinated copper/oxidized brass (wabi-sabi artisanal), raw concrete grey (brutalist), translucent neon (futuristic), or unexpected combinations if the notes warrant.

★ FINISH/MATERIAL — must follow the lineage. Mainstream luxury → glossy lacquer, faceted crystal, brushed metallic. Wabi-sabi → mottled patina, raw clay, oxidized metal with hammer marks, weathered wood. Futuristic → frosted glass, anodized aluminum, soft-touch silicone, ceramic medical. Brutalist → concrete texture, raw cast iron, exposed weld seams. Apothecary → amber pharmacy glass, cork, kraft paper. Surrealist → whatever the conceptual object demands.

★ SILHOUETTE — driven by lineage. Examples per lineage already implied above. Match scent gender energy: masculine sharp/heavy for smoky/leather/oud; soft rounded for floral/gourmand; clean modernist for aquatic/aromatic; ritualistic vertical for incense/sacred; asymmetric for avant-garde notes.

★ CAP — must be coherent with lineage. Luxury → gold dome, brushed brass, polished silver. Wabi-sabi → hand-formed clay cap, oxidized copper cap with rough finish, wood plug, leather-wrapped cork. Futuristic → magnetic disc, integrated monolithic cap, anodized tube cap. Brutalist → raw concrete cap, machined metal block. Apothecary → cork with wax seal, ground-glass stopper. Surrealist → cap as part of the object illusion. Metal temperature: warm (gold/brass/copper) for oriental/gourmand; cool (silver/gunmetal/chrome) for aquatic/green/aromatic; oxidized/patinated for wabi-sabi.

★ LABEL TREATMENT — also lineage-coherent. Luxury → engraved metal plate, embossed medallion, gold-foiled. Wabi-sabi → hand-painted symbol, stamped leather patch, wood-burned mark, no label (purist artifact). Futuristic → minimal typography directly on glass, etched code, holographic foil. Brutalist → industrial stenciled mark, raw embossed metal stamp. Apothecary → typewritten paper label aged/yellowed, hand-numbered, wax stamp. Surrealist → label as illustration or trompe-l'œil. ANY text on the label must be DECORATIVE and ILLEGIBLE — never spelled-out readable words (image generators corrupt text).

The final bottle must feel like a sculpted object born from THIS specific note combination — a viewer should sense both the scent family AND the aesthetic worldview from the bottle alone. 

★ BANNED CLICHÉS & STRICT RULES (CRITICAL FOR MOODBOARD BACKGROUNDS):
- NO brutalist concrete buildings on cliffs or near the ocean.
- NO sci-fi elements, cyberpunk cities, glowing neon streets, or futuristic laboratories.
- NO impossible physics, floating objects, or surrealism. Gravity and real-world physics must apply!
★ HYPER-SPECIFIC ENVIRONMENT DIRECTIVES (Pick ONE dynamically based on the notes for the background quadrants):
  - MEDITERRANEAN ESCAPE (Citrus, aquatic, fresh): Sun-drenched Amalfi balcony, a sleek luxury yacht deck, white linen blowing in the wind, azure waters, terracotta tiles, fresh citrus resting on sun-warmed marble, seaside vacation aesthetics.
  - OLD-WORLD ARISTOCRACY (Leather, tobacco, powdery): A mahogany library, dusty sunbeams, crystal whiskey decanters, worn Chesterfield leather sofas, vintage velvet, European streets covered in autumn leaves or heavy winter snow.
  - MODERNIST ZEN (Tea, green, bamboo, watery): Minimalist Japanese temple, a serene Zen garden with raked sand, smooth river stones, trickling water features, moss gardens, soft diffused morning light through shoji screens.
  - DESERT NOMAD (Oud, incense, warm spices): Sahara dunes at twilight, rich woven kilim rugs, warm glowing embers, oxidized copper tea sets, swirling incense smoke, deep shadows.
  - ROMANTIC DECADENCE (Rich florals, gourmand, dark woods): A lavish Parisian apartment, spilled red wine, crushed silk bedsheets, blooming dark roses, melting candlelight on a silver candelabra, ingredients resting beautifully on warm tropical sand.

COMPOSITION RULES — Pick ONE highly creative but realistic archetype below for the human/action element:
- THE CURATED STILL LIFE: Ingredients meticulously arranged like a high-end culinary or botanical photoshoot (e.g., spices scattered on dark slate, exotic fruits creatively arranged on pristine beach sand, flowers resting on aged wood or wet stones).
- THE CINEMATIC MOMENT: A realistic but dynamic fraction of a second (e.g., water splashing over fresh mint leaves, smoke billowing from a piece of burning agarwood).
- THE HUMAN ELEMENT (PERSONA): A human subject that perfectly embodies the perfume's mood. Randomly select the pose and vibe: It can be a striking front-facing portrait, a natural candid lifestyle moment (laughing, walking, reading), a mysterious "from behind" shoot looking at the scenery, a dramatic faceless crop (focusing on lips, neck, or hands with luxurious textures), or a playful/seductive interaction with the environment. VARY THIS CONSTANTLY! The styling, emotion (e.g., dramatic, playful, mysterious, stoic), and pose MUST organically match the scent's psychological profile and the chosen climate.
- THE BREATHTAKING LOCATION: A purely scenic shot of the chosen environment directive (e.g., the interior of the Japanese temple, the edge of the desert tent, the sunlit Italian terrace, a pristine Bali beach).

Distribute these four content types organically across the quadrants:
1. Editorial still-life macro of top/heart notes (${topStr}, ${midStr}) arranged beautifully on a relevant surface (e.g., sand, stone, marble, wood).
2. The breathtaking Location or Luxury Lifestyle object (from the chosen directive).
3. The Human Element (Persona) OR The Cinematic Moment.
4. Macro texture/material shot representing base notes (${baseStr}) — e.g., macro shot of rich leather grain, smoldering wood, or dark amber liquid.

Lighting must be highly cinematic, mimicking natural sunlight or atmospheric real-world lighting (golden hour, moody overcast, candle-lit, or stark studio flash). Color grading must perfectly match the scent's profile. Shallow depth of field on every quadrant. The four quadrants blend smoothly at their seams without visible borders.</blockquote>`;

    // Panggil Gemini API (Model stabil: gemini-2.5-flash)
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
