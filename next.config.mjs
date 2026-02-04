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
  // Sur Next.js 14.0.x, on le place ici :
  bundlePagesRouterDependencies: true, 
  serverExternalPackages: [
    'canvas',
    'face-api.js',
    'sharp',
    '@react-pdf/renderer',
    'argon2'
  ],
};

export default nextConfig;
