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
  // Turbopack (default in Next.js 16) handles browser polyfills automatically
  // Modern browsers support Web Crypto API natively - no crypto-browserify needed

  // Externalize server-only packages to prevent bundling issues
  serverExternalPackages: ['pino', 'thread-stream'],

  // Turbopack configuration
  turbopack: {
    resolveAlias: {
      // Stub out server-only packages for client-side
      pino: './src/lib/noop.ts',
      'thread-stream': './src/lib/noop.ts',
    },
  },
}

export default nextConfig
