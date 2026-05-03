import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error('Supabase URL atau Anon Key tidak ditemukan di environment.');
}

export const supabase = createClient(url, key);