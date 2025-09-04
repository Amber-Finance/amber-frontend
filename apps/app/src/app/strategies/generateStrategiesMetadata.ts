import { Metadata } from 'next'

import tokens from '@/config/tokens'

// Token to share image mapping for strategies
const TOKEN_SHARE_IMAGES = {
  LBTC: 'https://app.amberfi.io/api/banner/strategies/LBTC',
  solvBTC: 'https://app.amberfi.io/api/banner/strategies/solvBTC',
  eBTC: 'https://app.amberfi.io/api/banner/strategies/eBTC',
  WBTC: 'https://app.amberfi.io/api/banner/strategies/WBTC',
  uniBTC: 'https://app.amberfi.io/api/banner/strategies/uniBTC',
} as const

export async function generateStrategiesMetadata(tokenSymbol: string | null): Promise<Metadata> {
  if (!tokenSymbol) {
    return {
      title: 'Amber Finance | Strategies',
      description: 'Amplify your BRTs yields with leverage strategies.',
      openGraph: {
        title: 'Amber Finance | Strategies',
        description: 'Amplify your BRTs yields with leverage strategies.',
        images: [
          {
            url: 'https://docs.amberfi.io/x-banner/strategies.jpg',
            width: 1032,
            height: 540,
            alt: 'Amber Finance | Strategies',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Amber Finance | Strategies',
        description: 'Amplify your BRTs yields with leverage strategies.',
        images: [
          {
            url: 'https://docs.amberfi.io/x-banner/strategies.jpg',
            width: 1032,
            height: 540,
            alt: 'Amber Finance | Strategies',
          },
        ],
        site: '@amberfi_io',
        creator: '@amberfi_io',
      },
    }
  }

  const token = tokens.find((t) => t.symbol.toLowerCase() === tokenSymbol.toLowerCase())
  const normalizedTokenSymbol = Object.keys(TOKEN_SHARE_IMAGES).find(
    (key) => key.toLowerCase() === tokenSymbol.toLowerCase(),
  ) as keyof typeof TOKEN_SHARE_IMAGES
  const shareImage = normalizedTokenSymbol ? TOKEN_SHARE_IMAGES[normalizedTokenSymbol] : undefined

  // If token not found or no share image exists, return default strategies metadata
  if (!token || !shareImage) {
    return {
      title: 'Amber Finance | Strategies',
      description: 'Amplify your BRTs yields with leverage strategies.',
      openGraph: {
        title: 'Amber Finance | Strategies',
        description: 'Amplify your BRTs yields with leverage strategies.',
        images: [
          {
            url: 'https://docs.amberfi.io/x-banner/strategies.jpg',
            width: 1032,
            height: 540,
            alt: 'Amber Finance | Strategies',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Amber Finance | Strategies',
        description: 'Amplify your BRTs yields with leverage strategies.',
        images: [
          {
            url: 'https://docs.amberfi.io/x-banner/strategies.jpg',
            width: 1032,
            height: 540,
            alt: 'Amber Finance | Strategies',
          },
        ],
        site: '@amberfi_io',
        creator: '@amberfi_io',
      },
    }
  }

  const title = `Amber Finance | ${tokenSymbol} Leverage Strategies`
  const description = `Amplify your ${tokenSymbol} yield with leverage strategies.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://app.amberfi.io/strategies/deploy?strategy=WBTC-${tokenSymbol}`,
      siteName: 'Amber Finance',
      images: [
        {
          url: shareImage,
          width: 1200,
          height: 630,
          alt: `${tokenSymbol} strategies on Amber`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [
        {
          url: shareImage,
          width: 1200,
          height: 630,
          alt: `${tokenSymbol} strategies on Amber`,
        },
      ],
      site: '@amberfi_io',
      creator: '@amberfi_io',
    },
    other: {
      'discord:image': shareImage,
    },
  }
}
