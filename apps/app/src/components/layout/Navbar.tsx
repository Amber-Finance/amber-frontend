'use client'

import { useEffect, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Menu, X } from 'lucide-react'

import ConnectButton from '@/components/common/ConnectButton'
import { useTheme } from '@/components/providers/ThemeProvider'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Deposit', href: '/' },
  { name: 'Strategies', href: '/strategies' },
  { name: 'Swap', href: '/swap' },
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
      <header className='fixed top-0 left-0 right-0 z-50 bg-background/50 backdrop-blur-md'>
        <nav className='mx-auto py-2 max-w-screen-2xl px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between py-1'>
            <Link href='/' className='flex items-center space-x-2 group'>
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

            <div className='hidden md:flex items-center justify-center bg-card/50 border border-border/80 rounded-full p-1'>
              {navigation.map((item, idx) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={`nav-${item.name}-${idx}`}
                    href={item.href}
                    className={cn(
                      'relative tracking-wide flex items-center px-6 py-2 text-base rounded-full transition-all duration-300',
                      isActive
                        ? 'text-foreground nav-glow-active'
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
              <div className='hidden md:flex md:items-center bg-card/50 border border-border/80 rounded-full p-1'>
                <ThemeToggle />
              </div>
              <div className='hidden md:flex md:items-center md:space-x-3 p-2 text-base bg-card/50 border border-border/80 rounded-full'>
                <ConnectButton />
              </div>
            </div>

            {/* Mobile menu button */}
            <div className='flex items-center space-x-3 md:hidden'>
              <ThemeToggle />
              <button
                type='button'
                className='inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors'
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
          <div className='fixed top-16 left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border shadow-lg'>
            <div className='px-6 py-8 space-y-6'>
              <div className='space-y-2'>
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'relative block px-6 py-4 text-base font-semibold rounded-2xl transition-all duration-300',
                        isActive
                          ? 'text-foreground nav-glow-active'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50',
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className='relative z-10'>{item.name}</span>
                    </Link>
                  )
                })}
              </div>

              {/* Mobile Connect Button */}
              <div className='pt-4 border-t border-border'>
                <ConnectButton />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
