import { Metadata } from 'next'

import tokens from '@/config/tokens'

// Token to share image mapping for strategies
const TOKEN_SHARE_IMAGES = {
  lbtc: 'https://app.amberfi.io/api/banner/strategies/lbtc',
  solvbtc: 'https://app.amberfi.io/api/banner/strategies/solvbtc',
  ebtc: 'https://app.amberfi.io/api/banner/strategies/ebtc',
  wbtc: 'https://app.amberfi.io/api/banner/strategies/wbtc',
  unibtc: 'https://app.amberfi.io/api/banner/strategies/unibtc',
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
  const validToken = Object.keys(TOKEN_SHARE_IMAGES).find(
    (key) => key.toLowerCase() === tokenSymbol.toLowerCase(),
  ) as keyof typeof TOKEN_SHARE_IMAGES
  const shareImage = validToken ? TOKEN_SHARE_IMAGES[validToken] : undefined

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

  const title = `Amber Finance | ${token.symbol} Leverage Strategies`
  const description = `Amplify your ${token.symbol} yield with leverage strategies.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://app.amberfi.io/strategies/maxBTC-${token.symbol}`,
      siteName: 'Amber Finance',
      images: [
        {
          url: shareImage,
          width: 1200,
          height: 630,
          alt: `${token.symbol} strategies on Amber`,
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
          alt: `${token.symbol} strategies on Amber`,
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
