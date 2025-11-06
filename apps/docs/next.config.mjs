import nextra from 'nextra'

const withNextra = nextra({
  defaultShowCopyCode: true,
})

export default withNextra({
  reactStrictMode: true,
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  // Note: Using Next.js 15.x instead of 16.x for better Nextra compatibility
  // Nextra 4.x supports Turbopack for dev (with --turbopack flag) but has issues
  // with Next.js 16's Turbopack builds. See: https://nextra.site/docs/guide/turbopack
})
