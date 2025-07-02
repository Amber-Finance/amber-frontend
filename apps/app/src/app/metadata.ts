import { Metadata } from 'next'

// Shared constants to match landing page
const SHARED_CONFIG = {
  siteName: 'Amber',
  baseUrl: 'https://amberfi.io',
  appUrl: 'https://app.amberfi.io',
  twitterHandle: '@amberfi_io',
  bannerImage: 'https://amberfi.io/banner.png',
  locale: 'en_US',
}

// Shared image for social media
const SHARED_IMAGE = {
  url: SHARED_CONFIG.bannerImage,
  width: 1280,
  height: 720,
  alt: 'Amber Finance',
}

export const metaData: { [key: string]: Metadata } = {
  home: {
    title: 'Amber Finance',
    metadataBase: new URL(SHARED_CONFIG.appUrl),
    description: 'Liquid Staking. Solid Yield.',
    openGraph: {
      type: 'website',
      url: SHARED_CONFIG.appUrl,
      title: 'Amber Finance',
      locale: SHARED_CONFIG.locale,
      description: 'Liquid Staking. Solid Yield.',
      siteName: SHARED_CONFIG.siteName,
      images: [SHARED_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      site: SHARED_CONFIG.twitterHandle,
      title: 'Amber Finance',
      description: 'Liquid Staking. Solid Yield.',
      images: [SHARED_IMAGE],
    },
  },

  deposit: {
    title: 'Amber Finance - Yield',
    metadataBase: new URL(SHARED_CONFIG.appUrl),
    description: 'Liquid Staking. Solid Yield.',
    openGraph: {
      type: 'website',
      url: `${SHARED_CONFIG.appUrl}/deposit`,
      title: 'Amber Finance - Yield',
      locale: SHARED_CONFIG.locale,
      description: 'Liquid Staking. Solid Yield.',
      siteName: SHARED_CONFIG.siteName,
      images: [SHARED_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      site: SHARED_CONFIG.twitterHandle,
      title: 'Amber Finance - Yield',
      description: 'Liquid Staking. Solid Yield.',
      images: [SHARED_IMAGE],
    },
  },

  strategies: {
    title: 'Amber Finance - Strategies',
    metadataBase: new URL(SHARED_CONFIG.appUrl),
    description: 'Preserve Value. Generate Wealth.',
    openGraph: {
      type: 'website',
      url: `${SHARED_CONFIG.appUrl}/strategies`,
      title: 'Amber Finance - Strategies',
      locale: SHARED_CONFIG.locale,
      description: 'Preserve Value. Generate Wealth.',
      siteName: SHARED_CONFIG.siteName,
      images: [SHARED_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      site: SHARED_CONFIG.twitterHandle,
      title: 'Amber Finance - Strategies',
      description: 'Preserve Value. Generate Wealth.',
      images: [SHARED_IMAGE],
    },
  },

  swap: {
    title: 'Amber Finance - Swap',
    metadataBase: new URL(SHARED_CONFIG.appUrl),
    description:
      'Convert your LSTs into correlated assets. Optimize your yield and improve your exposure.',
    openGraph: {
      type: 'website',
      url: `${SHARED_CONFIG.appUrl}/swap`,
      title: 'Amber Finance - Swap',
      locale: SHARED_CONFIG.locale,
      description:
        'Convert your LSTs into correlated assets. Optimize your yield and improve your exposure.',
      siteName: SHARED_CONFIG.siteName,
      images: [SHARED_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      site: SHARED_CONFIG.twitterHandle,
      title: 'Amber Finance - Swap',
      description:
        'Convert your LSTs into correlated assets. Optimize your yield and improve your exposure.',
      images: [SHARED_IMAGE],
    },
  },
}
