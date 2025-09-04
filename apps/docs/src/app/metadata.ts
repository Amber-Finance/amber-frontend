import { Metadata } from 'next'

// Shared constants for docs
const SHARED_CONFIG = {
  siteName: 'Amber Docs',
  baseUrl: 'https://docs.amberfi.io',
  twitterHandle: '@amberfi_io',
  bannerImage: 'https://docs.amberfi.io/x-banner/docs.jpg',
  locale: 'en_US',
}

// Shared image for social media
const SHARED_IMAGE = {
  url: SHARED_CONFIG.bannerImage,
  width: 1032,
  height: 540,
  alt: 'Amber Finance Documentation',
}

export const metadata: Metadata = {
  title: {
    default: 'Amber Finance | Documentation',
    template: 'Amber Finance | %s',
  },
  metadataBase: new URL(SHARED_CONFIG.baseUrl),
  description: 'Comprehensive documentation for Amber Finance - Liquid Staking. Solid Yields.',
  openGraph: {
    type: 'website',
    title: 'Amber Finance | Documentation',
    locale: SHARED_CONFIG.locale,
    description: 'Comprehensive documentation for Amber Finance - Liquid Staking. Solid Yields.',
    siteName: SHARED_CONFIG.siteName,
    images: [SHARED_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    site: SHARED_CONFIG.twitterHandle,
    title: 'Amber Finance | Documentation',
    creator: SHARED_CONFIG.twitterHandle,
    description: 'Comprehensive documentation for Amber Finance - Liquid Staking. Solid Yields.',
    images: [SHARED_IMAGE],
  },
}
