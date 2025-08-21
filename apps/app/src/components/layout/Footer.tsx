'use client'

import Image from 'next/image'
import Link from 'next/link'

import { GitHubLogoIcon, TwitterLogoIcon } from '@radix-ui/react-icons'

// Telegram Icon Component
const TelegramIcon = ({ className }: { className?: string }) => (
  <svg
    role='img'
    fill='currentColor'
    viewBox='0 0 24 24'
    xmlns='http://www.w3.org/2000/svg'
    className={className}
  >
    <title>Telegram</title>
    <path d='M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z' />
  </svg>
)

interface Icon {
  icon: React.ReactElement
  url: string
  label: string
}

const icons: Icon[] = [
  {
    icon: <TwitterLogoIcon className='h-5 w-5' />,
    url: 'https://twitter.com/amberfi_io',
    label: 'X',
  },
  {
    icon: <GitHubLogoIcon className='h-5 w-5' />,
    url: 'https://github.com/amber-finance',
    label: 'GitHub',
  },
  {
    icon: <TelegramIcon className='h-5 w-5' />,
    url: 'https://t.me/mars_protocol',
    label: 'Mars Telegram',
  },
]

const footerSections = [
  {
    title: 'Platform',
    links: [
      { title: 'Deposit', url: '/deposit' },
      { title: 'Strategies (Looping)', url: '/strategies' },
      { title: 'Swap', url: '/swap' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { title: 'Documentation', url: 'https://docs.amberfi.io' },
      { title: 'Amber GitHub', url: 'https://github.com/amber-finance' },
    ],
  },
]

export function Footer() {
  return (
    <footer className='mt-20 bg-background/50 backdrop-blur-md border-t border-border/50'>
      {/* Main Footer Content */}
      <div className='mx-auto max-w-6xl px-8 md:px-16 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
          {/* Brand Section */}
          <div className='md:col-span-2'>
            <Link href='/' className='flex items-center gap-x-3 mb-4'>
              <Image
                src='/logo/logo-light.svg'
                alt='Amber Finance'
                width={32}
                height={32}
                className='h-10 w-auto'
              />
            </Link>
            <p className='text-muted-foreground mb-6 max-w-md'>Connect with us:</p>

            {/* Social Links */}
            <div className='flex items-center gap-x-4'>
              {icons.map((icon) => (
                <a
                  key={icon.label}
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
          <div className='grid grid-cols-2 md:grid-cols-2 gap-8 md:col-span-2 text-right'>
            {footerSections.map((section, index) => (
              <div key={index} className='text-right'>
                <h3 className='text-sm font-semibold text-foreground mb-4 uppercase tracking-wider'>
                  {section.title}
                </h3>
                <ul className='space-y-3'>
                  {section.links.map((link) => (
                    <li key={link.title}>
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
        <div className='mx-auto max-w-6xl px-8 md:px-16 py-4'>
          <p className='text-center text-sm text-muted-foreground'>
            © 2025 Amber Finance. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
