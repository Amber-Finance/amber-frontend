'use client'

import Image from 'next/image'
import Link from 'next/link'

import { GitHubLogoIcon, TwitterLogoIcon } from '@radix-ui/react-icons'

import { useTheme } from '@/components/providers/ThemeProvider'

interface Icon {
  icon: React.ReactElement
  url: string
  label: string
}

const icons: Icon[] = [
  {
    icon: <TwitterLogoIcon className='h-5 w-5' />,
    url: 'https://twitter.com/amberfi_io',
    label: 'Twitter',
  },
  {
    icon: <GitHubLogoIcon className='h-5 w-5' />,
    url: 'https://github.com/amber-finance',
    label: 'GitHub',
  },
]

const footerSections = [
  {
    title: 'Platform',
    links: [
      { title: 'Yield', url: '/' },
      { title: 'Strategies', url: '/strategies' },
      { title: 'Swap', url: '/swap' },
      { title: 'Deposit', url: '/deposit' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { title: 'Documentation', url: 'https://docs.amberfi.io' },
      { title: 'User Guide', url: 'https://docs.amberfi.io/user-guide' },
      { title: 'FAQ', url: 'https://docs.amberfi.io/faq' },
      { title: 'Strategies', url: 'https://docs.amberfi.io/strategies' },
    ],
  },
]

export function Footer() {
  const { resolvedTheme } = useTheme()

  return (
    <footer className='mt-20 bg-background/50 backdrop-blur-md border-t border-border/50'>
      {/* Main Footer Content */}
      <div className='mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
          {/* Brand Section */}
          <div className='md:col-span-2'>
            <Link href='/' className='flex items-center gap-x-3 mb-4'>
              <Image
                src={resolvedTheme === 'dark' ? '/logo/logo-light.svg' : '/logo/logo-dark.svg'}
                alt='Amber Finance'
                width={32}
                height={32}
                className='h-10 w-auto'
              />
            </Link>
            <p className='text-muted-foreground mb-6 max-w-md'>Liquid Staking. Solid Yield.</p>

            {/* Social Links */}
            <div className='flex items-center gap-x-4'>
              {icons.map((icon, index) => (
                <a
                  key={index}
                  href={icon.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  aria-label={icon.label}
                  className='flex h-10 w-10 items-center justify-center rounded-md border border-border/50 bg-card/50 text-muted-foreground transition-all duration-200 ease-linear hover:text-foreground hover:border-border hover:bg-card'
                >
                  {icon.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link Sections Container */}
          <div className='grid grid-cols-2 md:grid-cols-2 gap-8 md:col-span-2'>
            {footerSections.map((section, index) => (
              <div key={index}>
                <h3 className='text-sm font-semibold text-foreground mb-4 uppercase tracking-wider'>
                  {section.title}
                </h3>
                <ul className='space-y-3'>
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      {link.url.startsWith('http') ? (
                        <a
                          href={link.url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-sm text-muted-foreground transition-all duration-200 ease-linear hover:text-foreground hover:underline hover:underline-offset-4'
                        >
                          {link.title}
                        </a>
                      ) : (
                        <Link
                          href={link.url}
                          className='text-sm text-muted-foreground transition-all duration-200 ease-linear hover:text-foreground hover:underline hover:underline-offset-4'
                        >
                          {link.title}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className='border-t border-border/50 bg-card/30'>
        <div className='mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-4'>
          <p className='text-center text-sm text-muted-foreground'>
            © 2025 Amber Finance. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
