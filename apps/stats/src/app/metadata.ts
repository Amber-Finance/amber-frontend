import { type Metadata } from 'next'

// Stats-specific configuration
const STATS_CONFIG = {
  siteName: 'Amber Finance | Statistics',
  baseUrl: 'https://stats.amberfi.io',
  twitterHandle: '@amberfi_io',
  bannerImage: 'https://stats.amberfi.io/x-banner/stats.jpg',
  locale: 'en_US',
}

const STATS_IMAGE = {
  url: STATS_CONFIG.bannerImage,
  width: 1032,
  height: 540,
  alt: 'Amber Finance | Statistics Dashboard',
}

export const metadata: Metadata = {
  title: 'Amber Finance | Statistics',
  metadataBase: new URL(STATS_CONFIG.baseUrl),
  description:
    'Track Amber Finance protocol statistics, TVL, APY, and market performance. Real-time analytics and insights.',
  keywords: [
    'statistics',
    'analytics',
    'TVL',
    'APY',
    'DeFi',
    'Amber Finance',
    'cryptocurrency',
    'blockchain',
    'dashboard',
  ],
  authors: [{ name: 'Amber Finance' }],
  creator: 'Amber Finance',
  publisher: 'Amber Finance',
  openGraph: {
    type: 'website',
    url: STATS_CONFIG.baseUrl,
    title: 'Amber Finance | Statistics',
    locale: STATS_CONFIG.locale,
    description:
      'Track Amber Finance protocol statistics, TVL, APY, and market performance. Real-time analytics and insights.',
    siteName: STATS_CONFIG.siteName,
    images: [STATS_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    site: STATS_CONFIG.twitterHandle,
    creator: STATS_CONFIG.twitterHandle,
    title: 'Amber Finance | Statistics',
    description:
      'Track Amber Finance protocol statistics, TVL, APY, and market performance. Real-time analytics and insights.',
    images: [STATS_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}
