import { Metadata } from 'next'

import tokens from '@/config/tokens'

// Token to share image mapping
const TOKEN_SHARE_IMAGES = {
  LBTC: 'https://app.amberfi.io/twitter-banner/deposit/LBTC.png',
  solvBTC: 'https://app.amberfi.io/twitter-banner/deposit/solvBTC.png',
  eBTC: 'https://app.amberfi.io/twitter-banner/deposit/eBTC.svg',
  WBTC: 'https://app.amberfi.io/twitter-banner/deposit/wBTC.png',
  uniBTC: 'https://app.amberfi.io/twitter-banner/deposit/uniBTC.png',
} as const

export async function generateDepositMetadata(tokenSymbol: string | null): Promise<Metadata> {
  if (!tokenSymbol) {
    return {
      title: 'Amber Finance | Deposit',
      description: 'Deposit your assets on Amber and start earning yield.',
      openGraph: {
        title: 'Amber Finance | Deposit',
        description: 'Deposit your assets on Amber and start earning yield.',
        images: ['https://docs.amberfi.io/twitter-banner/default.jpg'],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Amber Finance | Deposit',
        description: 'Deposit your assets on Amber and start earning yield.',
        images: ['https://docs.amberfi.io/twitter-banner/default.jpg'],
        site: '@amberfi_io',
        creator: '@amberfi_io',
      },
    }
  }

  const token = tokens.find((t) => t.symbol === tokenSymbol)
  const shareImage = TOKEN_SHARE_IMAGES[tokenSymbol as keyof typeof TOKEN_SHARE_IMAGES]

  // If token not found or no share image exists, return default deposit metadata
  if (!token || !shareImage) {
    return {
      title: 'Amber Finance | Deposit',
      description: 'Deposit your assets on Amber and start earning yield.',
      openGraph: {
        title: 'Amber Finance | Deposit',
        description: 'Deposit your assets on Amber and start earning yield.',
        images: ['https://docs.amberfi.io/twitter-banner/default.jpg'],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Amber Finance | Deposit',
        description: 'Deposit your assets on Amber and start earning yield.',
        images: ['https://docs.amberfi.io/twitter-banner/default.jpg'],
        site: '@amberfi_io',
        creator: '@amberfi_io',
      },
    }
  }

  const title = `Amber Finance | Deposit ${tokenSymbol}`
  const description = `Get yield on your ${tokenSymbol}. Preserve value. Generate wealth.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://app.amberfi.io/deposit?token=${tokenSymbol}`,
      siteName: 'Amber Finance',
      images: [
        {
          url: shareImage,
          width: 1200,
          height: 630,
          alt: `${tokenSymbol} deposit yield on Amber`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [shareImage],
      site: '@amberfi_io',
      creator: '@amberfi_io',
    },
    other: {
      'discord:image': shareImage,
    },
  }
}
