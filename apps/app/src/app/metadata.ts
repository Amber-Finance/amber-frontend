import { Metadata } from 'next'

export const metaData: { [key: string]: Metadata } = {
  home: {
    title: 'Amber Finance - powered by Mars Protocol',
    metadataBase: new URL('https://app.amberfi.io'),
    description: 'Lend and borrow Bitcoin Derivatives on Neutron.',
    keywords: ['ibc', 'neutron', 'lend', 'borrow', 'earn', 'mars protocol'],
    openGraph: {
      type: 'website',
      url: 'https://app.amberfi.io',
      title: 'Amber Finance - powered by Mars Protocol',
      locale: 'en_US',
      description: 'Lend and borrow Bitcoin Derivatives on Neutron.',
      siteName: 'Amber Finance',
      images: [
        {
          url: 'https://app.amberfi.io/banner.jpg',
          width: 1280,
          height: 720,
          alt: 'Amber Finance',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@mars_protocol',
      title: 'Amber Finance - powered by Mars Protocol',
      description: 'Lend and borrow on Neutron with easy. Simple, secure, and fast.',
      images: [
        {
          url: 'https://app.amberfi.io/banner.jpg',
          width: 1280,
          height: 720,
          alt: 'Amber Finance',
        },
      ],
    },
  },
  markets: {
    title: 'Amber Finance - Markets',
    metadataBase: new URL('https://app.amberfi.io'),
    description: 'Explore the markets on Amber Finance.',
    keywords: ['ibc', 'neutron', 'lend', 'borrow', 'earn', 'mars protocol'],
    openGraph: {
      type: 'website',
      url: 'https://app.amberfi.io/markets',
      title: 'Amber Finance - Markets',
      locale: 'en_US',
      description: 'Explore the markets on Amber Finance.',
      siteName: 'Amber Finance',
              images: [
        {
          url: 'https://app.amberfi.io/banner.jpg',
          width: 1280,
          height: 720,
          alt: 'Amber Finance',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@mars_protocol',
      title: 'Amber Finance - Markets',
      description: 'Explore the markets on Amber Finance.',
      images: [
        {
          url: 'https://app.amberfi.io/banner.jpg',
          width: 1280,
          height: 720,
          alt: 'Amber Finance',
        },
      ],
    },
  },
}
