import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URI: process.env.NEXT_PUBLIC_API_URI,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    NEXT_PUBLIC_FRONT_URI: process.env.NEXT_PUBLIC_FRONT_URI
  },
};

export default nextConfig;

