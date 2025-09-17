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
  search: {
    placeholder: 'Search documentation...',
  },
  useNextSeoProps() {
    return {
      titleTemplate: '%s – Amber Finance Docs',
    }
  },
  // Let Nextra Docs theme read front matter for title/description/openGraph
}

export default config
