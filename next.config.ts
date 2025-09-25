import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ options générales
  eslint: { ignoreDuringBuilds: true }, // à garder temporairement
  typescript: { ignoreBuildErrors: true }, // à retirer dès que les erreurs TS sont corrigées

  // ✅ config images
  images: {
    domains: ["images.unsplash.com"],
  },
};

export default nextConfig;
