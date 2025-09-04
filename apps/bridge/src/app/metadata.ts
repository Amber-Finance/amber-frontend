import { type Metadata } from 'next'

// Bridge-specific configuration
const BRIDGE_CONFIG = {
  siteName: 'Amber Finance | Bridge',
  baseUrl: 'https://bridge.amberfi.io',
  twitterHandle: '@amberfi_io',
  bannerImage: 'https://bridge.amberfi.io/x-banner/bridge.jpg',
  locale: 'en_US',
}

// Bridge-specific social media image
const BRIDGE_IMAGE = {
  url: BRIDGE_CONFIG.bannerImage,
  width: 1032,
  height: 540,
  alt: 'Amber Finance | Bridge',
}

export const metadata: Metadata = {
  title: 'Amber Finance | Bridge',
  metadataBase: new URL(BRIDGE_CONFIG.baseUrl),
  description:
    'Bridge BRTs across chains with Amber Finance. Seamless cross-chain transfers powered by Skip:go.',
  keywords: ['bridge', 'cross-chain', 'DeFi', 'Amber Finance', 'cryptocurrency', 'blockchain'],
  authors: [{ name: 'Amber Finance' }],
  creator: 'Amber Finance',
  publisher: 'Amber Finance',
  openGraph: {
    type: 'website',
    url: BRIDGE_CONFIG.baseUrl,
    title: 'Amber Finance | Bridge',
    locale: BRIDGE_CONFIG.locale,
    description:
      'Bridge assets across chains with Amber Finance. Seamless cross-chain transfers powered by Skip:go.',
    siteName: BRIDGE_CONFIG.siteName,
    images: [BRIDGE_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    site: BRIDGE_CONFIG.twitterHandle,
    creator: BRIDGE_CONFIG.twitterHandle,
    title: 'Amber Finance | Bridge',
    description:
      'Bridge assets across chains with Amber Finance. Seamless cross-chain transfers powered by Skip:go.',
    images: [BRIDGE_IMAGE],
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
