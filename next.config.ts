import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NPSU: process.env.NPSU,
    KEPUB: process.env.KEPUB,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" }
    ]
  },
};

export default nextConfig;
