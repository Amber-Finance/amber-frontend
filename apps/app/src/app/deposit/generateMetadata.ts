import { Metadata } from 'next'

import tokens from '@/config/tokens'

// Token to share image mapping
const TOKEN_SHARE_IMAGES = {
  lbtc: 'https://app.amberfi.io/api/banner/lbtc',
  solvbtc: 'https://app.amberfi.io/api/banner/solvbtc',
  ebtc: 'https://app.amberfi.io/api/banner/ebtc',
  wbtc: 'https://app.amberfi.io/api/banner/wbtc',
  unibtc: 'https://app.amberfi.io/api/banner/unibtc',
} as const

export async function generateDepositMetadata(tokenSymbol: string | null): Promise<Metadata> {
  if (!tokenSymbol) {
    return {
      title: 'Amber Finance | Deposit',
      description: 'Deposit your assets on Amber and start earning yield.',
      openGraph: {
        title: 'Amber Finance | Deposit',
        description: 'Deposit your assets on Amber and start earning yield.',
        images: [
          {
            url: 'https://docs.amberfi.io/x-banner/deposit.jpg',
            width: 1032,
            height: 540,
            alt: 'Amber Finance | Deposit',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Amber Finance | Deposit',
        description: 'Deposit your assets on Amber and start earning yield.',
        images: [
          {
            url: 'https://docs.amberfi.io/x-banner/deposit.jpg',
            width: 1032,
            height: 540,
            alt: 'Amber Finance | Deposit',
          },
        ],
        site: '@amberfi_io',
        creator: '@amberfi_io',
      },
    }
  }

  const token = tokens.find((t) => t.symbol.toLowerCase() === tokenSymbol.toLowerCase())
  const shareImage =
    TOKEN_SHARE_IMAGES[tokenSymbol.toLowerCase() as keyof typeof TOKEN_SHARE_IMAGES]

  // If token not found or no share image exists, return default deposit metadata
  if (!token || !shareImage) {
    return {
      title: 'Amber Finance | Deposit',
      description: 'Deposit your assets on Amber and start earning yield.',
      openGraph: {
        title: 'Amber Finance | Deposit',
        description: 'Deposit your assets on Amber and start earning yield.',
        images: [
          {
            url: 'https://docs.amberfi.io/x-banner/deposit.jpg',
            width: 1032,
            height: 540,
            alt: 'Amber Finance | Deposit',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Amber Finance | Deposit',
        description: 'Deposit your assets on Amber and start earning yield.',
        images: [
          {
            url: 'https://docs.amberfi.io/x-banner/deposit.jpg',
            width: 1032,
            height: 540,
            alt: 'Amber Finance | Deposit',
          },
        ],
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
      images: [
        {
          url: shareImage,
          width: 1200,
          height: 630,
          alt: `${tokenSymbol} deposit yield on Amber`,
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
