// Using untyped config to avoid version-specific type issues
import { useRouter } from 'next/router'

const config = {
  logo: <span>Amber Finance Docs</span>,
  project: {
    link: 'https://github.com/amber-finance/amber-frontend',
  },
  docsRepositoryBase: 'https://github.com/amber-finance/amber-frontend',
  footer: {
    content: 'Amber Finance Documentation',
  },
  useNextSeoProps() {
    const { asPath } = useRouter()
    return {
      titleTemplate: 'Amber Finance | %s',
      description: 'Comprehensive documentation for Amber Finance - Liquid Staking. Solid Yields.',
      canonical: `https://docs.amberfi.io${asPath}`,
      additionalMetaTags: [
        {
          property: 'og:site_name',
          content: 'Amber Finance | Docs',
        },
        {
          property: 'og:image',
          content: 'https://docs.amberfi.io/twitter-banner/docs.jpg',
        },
        {
          property: 'og:image:width',
          content: '1280',
        },
        {
          property: 'og:image:height',
          content: '720',
        },
        {
          property: 'og:image:alt',
          content: 'Amber Finance Documentation',
        },
        {
          name: 'twitter:image',
          content: 'https://docs.amberfi.io/twitter-banner/docs.jpg',
        },
      ],
      twitter: {
        handle: '@amberfi_io',
        site: '@amberfi_io',
        cardType: 'summary_large_image',
      },
      openGraph: {
        type: 'website',
        locale: 'en_US',
        url: `https://docs.amberfi.io${asPath}`,
        siteName: 'Amber Finance | Docs',
        images: [
          {
            url: 'https://docs.amberfi.io/twitter-banner/docs.jpg',
            width: 1280,
            height: 720,
            alt: 'Amber Finance Documentation',
          },
        ],
      },
    }
  },
  head: function Head() {
    return (
      <>
        <meta property='og:site_name' content='Amber Finance | Docs' />
        <meta property='og:image' content='https://docs.amberfi.io/twitter-banner/docs.jpg' />
        <meta property='og:image:width' content='1280' />
        <meta property='og:image:height' content='720' />
        <meta property='og:image:alt' content='Amber Finance Documentation' />
        <meta name='twitter:image' content='https://docs.amberfi.io/twitter-banner/docs.jpg' />
        <meta name='twitter:site' content='@amberfi_io' />
        <meta name='twitter:creator' content='@amberfi_io' />
      </>
    )
  },
}

export default config
