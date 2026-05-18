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

    // Prompt lengkap (Diperkaya dengan instruksi nama yang lebih ketat & referensi moodboard baru)
    const prompt = `Sebagai seorang Kritikus Master Perfumer yang eksentrik, sangat analitis, dan puitis, saya baru saja meracik parfum acak dengan komposisi berikut:
    Top Notes: ${topStr}
    Heart Notes: ${midStr}
    Base Notes: ${baseStr}
    
    Berikan ulasan mendalam bergaya arsitektural dan puitis. Gunakan bahasa Indonesia elegan. Tulis dalam format HTML (hanya h2, h3, p, ul, li, strong) tanpa \`\`\`html.
    Struktur wajib:
    <h2>[WAJIB 1 ATAU MAKSIMAL 2 KATA SAJA. Ciptakan nama parfum yang artistik, mewah, dan puitis. Gunakan kosakata elegan dari bahasa Prancis, Latin, Arab, Italia, atau Inggris (contoh: Ombre Nomade, Oud Maracuja, Bois D'Argent). DILARANG KERAS hanya sekadar menggabungkan nama-nama notes. Berpikirlah sangat kreatif untuk menangkap esensi, jiwa, dan vibe dari racikan tersebut ke dalam 1-2 kata yang ikonik!]</h2>
    <Paragraf pembuka dramatis dan puitis (2-3 kalimat). Gunakan analogi yang LAHIR DARI KARAKTER note dominan parfum ini — bukan template tetap. Ranah analogi yang bisa dipilih: kuliner (selain kopi V60), musik, sinematografi, arsitektur, sastra, alam, tekstil, ritual budaya, atau benda sehari-hari yang spesifik. Contoh logika pemilihan: note resin/incense → liturgi atau katedral tua; note aquatic → ombak pertama saat fajar; note gourmand → pastry hangat dari oven Wina atau kunafa yang baru pecah; note leather → sarung tangan kulit di lemari kakek; note green/herbal → pisau membelah daun mint segar; note oud/smoky → bara terakhir di tungku monastik; note citrus → siang yang memantul di marmer piazza Italia. JANGAN pernah memulai dengan analogi kopi V60. Variasikan setiap kali — jika notes-nya kompleks, gabungkan dua ranah analogi yang tak terduga.>
    <h3>1. Narasi Aroma</h3><p>...</p>
    <h3>2. Deskripsi Aroma per Layer</h3><ul>...</ul>
    <h3>3. Keseluruhan Vibe Parfum</h3><p>...</p>
    <h3>4. Parfum dengan Vibe Serupa</h3><p>...</p>
    <h3>5. Evaluasi Sang Kritikus Parfum</h3><ul>...</ul>
    <h3>6. Verdict Penilaian Akhir</h3><p>...</p>
    <h3>7. Prompt Visualisasi (Moodboard Persona)</h3>
    <blockquote>A seamless 4-quadrant photographic moodboard collage in editorial niche-perfume aesthetic (Mykonos, Initio, Roja Parfums style), strictly without any text, labels, borders, or white frames. In the exact center, overlapping all four background images, sits an ultra-luxurious perfume bottle, The bottle's DESIGN must be derived organically from these notes: Top (${topStr}), Heart (${midStr}), Base (${baseStr}). Do NOT default to generic clear-glass-with-gold-cap. First select an AESTHETIC LINEAGE that matches the scent's spirit, then derive all other parameters consistently with that lineage:

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

The final bottle must feel like a sculpted object born from THIS specific note combination — a viewer should sense both the scent family AND the aesthetic worldview from the bottle alone. A radical avant-garde scent should NOT come in a Tom Ford box; a folkloric Romanian-Orthodox scent should NOT come in a Le Labo cylinder.

COMPOSITION RULES — Randomly pick ONE persona/lifestyle archetype below to ensure maximum variety (DO NOT just use back-views!):
- EDITORIAL FRONT-FACING PORTRAIT: Subject looking directly at the camera or slightly off-angle, high-fashion editorial lighting (Vogue style), conveying the exact mood of the perfume (e.g., seductive, stoic, fresh, mysterious).
- DRAMATIC HALF-BODY & DETAILS: Focus on the torso, hands, clothing textures (silk, leather, linen), or extreme close-up of a jawline/lips/neck with dramatic chiaroscuro lighting.
- MYSTERIOUS SILHOUETTE / BACK-VIEW: Subject looking out toward a vast landscape, ocean, or city skyline, or a completely backlit profile.
- LUXURY LIFESTYLE / VEHICLES (NO-HUMAN): Replace the persona entirely with a high-end object or vehicle that matches the vibe perfectly. Examples: a sleek luxury yacht deck or speedboat (for aquatic/marine); a classic vintage sports car interior or leather seats (for leather/smoky); a private jet cabin, a grand piano, crystal chandelier, or minimalist architectural villa (for opulent/modern scents).
- ATMOSPHERIC ENVIRONMENT (NO-HUMAN): A purely scenic shot organically born from the notes. BE HIGHLY CREATIVE! Examples: sailing on the Mediterranean sea, a sunlit Amalfi coast balcony, or fresh fruits/ingredients resting beautifully on warm tropical sand (citrus/aquatic/fruity); a serene Japanese temple or Zen garden (tea/bamboo/woods); a pristine Bali beach (tropical); a moody European street during autumn leaves or heavy winter snow (spicy/leather/warm); a patisserie counter (gourmand); an Orthodox cathedral or Moroccan riad (incense/oriental). Let the specific notes dictate the geography and season!

Distribute these four content types organically across the quadrants (do NOT fix positions):
1. Ingredient macro from top/heart notes (${topStr}, ${midStr}) — fruit halved with water droplets, spices on aged wood, dried botanicals on linen, citrus flesh glistening, raw petals, or ingredients creatively arranged on sand/stone.
2. Atmospheric environment or Luxury Lifestyle object that organically reflects the scent's character (as chosen above).
3. Persona quadrant (Editorial portrait, body details, or silhouette) — OR an additional architectural/lifestyle substitute if a completely NO-HUMAN variant is chosen.
4. Base-note material macro (${baseStr}) — oud bark, dark leather grain, cigar bundle, raw resin pearls, cracked vetiver root, smoldering wood

Lighting is consistently cinematic, low-key, seductive, and color-graded to the scent profile (amber-warm for orientals; cool-violet for fresh; deep-burgundy for opulent; mint-silver for aquatic). Shallow depth of field on every quadrant. The four quadrants blend smoothly at their seams without visible borders.</blockquote>`;

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
