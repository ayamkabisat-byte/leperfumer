import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const MAX_FILE_BYTES = 12 * 1024 * 1024;
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

function cleanText(value: FormDataEntryValue | null, label: string, maxLength: number) {
  if (typeof value !== 'string') throw new Error(`${label} wajib diisi.`);
  const cleaned = value.trim().slice(0, maxLength);
  if (!cleaned) throw new Error(`${label} wajib diisi.`);
  return cleaned;
}

export async function POST(request: Request) {
  let uploadedPath = '';

  try {
    const expectedToken = process.env.GALLERY_UPLOAD_TOKEN?.trim();
    if (process.env.NODE_ENV === 'production' && !expectedToken) {
      return NextResponse.json(
        { error: 'Upload galeri dinonaktifkan sampai GALLERY_UPLOAD_TOKEN dikonfigurasi di server.' },
        { status: 503 },
      );
    }

    if (expectedToken) {
      const providedToken = request.headers.get('X-Gallery-Token')?.trim();
      if (!providedToken || providedToken !== expectedToken) {
        return NextResponse.json({ error: 'Token upload galeri tidak valid.' }, { status: 401 });
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Konfigurasi Supabase server belum lengkap.' }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'File gambar tidak ditemukan.' }, { status: 400 });
    }

    if (!MIME_TO_EXT[file.type]) {
      return NextResponse.json({ error: 'Format gambar harus JPG, PNG, WebP, atau AVIF.' }, { status: 415 });
    }
    if (file.size <= 0 || file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: 'Ukuran gambar maksimal 12 MB.' }, { status: 413 });
    }

    const name = cleanText(formData.get('name'), 'Nama parfum', 120);
    const topNotes = cleanText(formData.get('top_notes'), 'Top notes', 1200);
    const midNotes = cleanText(formData.get('mid_notes'), 'Heart notes', 1200);
    const baseNotes = cleanText(formData.get('base_notes'), 'Base notes', 1200);

    const extension = MIME_TO_EXT[file.type];
    uploadedPath = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { error: uploadError } = await supabaseAdmin.storage
      .from('perfume-images')
      .upload(uploadedPath, bytes, {
        contentType: file.type,
        cacheControl: '31536000',
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: `Gagal mengunggah gambar: ${uploadError.message}` }, { status: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage.from('perfume-images').getPublicUrl(uploadedPath);
    const { error: dbError } = await supabaseAdmin.from('perfumes').insert({
      name,
      top_notes: topNotes,
      mid_notes: midNotes,
      base_notes: baseNotes,
      image_url: urlData.publicUrl,
    });

    if (dbError) {
      await supabaseAdmin.storage.from('perfume-images').remove([uploadedPath]);
      return NextResponse.json({ error: `Gagal menyimpan data: ${dbError.message}` }, { status: 500 });
    }

    return NextResponse.json({ publicUrl: urlData.publicUrl });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Kesalahan server saat mengunggah gambar.';
    console.error('[GALLERY_UPLOAD]', { message, uploadedPath });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
