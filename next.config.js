/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: [
    'eaae-2800-300-6a11-f0c0-fc13-ff7b-bd6f-767a.ngrok-free.app',
    '*.ngrok-free.app',
  ],
  images: {
    domains: ['image.mux.com'],
  },
}

module.exports = nextConfig
