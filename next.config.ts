import type { NextConfig } from 'next';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseHostname: string | null = null;

if (supabaseUrl) {
  try {
    supabaseHostname = new URL(supabaseUrl).hostname;
  } catch {
    console.warn('NEXT_PUBLIC_SUPABASE_URL is not a valid URL.');
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHostname
      ? [{ protocol: 'https', hostname: supabaseHostname, pathname: '/storage/v1/object/public/**' }]
      : [],
  },
};

export default nextConfig;
