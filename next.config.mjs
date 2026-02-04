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
  // 💡 AJOUTEZ CECI : 
  // Cela force Next.js à traiter ces modules comme externes au lieu de 
  // tenter de tracer chaque fichier interne, ce qui cause le crash.
  experimental: {
    serverExternalPackages: [
      'canvas', 
      'face-api.js', 
      'sharp', 
      '@react-pdf/renderer',
      'argon2'
    ],
  },
}

module.exports = nextConfig;
