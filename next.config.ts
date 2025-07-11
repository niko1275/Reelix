import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Opcional: también ignora errores de TypeScript durante el build
    ignoreBuildErrors: true,
  },
  
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
      // Headers específicos para las rutas de upload de S3
      {
        source: "/api/upload/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
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
    // Agregar patrones remotos para mayor flexibilidad
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
      },
    ],
  },
  
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    },
    // Importante para AWS SDK en Vercel
    serverComponentsExternalPackages: ['aws-sdk', '@aws-sdk/client-s3'],
  },
  
  // Configuración webpack para AWS SDK
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalizar AWS SDK para evitar problemas de bundling
      config.externals = config.externals || [];
      config.externals.push('aws-sdk');
    }
    return config;
  },
  
  // Variables de entorno que necesitas exponer al cliente (si las necesitas)
  env: {
    AWS_REGION: process.env.AWS_REGION,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
  },
};

export default nextConfig;