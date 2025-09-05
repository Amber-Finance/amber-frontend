import { Metadata } from 'next'

import tokens from '@/config/tokens'

// Token to share image mapping
const TOKEN_SHARE_IMAGES = {
  LBTC: 'https://app.amberfi.io/api/banner/LBTC',
  solvBTC: 'https://app.amberfi.io/api/banner/solvBTC',
  eBTC: 'https://app.amberfi.io/api/banner/eBTC',
  WBTC: 'https://app.amberfi.io/api/banner/WBTC',
  uniBTC: 'https://app.amberfi.io/api/banner/uniBTC',
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

  // Case-insensitive token lookup
  const token = tokens.find((t) => t.symbol.toLowerCase() === tokenSymbol.toLowerCase())
  const validToken = Object.keys(TOKEN_SHARE_IMAGES).find(
    (key) => key.toLowerCase() === tokenSymbol.toLowerCase(),
  ) as keyof typeof TOKEN_SHARE_IMAGES
  const shareImage = validToken ? TOKEN_SHARE_IMAGES[validToken] : undefined

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
