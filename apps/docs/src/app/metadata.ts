import { Metadata } from 'next'

// Shared constants for docs
const SHARED_CONFIG = {
  siteName: 'Amber Docs',
  baseUrl: 'https://docs.amberfi.io',
  twitterHandle: '@amberfi_io',
  bannerImage: 'https://docs.amberfi.io/twitter-banner/default.jpg',
  locale: 'en_US',
}

// Shared image for social media
const SHARED_IMAGE = {
  url: SHARED_CONFIG.bannerImage,
  width: 1280,
  height: 720,
  alt: 'Amber Finance Documentation',
}

export const metaData: Metadata = {
  title: 'Amber Finance Documentation',
  metadataBase: new URL(SHARED_CONFIG.baseUrl),
  description: 'Comprehensive documentation for Amber Finance - Liquid Staking. Solid Yields.',
  openGraph: {
    type: 'website',
    url: SHARED_CONFIG.baseUrl,
    title: 'Amber Finance Documentation',
    locale: SHARED_CONFIG.locale,
    description: 'Comprehensive documentation for Amber Finance - Liquid Staking. Solid Yields.',
    siteName: SHARED_CONFIG.siteName,
    images: [SHARED_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    site: SHARED_CONFIG.twitterHandle,
    title: 'Amber Finance Documentation',
    description: 'Comprehensive documentation for Amber Finance - Liquid Staking. Solid Yields.',
    images: [SHARED_IMAGE],
  },
}
