import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ... pengaturan lain yang sudah ada (biarkan tetap)

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rbxtouqsxnjtncdrhjtc.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;