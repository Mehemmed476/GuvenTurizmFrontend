import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // VACİB: Localhost-dan gələn şəkillər üçün optimizasiyanı söndürürük.
    // Bu, "private ip" xətasını aradan qaldırır.
    unoptimized: true,
    
    remotePatterns: [
      {
        protocol: "https",
        hostname: "localhost",
        port: "7139",
        pathname: "/api/files/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5072",
        pathname: "/api/files/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
    ],
  },
};

// Local Development zamanı SSL sertifikat xətasını ləğv edirik
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

export default nextConfig;