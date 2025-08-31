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
      twitter: {
        handle: '@amberfi_io',
        site: '@amberfi_io',
        cardType: 'summary_large_image',
      },
      openGraph: {
        type: 'website',
        locale: 'en_US',
        url: `https://docs.amberfi.io${asPath}`,
        siteName: 'Amber Finance | Documentation',
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
}

export default config
