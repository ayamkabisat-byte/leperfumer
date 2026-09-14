import { NextResponse } from 'next/server';
import type { PerfumeAnalysis } from '@/lib/aiTypes';

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const ALLOWED_MODELS = new Set(['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash']);

const responseSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    name: { type: 'string' },
    tagline: { type: 'string' },
    opening: { type: 'string' },
    narrative: { type: 'string' },
    layers: {
      type: 'object',
      additionalProperties: false,
      properties: {
        top: { type: 'string' },
        heart: { type: 'string' },
        base: { type: 'string' },
      },
      required: ['top', 'heart', 'base'],
    },
    persona: {
      type: 'object',
      additionalProperties: false,
      properties: {
        profile: { type: 'string' },
        setting: { type: 'string' },
        season: { type: 'string' },
      },
      required: ['profile', 'setting', 'season'],
    },
    references: {
      type: 'array',
      minItems: 3,
      maxItems: 4,
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          name: { type: 'string' },
          reason: { type: 'string' },
        },
        required: ['name', 'reason'],
      },
    },
    pros: { type: 'array', minItems: 2, maxItems: 4, items: { type: 'string' } },
    cons: { type: 'array', minItems: 1, maxItems: 4, items: { type: 'string' } },
    verdict: {
      type: 'object',
      additionalProperties: false,
      properties: {
        score: { type: 'number', minimum: 0, maximum: 10 },
        summary: { type: 'string' },
      },
      required: ['score', 'summary'],
    },
    soulObject: {
      type: 'object',
      additionalProperties: false,
      properties: {
        object: { type: 'string' },
        rationale: { type: 'string' },
      },
      required: ['object', 'rationale'],
    },
    bottleDesign: { type: 'string' },
    visualPrompt: { type: 'string' },
  },
  required: [
    'name', 'tagline', 'opening', 'narrative', 'layers', 'persona', 'references',
    'pros', 'cons', 'verdict', 'soulObject', 'bottleDesign', 'visualPrompt',
  ],
};

function validateNotes(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 10) {
    throw new Error(`${label} harus berisi 1–10 note.`);
  }

  return value.map((note) => {
    if (typeof note !== 'string') throw new Error(`${label} tidak valid.`);
    const cleaned = note.trim().slice(0, 80);
    if (!cleaned) throw new Error(`${label} tidak boleh kosong.`);
    return cleaned;
  });
}

function buildPrompt(top: string[], heart: string[], base: string[]) {
  return `Anda adalah master perfumer sekaligus kritikus parfum niche. Analisis formula berikut dengan bahasa Indonesia yang elegan, puitis, spesifik, tetapi tetap realistis dan berguna bagi perfumer.

TOP: ${top.join(', ')}
HEART: ${heart.join(', ')}
BASE: ${base.join(', ')}

Aturan utama:
- Nama parfum hanya 1–2 kata; boleh Prancis, Latin, Arab, atau Italia. Hindari nama generik dan jangan sekadar menggabungkan nama note.
- Narasi harus menggambarkan evolusi aroma, temperatur, tekstur, kontras, dan kemungkinan masalah komposisi.
- References harus berisi 3–4 parfum nyata yang relevan; jelaskan kemiripannya tanpa mengklaim formula identik.
- Pros/cons harus kritis, termasuk volatilitas, balance, repetisi accord, atau profil yang terlalu menantang bila relevan.
- Verdict score 0–10 dan tidak perlu selalu tinggi.
- Soul object harus benda fisik nyata yang terinspirasi aroma: objek alam purba, alat kriya, fragmen arsitektur, atau objek ritual.
- Bottle design harus menerjemahkan karakter aroma ke material, bentuk, tekstur, dan tutup botol. Hindari botol kaca bening generik.
- Visual prompt wajib dalam bahasa Inggris, siap ditempel ke image generator. Buat seamless 4-quadrant high-end editorial photographic moodboard tanpa teks/border/white frame, botol berada di pusat. Empat kuadran: macro top/heart notes, lokasi realistis, momen manusia sinematik, dan tekstur/base-note atau momen budaya. No sci-fi, cyberpunk, impossible physics, generic clear glass bottle, or obvious CGI.
- Jangan keluarkan HTML atau Markdown. Isi seluruh field JSON sesuai schema.`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const topNotes = validateNotes(body.topNotes, 'Top notes');
    const midNotes = validateNotes(body.midNotes, 'Heart notes');
    const baseNotes = validateNotes(body.baseNotes, 'Base notes');

    const customKey = request.headers.get('X-Gemini-Key')?.trim();
    const apiKey = customKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key belum tersedia. Tambahkan key di Setelan atau GEMINI_API_KEY di server.' },
        { status: 401 },
      );
    }

    const requestedModel = request.headers.get('X-Gemini-Model')?.trim();
    const model = requestedModel && ALLOWED_MODELS.has(requestedModel) ? requestedModel : DEFAULT_MODEL;
    if (!ALLOWED_MODELS.has(model)) {
      return NextResponse.json({ error: `Model ${model} tidak diizinkan.` }, { status: 400 });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: buildPrompt(topNotes, midNotes, baseNotes) }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseJsonSchema: responseSchema,
            temperature: 0.9,
          },
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const message = errorData?.error?.message || `Gemini API HTTP ${response.status}`;
      return NextResponse.json({ error: message }, { status: response.status >= 500 ? 502 : response.status });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.find((part: { text?: string }) => part.text)?.text;
    if (!text) throw new Error('Respons Gemini kosong atau tidak memiliki output teks.');

    const analysis = JSON.parse(text) as PerfumeAnalysis;
    return NextResponse.json({ analysis, model });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat menganalisis parfum.';
    console.error('[AI_ANALYZE]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
