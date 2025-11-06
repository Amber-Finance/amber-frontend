import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'app.amberfi.io',
        pathname: '/**',
      },
    ],
  },
  // Fix WebSocket HMR connection issues
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Turbopack (default in Next.js 15+) handles browser polyfills automatically
  // Modern browsers support Web Crypto API natively - no crypto-browserify needed
}

export default nextConfig
