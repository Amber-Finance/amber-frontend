// Using untyped config to avoid version-specific type issues

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
    return {
      titleTemplate: 'Amber FInance | %s',
      twitter: {
        handle: '@amberfi_io',
        site: '@amberfi_io',
        cardType: 'summary_large_image',
      },
      openGraph: {
        siteName: 'Amber FInance | Documentation',
      },
    }
  },
  head: undefined,
}

export default config
