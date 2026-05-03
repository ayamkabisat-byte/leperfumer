// app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const topNotes = formData.get('top_notes') as string;
    const midNotes = formData.get('mid_notes') as string;
    const baseNotes = formData.get('base_notes') as string;

    console.log('[UPLOAD] Received:', { name, hasFile: !!file });

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }

    // 1. Validasi environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Konfigurasi Supabase tidak lengkap di server.' },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    // 2. Konversi gambar ke WebP
    let webpBuffer: Buffer;
    try {
      const arrayBuffer = await file.arrayBuffer();
      webpBuffer = await sharp(Buffer.from(arrayBuffer))
        .webp({ quality: 80 })
        .toBuffer();
    } catch (err) {
      console.error('[UPLOAD] Sharp conversion error:', err);
      return NextResponse.json(
        { error: 'Gagal mengkonversi gambar ke WebP.' },
        { status: 500 }
      );
    }

    // 3. Sanitasi nama file (hanya izinkan a-z, A-Z, 0-9, underscore, hyphen)
    const originalName = file.name.replace(/\.[^/.]+$/, ''); // hilangkan ekstensi
    const sanitizedName = originalName
      .replace(/[^a-zA-Z0-9_-]/g, '_')   // ganti karakter asing dengan underscore
      .replace(/_+/g, '_')               // hindari underscore ganda
      .substring(0, 100);                // batasi panjang nama file

    const webpFileName = `${Date.now()}_${sanitizedName}.webp`;
    console.log('[UPLOAD] Uploading as:', webpFileName);

    // 4. Upload ke Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from('perfume-images')
      .upload(webpFileName, webpBuffer, {
        contentType: 'image/webp',
        upsert: false,
      });

    if (uploadError) {
      console.error('[UPLOAD] Storage error:', uploadError);
      return NextResponse.json(
        { error: `Gagal mengunggah gambar: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // 5. Dapatkan URL publik
    const { data: urlData } = supabaseAdmin.storage
      .from('perfume-images')
      .getPublicUrl(webpFileName);

    console.log('[UPLOAD] Public URL:', urlData.publicUrl);

    // 6. Simpan ke tabel perfumes
    const { error: dbError } = await supabaseAdmin
      .from('perfumes')
      .insert({
        name,
        top_notes: topNotes,
        mid_notes: midNotes,
        base_notes: baseNotes,
        image_url: urlData.publicUrl,
      });

    if (dbError) {
      console.error('[UPLOAD] DB insert error:', dbError);
      return NextResponse.json(
        { error: `Gagal menyimpan data ke database: ${dbError.message}` },
        { status: 500 }
      );
    }

    console.log('[UPLOAD] Success');
    return NextResponse.json({ publicUrl: urlData.publicUrl });
  } catch (err: any) {
    console.error('[UPLOAD] Unexpected error:', err);
    return NextResponse.json(
      { error: `Kesalahan server: ${err.message}` },
      { status: 500 }
    );
  }
}