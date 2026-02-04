/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    // Cette partie est cruciale pour éviter le "Maximum call stack size exceeded"
    serverExternalPackages: [
      'canvas', 
      'face-api.js', 
      'sharp', 
      '@react-pdf/renderer',
      'argon2'
    ],
  },
};

export default nextConfig;
