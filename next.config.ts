import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["images.unsplash.com"],
    // ou si vous voulez autoriser tous les domaines (moins sécurisé) :
    // unoptimized: true,
  },
};

export default nextConfig;
