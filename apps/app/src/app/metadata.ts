import { Metadata } from 'next'

// Shared constants to match landing page
const SHARED_CONFIG = {
  siteName: 'Amber Finance',
  baseUrl: 'https://app.amberfi.io',
  twitterHandle: '@amberfi_io',
  locale: 'en_US',
}

export const metaData: { [key: string]: Metadata } = {
  home: {
    title: 'Amber Finance',
    metadataBase: new URL(SHARED_CONFIG.baseUrl),
    description: 'Liquid Staking. Solid Yields.',
    openGraph: {
      type: 'website',
      url: SHARED_CONFIG.baseUrl,
      title: 'Amber Finance',
      locale: SHARED_CONFIG.locale,
      description: 'Liquid Staking. Solid Yields.',
      siteName: SHARED_CONFIG.siteName,
      images: [
        {
          url: 'https://app.amberfi.io/x-banner/deposit.jpg',
          width: 1032,
          height: 540,
          alt: 'Amber Finance',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: SHARED_CONFIG.twitterHandle,
      title: 'Amber Finance',
      creator: SHARED_CONFIG.twitterHandle,
      description: 'Liquid Staking. Solid Yields.',
      images: [
        {
          url: 'https://app.amberfi.io/x-banner/deposit.jpg',
          width: 1032,
          height: 540,
          alt: 'Amber Finance',
        },
      ],
    },
  },

  deposit: {
    title: 'Amber Finance | Yield',
    metadataBase: new URL(SHARED_CONFIG.baseUrl),
    description: 'Liquid Staking. Solid Yields.',
    openGraph: {
      type: 'website',
      url: `${SHARED_CONFIG.baseUrl}/deposit`,
      title: 'Amber Finance | Yield',
      locale: SHARED_CONFIG.locale,
      description: 'Liquid Staking. Solid Yields.',
      siteName: SHARED_CONFIG.siteName,
      images: [
        {
          url: 'https://app.amberfi.io/x-banner/deposit.jpg',
          width: 1032,
          height: 540,
          alt: 'Amber Finance',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: SHARED_CONFIG.twitterHandle,
      title: 'Amber Finance | Yield',
      creator: SHARED_CONFIG.twitterHandle,
      description: 'Liquid Staking. Solid Yields.',
      images: [
        {
          url: 'https://app.amberfi.io/x-banner/deposit.jpg',
          width: 1032,
          height: 540,
          alt: 'Amber Finance | Yield',
        },
      ],
    },
  },

  strategies: {
    title: 'Amber Finance | Strategies',
    metadataBase: new URL(SHARED_CONFIG.baseUrl),
    description: 'Preserve Value. Generate Wealth.',
    openGraph: {
      type: 'website',
      url: `${SHARED_CONFIG.baseUrl}/strategies`,
      title: 'Amber Finance | Strategies',
      locale: SHARED_CONFIG.locale,
      description: 'Preserve Value. Generate Wealth.',
      siteName: SHARED_CONFIG.siteName,
      images: [
        {
          url: 'https://app.amberfi.io/x-banner/strategies.jpg',
          width: 1032,
          height: 540,
          alt: 'Amber Finance | Strategies',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: SHARED_CONFIG.twitterHandle,
      title: 'Amber Finance | Strategies',
      creator: SHARED_CONFIG.twitterHandle,
      description: 'Preserve Value. Generate Wealth.',
      images: [
        {
          url: 'https://app.amberfi.io/x-banner/strategies.jpg',
          width: 1032,
          height: 540,
          alt: 'Amber Finance | Strategies',
        },
      ],
    },
  },

  swap: {
    title: 'Amber Finance | Swap',
    metadataBase: new URL(SHARED_CONFIG.baseUrl),
    description:
      'Convert your Bitcoin LSTs into correlated assets. Optimize your yield and improve your exposure.',
    openGraph: {
      type: 'website',
      url: `${SHARED_CONFIG.baseUrl}/swap`,
      title: 'Amber Finance | Swap',
      locale: SHARED_CONFIG.locale,
      description:
        'Convert your Bitcoin LSTs into correlated assets. Optimize your yield and improve your exposure.',
      siteName: SHARED_CONFIG.siteName,
      images: [
        {
          url: 'https://app.amberfi.io/x-banner/swap.jpg',
          width: 1032,
          height: 540,
          alt: 'Amber Finance | Swap',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: SHARED_CONFIG.twitterHandle,
      title: 'Amber Finance | Swap',
      creator: SHARED_CONFIG.twitterHandle,
      description:
        'Convert your Bitcoin LSTs into correlated assets. Optimize your yield and improve your exposure.',
      images: [
        {
          url: 'https://app.amberfi.io/x-banner/swap.jpg',
          width: 1032,
          height: 540,
          alt: 'Amber Finance | Swap',
        },
      ],
    },
  },
}
