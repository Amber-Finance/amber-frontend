/// <reference path="./env.d.ts" />
/// <reference path="./vercel.d.ts" />

const APP_URL =
  process.env.APP_URL ||
  (process.env.VERCEL && `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`) ||
  `${process.env.PROTOCOL || 'http'}://${process.env.HOST || 'localhost'}:${process.env.PORT || 3000}`

/**
 * @type {import('next').NextConfig}
 * @see https://nextjs.org/docs/pages/api-reference/next-config-js
 */
let nextConfig = {
  reactStrictMode: true,
  env: {
    APP_URL,
  },
  productionBrowserSourceMaps: true,
  // Fix WebSocket HMR connection issues
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  rewrites: async () => [
    {
      source: '/.well-known/walletconnect.txt',
      destination: '/api/walletconnect/verify',
    },
    {
      source: '/api/rest/(.*)',
      destination: '/api/rest/handler',
    },
    {
      source: '/api/rpc/(.*)',
      destination: '/api/rpc/handler',
    },
    {
      source: '/api/skip/(.*)',
      destination: '/api/skip/handler',
    },
    {
      source: '/api/widget/skip/(.*)',
      destination: '/api/widget/skip/handler',
    },
  ],
  transpilePackages:
    process.env.NODE_ENV === 'test'
      ? [
          '@vercel/analytics',
          '@evmos/provider',
          '@evmos/transactions',
          '@evmos/eip712',
          '@evmos/proto',
          '@buf/cosmos_cosmos-sdk.bufbuild_es',
          '@buf/evmos_evmos.bufbuild_es',
          '@buf/cosmos_ibc.bufbuild_es',
          'wagmi',
          '@tanstack/query-sync-storage-persister',
          '@tanstack/react-query',
          '@tanstack/query-core',
          '@tanstack/react-query-persist-client',
          '@tanstack/query-persist-client-core',
          '@wagmi/core',
          '@wagmi/connectors',
          'viem',
          'abitype',
          'uuid',
        ]
      : [],
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

// Check environment variables on module load (runs once during dev server start)
if (process.env.NODE_ENV === 'development') {
  checkEnv()
}

module.exports = nextConfig

function checkEnv() {
  // Using console.warn instead of next/dist/build/output/log for simpler, direct logging
  if (!process.env.POLKACHU_USER || !process.env.POLKACHU_PASSWORD) {
    console.warn('⚠️  env POLKACHU_USER or POLKACHU_PASSWORD is not set, will use public nodes')
  }
}
