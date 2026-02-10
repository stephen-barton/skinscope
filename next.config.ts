import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "steamcommunity-a.akamaihd.net" },
      { protocol: "https", hostname: "steamcdn-a.akamaihd.net" },
      { protocol: "https", hostname: "community.cloudflare.steamstatic.com" },
      { protocol: "https", hostname: "community.fastly.steamstatic.com" },
      { protocol: "https", hostname: "cdn.csfloat.com" },
      { protocol: "https", hostname: "cdn.skinport.com" },
    ],
  },
};

export default nextConfig;
