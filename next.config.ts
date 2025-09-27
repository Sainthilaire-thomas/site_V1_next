import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ options générales
  eslint: { ignoreDuringBuilds: true }, // à garder temporairement
  typescript: { ignoreBuildErrors: true }, // à retirer dès que les erreurs TS sont corrigées

  // ✅ config images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig;
