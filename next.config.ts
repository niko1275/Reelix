import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Referrer-Policy",
            value: "no-referrer-when-downgrade",
          },
        ],
      },
    ];
  },
  images: {
    domains: [
      "reelixbucket.s3.us-east-2.amazonaws.com",
      "image.mux.com",
      'images.pexels.com',
      "img.clerk.com"
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
};

export default nextConfig;
