'use client'

import { useEffect, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Menu, X } from 'lucide-react'

import { useTheme } from '@/components/providers/ThemeProvider'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { cn } from '@/utils/ui'

const navigation = [
  { name: 'Deposit', href: process.env.NEXT_PUBLIC_MAIN_APP_URL || 'https://app.amberfi.io' },
  {
    name: 'Strategies',
    href: (process.env.NEXT_PUBLIC_MAIN_APP_URL || 'https://app.amberfi.io') + '/strategies',
  },
  {
    name: 'Swap',
    href: (process.env.NEXT_PUBLIC_MAIN_APP_URL || 'https://app.amberfi.io') + '/swap',
  },
  { name: 'Bridge', href: '/' },
]

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { resolvedTheme } = useTheme()

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  return (
    <>
      <header className='fixed left-0 right-0 top-0 z-50 bg-background/50 backdrop-blur-md'>
        <nav className='mx-auto max-w-screen-2xl px-4 py-2 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between py-1'>
            <Link href='/' className='group flex items-center space-x-2'>
              <div className='relative'>
                <Image
                  src='/logo/logo-simple/logo-dark-400x140.svg'
                  alt='Amber Finance'
                  width={142}
                  height={50}
                  className={cn(
                    'transition-opacity duration-700 ease-in-out',
                    resolvedTheme === 'dark' ? 'opacity-0' : 'opacity-100',
                  )}
                />
                <Image
                  src='/logo/logo-simple/logo-light-400x140.svg'
                  alt='Amber Finance'
                  width={142}
                  height={50}
                  className={cn(
                    'absolute inset-0 transition-opacity duration-700 ease-in-out',
                    resolvedTheme === 'dark' ? 'opacity-100' : 'opacity-0',
                  )}
                />
              </div>
            </Link>

            <div className='hidden items-center justify-center rounded-full border border-border/80 bg-card/50 p-1 md:flex'>
              {navigation.map((item, idx) => {
                const isActive =
                  pathname === item.href || (item.name === 'Bridge' && pathname === '/')

                return (
                  <Link
                    key={`nav-${item.name}-${idx}`}
                    href={item.href}
                    className={cn(
                      'relative flex items-center rounded-full px-6 py-2 text-base tracking-wide transition-all duration-300',
                      isActive
                        ? 'nav-glow-active text-foreground'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </div>

            {/* Desktop Actions */}
            <div className='hidden md:flex md:items-center md:space-x-3'>
              <div className='hidden rounded-full border border-border/80 bg-card/50 p-1 md:flex md:items-center'>
                <ThemeToggle />
              </div>
            </div>

            {/* Mobile menu button */}
            <div className='flex items-center space-x-3 md:hidden'>
              <ThemeToggle />
              <button
                type='button'
                className='inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground'
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded='false'
              >
                <span className='sr-only'>Open main menu</span>
                {mobileMenuOpen ? (
                  <X className='block h-5 w-5' aria-hidden='true' />
                ) : (
                  <Menu className='block h-5 w-5' aria-hidden='true' />
                )}
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className='fixed inset-0 z-40 md:hidden'>
          {/* Backdrop */}
          <div
            className='fixed inset-0 bg-background/80 backdrop-blur-sm'
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className='fixed left-0 right-0 top-16 border-b border-border bg-background/95 shadow-lg backdrop-blur-md'>
            <div className='space-y-6 px-6 py-8'>
              <div className='space-y-2'>
                {navigation.map((item) => {
                  const isActive =
                    pathname === item.href || (item.name === 'Bridge' && pathname === '/')
                  const isExternal = item.href.startsWith('http')

                  if (isExternal) {
                    return (
                      <a
                        key={item.name}
                        href={item.href}
                        target='_blank'
                        rel='noopener noreferrer'
                        className={cn(
                          'relative block rounded-2xl px-6 py-4 text-base font-semibold transition-all duration-300',
                          isActive
                            ? 'nav-glow-active text-foreground'
                            : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground',
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className='relative z-10'>{item.name}</span>
                      </a>
                    )
                  }

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'relative block rounded-2xl px-6 py-4 text-base font-semibold transition-all duration-300',
                        isActive
                          ? 'nav-glow-active text-foreground'
                          : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground',
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className='relative z-10'>{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
