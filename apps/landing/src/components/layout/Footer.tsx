'use client'

import Image from 'next/image'
import Link from 'next/link'

import { GitHubLogoIcon } from '@radix-ui/react-icons'

import { useTheme } from '@/components/providers/ThemeProvider'
import { TelegramLogo, XLogo } from '@/components/utils/SocialIcons'
import { cn } from '@/lib/utils'

const icons: Icon[] = [
  {
    icon: <XLogo className='w-5 h-5' />,
    url: 'https://x.amberfi.io',
    label: 'X',
  },
  {
    icon: <GitHubLogoIcon className='w-5 h-5' />,
    url: 'https://github.amberfi.io',
    label: 'GitHub',
  },
  {
    icon: <TelegramLogo className='w-5 h-5' />,
    url: 'https://telegram.amberfi.io',
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
      { title: 'Bridge', url: 'https://bridge.amberfi.io' },
      { title: 'Statistics', url: 'https://stats.amberfi.io' },
      { title: 'V1', url: 'https://v1.amberfi.io' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { title: 'Documentation', url: 'https://docs.amberfi.io' },
      { title: 'Amber GitHub', url: 'https://github.amberfi.io' },
    ],
  },
]

export function Footer() {
  const { resolvedTheme } = useTheme()

  return (
    <footer className='mt-16 border-t backdrop-blur-md bg-background/70 border-border/50'>
      {/* Main Footer Content */}
      <div className='px-8 py-12 mx-auto max-w-6xl md:px-16'>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-4'>
          {/* Brand Section */}
          <div className='md:col-span-2'>
            <Link href='/' className='flex gap-x-3 items-center mb-4 relative'>
              <Image
                src='/logo/logo-simple/logo-dark-400x140.svg'
                alt='Amber Finance'
                width={142}
                height={50}
                className={cn(
                  'h-10 w-auto transition-opacity duration-700 ease-in-out',
                  resolvedTheme === 'dark' ? 'opacity-0' : 'opacity-100',
                )}
              />
              <Image
                src='/logo/logo-simple/logo-light-400x140.svg'
                alt='Amber Finance'
                width={142}
                height={50}
                className={cn(
                  'h-10 w-auto absolute inset-0 transition-opacity duration-700 ease-in-out',
                  resolvedTheme === 'dark' ? 'opacity-100' : 'opacity-0',
                )}
              />
            </Link>
            <p className='mb-6 max-w-md text-muted-foreground'>Connect with us:</p>

            {/* Social Links */}
            <div className='flex gap-x-4 items-center'>
              {icons.map((icon) => (
                <a
                  key={icon.label}
                  href={icon.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  aria-label={icon.label}
                  className='flex justify-center items-center w-10 h-10 rounded-md border transition-all duration-200 ease-linear border-border/50 bg-card/20 text-muted-foreground hover:text-foreground hover:border-border hover:bg-card'
                >
                  {icon.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link Sections Container */}
          <div className='grid grid-cols-2 gap-8 text-right md:grid-cols-2 md:col-span-2'>
            {footerSections.map((section, index) => (
              <div key={`${section.title}-${index}`} className='text-right'>
                <h3 className='mb-4 text-sm font-semibold tracking-wider uppercase text-foreground'>
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
                          className='text-sm transition-all duration-200 ease-linear text-muted-foreground hover:text-foreground hover:underline hover:underline-offset-4'
                        >
                          {link.title}
                        </a>
                      ) : (
                        <Link
                          href={link.url}
                          className='text-sm transition-all duration-200 ease-linear text-muted-foreground hover:text-foreground hover:underline hover:underline-offset-4'
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
        <div className='px-8 py-4 mx-auto max-w-6xl md:px-16'>
          <p className='text-sm text-center text-muted-foreground'>
            © 2025 Amber Finance. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
