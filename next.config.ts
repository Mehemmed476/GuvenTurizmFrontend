import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // Docker/VPS ortamında en güvenlisi budur
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.guventurizm.az",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // SSL Hatalarını yok say (Development ve Build sırasında)
  webpack: (config, { isServer }) => {
    if (isServer) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    }
    return config;
  },
};

export default nextConfig;