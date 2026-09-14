import { NextResponse } from 'next/server';
import type { AnalysisStructureMode, PerfumeAnalysis } from '@/lib/aiTypes';

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const ALLOWED_MODELS = new Set(['gemini-3.8-flash', 'gemini-3.7-flash', 'gemini-3.6-flash']);

const responseSchema = {
  type: 'object', additionalProperties: false,
  properties: {
    name: { type: 'string' }, tagline: { type: 'string' }, opening: { type: 'string' }, narrative: { type: 'string' },
    structureMode: { type: 'string', enum: ['pyramid', 'list'] },
    structureSummary: { type: 'string' },
    layers: {
      type: 'object', additionalProperties: false,
      properties: { top: { type: 'string' }, heart: { type: 'string' }, base: { type: 'string' } },
      required: ['top', 'heart', 'base'],
    },
    persona: {
      type: 'object', additionalProperties: false,
      properties: { profile: { type: 'string' }, setting: { type: 'string' }, season: { type: 'string' } },
      required: ['profile', 'setting', 'season'],
    },
    references: {
      type: 'array', minItems: 3, maxItems: 4,
      items: { type: 'object', additionalProperties: false, properties: { name: { type: 'string' }, reason: { type: 'string' } }, required: ['name', 'reason'] },
    },
    pros: { type: 'array', minItems: 2, maxItems: 4, items: { type: 'string' } },
    cons: { type: 'array', minItems: 1, maxItems: 4, items: { type: 'string' } },
    verdict: { type: 'object', additionalProperties: false, properties: { score: { type: 'number', minimum: 0, maximum: 10 }, summary: { type: 'string' } }, required: ['score', 'summary'] },
    soulObject: { type: 'object', additionalProperties: false, properties: { object: { type: 'string' }, rationale: { type: 'string' } }, required: ['object', 'rationale'] },
    bottleDesign: { type: 'string' }, visualPrompt: { type: 'string' },
  },
  required: ['name','tagline','opening','narrative','structureMode','structureSummary','layers','persona','references','pros','cons','verdict','soulObject','bottleDesign','visualPrompt'],
};

function validateNotes(value: unknown, label: string, min = 1, max = 16): string[] {
  if (!Array.isArray(value) || value.length < min || value.length > max) throw new Error(`${label} harus berisi ${min}–${max} note.`);
  return value.map((note) => {
    if (typeof note !== 'string') throw new Error(`${label} tidak valid.`);
    const cleaned = note.trim().slice(0, 80);
    if (!cleaned) throw new Error(`${label} tidak boleh kosong.`);
    return cleaned;
  });
}

function buildPrompt(mode: AnalysisStructureMode, groups: { top?: string[]; heart?: string[]; base?: string[]; notes?: string[] }) {
  const composition = mode === 'list'
    ? `STRUCTURE: UNLAYERED NOTES LIST\nNOTES: ${groups.notes?.join(', ')}`
    : `STRUCTURE: OLFACTORY PYRAMID\nTOP: ${groups.top?.join(', ')}\nHEART: ${groups.heart?.join(', ')}\nBASE: ${groups.base?.join(', ')}`;

  return `Anda adalah master perfumer sekaligus kritikus parfum niche. Analisis formula berikut dengan bahasa Indonesia yang elegan, puitis, spesifik, tetapi tetap realistis dan berguna bagi perfumer.\n\n${composition}\n\nAturan utama:\n- Nama parfum hanya 1–2 kata; boleh Prancis, Latin, Arab, atau Italia. Hindari nama generik dan jangan sekadar menggabungkan nama note.\n- structureMode harus sama dengan input: ${mode}.\n- Jika mode=list, JANGAN mengarang bahwa user menetapkan top/heart/base. Jelaskan development yang mungkin berdasarkan volatilitas sebagai observasi, bukan pyramid resmi. Isi layers.top/heart/base dengan observasi potensial yang secara eksplisit menyatakan bahwa posisi tidak ditetapkan. Notes list tidak otomatis berarti parfum linear.\n- Jika mode=pyramid, hormati posisi yang diberikan user tetapi boleh mengkritik jika sebuah material tidak lazim di posisi tersebut.\n- Narasi harus menggambarkan evolusi aroma, temperatur, tekstur, kontras, dan kemungkinan masalah komposisi.\n- References berisi 3–4 parfum nyata yang relevan; jelaskan kemiripannya tanpa mengklaim formula identik.\n- Pros/cons harus kritis, termasuk volatilitas, balance, repetisi accord, atau profil yang terlalu menantang bila relevan.\n- Verdict score 0–10 dan tidak perlu selalu tinggi.\n- Soul object harus benda fisik nyata yang terinspirasi aroma.\n- Bottle design menerjemahkan karakter aroma ke material, bentuk, tekstur dan tutup botol.\n- Visual prompt wajib dalam bahasa Inggris: seamless 4-quadrant high-end editorial photographic moodboard tanpa teks/border/white frame, botol di pusat. No sci-fi, cyberpunk, impossible physics, generic clear glass bottle, or obvious CGI.\n- Jangan keluarkan HTML atau Markdown. Isi seluruh field JSON sesuai schema.`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const mode: AnalysisStructureMode = body.mode === 'list' ? 'list' : 'pyramid';
    let prompt: string;
    if (mode === 'list') {
      const notes = validateNotes(body.notes, 'Notes', 2, 16);
      prompt = buildPrompt(mode, { notes });
    } else {
      const top = validateNotes(body.topNotes, 'Top notes', 1, 10);
      const heart = validateNotes(body.midNotes, 'Heart notes', 1, 10);
      const base = validateNotes(body.baseNotes, 'Base notes', 1, 10);
      prompt = buildPrompt(mode, { top, heart, base });
    }

    const customKey = request.headers.get('X-Gemini-Key')?.trim();
    const apiKey = customKey || process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'Gemini API key belum tersedia. Tambahkan key di Setelan atau GEMINI_API_KEY di server.' }, { status: 401 });

    const requestedModel = request.headers.get('X-Gemini-Model')?.trim();
    const model = requestedModel && ALLOWED_MODELS.has(requestedModel) ? requestedModel : DEFAULT_MODEL;
    if (!ALLOWED_MODELS.has(model)) return NextResponse.json({ error: `Model ${model} tidak diizinkan.` }, { status: 400 });

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', responseJsonSchema: responseSchema, temperature: 0.9 } }),
    });

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
