import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URI: process.env.NEXT_PUBLIC_API_URI,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    NEXT_PUBLIC_FRONT_URI: process.env.NEXT_PUBLIC_FRONT_URI
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drive.google.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'panel.xn-----k38i1wv5tf8o8ticmln6dm1am9c.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.xn-----k38i1wv5tf8o8ticmln6dm1am9c.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

