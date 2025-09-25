'use client'

import { useEffect, useState } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { ChevronDown, Menu, X } from 'lucide-react'

import ConnectButton from '@/components/common/ConnectButton'
import { useTheme } from '@/components/providers/ThemeProvider'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { cn } from '@/lib/utils'

const mainNavigation = [
  { name: 'Deposit', href: '/' },
  { name: 'Strategies', href: '/strategies' },
]

const moreNavigation = [
  { name: 'Portfolio', href: '/portfolio' },
  { name: 'Swap', href: '/swap' },
  { name: 'Bridge', href: 'https://bridge.amberfi.io' },
  { name: 'Statistics', href: 'https://stats.amberfi.io' },
]

// Combined navigation for mobile
const allNavigation = [...mainNavigation, ...moreNavigation]

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false)
  const pathname = usePathname()
  const { resolvedTheme } = useTheme()

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false)
    setMoreDropdownOpen(false)
  }, [pathname])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (moreDropdownOpen && !target.closest('[data-dropdown]')) {
        setMoreDropdownOpen(false)
      }
    }

    if (moreDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [moreDropdownOpen])

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
      <header className='fixed top-0 right-0 left-0 z-50 backdrop-blur-md bg-background/50 border-b border-border/50'>
        <nav className='px-4 py-2 mx-auto max-w-screen-2xl sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-1'>
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

            <div className='hidden justify-center gap-2 items-center p-1 rounded-full md:flex'>
              {/* Main navigation items */}
              {mainNavigation.map((item, idx) => {
                const isActive =
                  item.href === '/'
                    ? pathname === '/' || pathname.startsWith('/deposit')
                    : pathname.startsWith(item.href)
                return (
                  <Link
                    key={`nav-${item.name}-${idx}`}
                    href={item.href}
                    className={cn(
                      'relative tracking-wide flex items-center px-4 py-2 text-base rounded-full transition-all duration-500 ease-in-out',
                      isActive
                        ? 'text-foreground nav-glow-active shadow-lg'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/20',
                    )}
                  >
                    {item.name}
                  </Link>
                )
              })}

              {/* More dropdown */}
              <div className='relative' data-dropdown>
                <button
                  onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                  className={cn(
                    'relative tracking-wide flex items-center px-4 py-2 text-base rounded-full transition-all duration-500 ease-in-out',
                    moreDropdownOpen ||
                      moreNavigation.some((item) =>
                        item.href === '/'
                          ? pathname === '/' || pathname.startsWith('/deposit')
                          : pathname.startsWith(item.href),
                      )
                      ? 'text-foreground nav-glow-active shadow-lg'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/20',
                  )}
                >
                  More
                  <ChevronDown
                    className={cn(
                      'ml-1 h-4 w-4 transition-transform duration-200',
                      moreDropdownOpen ? 'rotate-180' : '',
                    )}
                  />
                </button>

                {/* Dropdown menu */}
                {moreDropdownOpen && (
                  <div className='absolute top-full left-0 mt-2 w-48 bg-background/95 backdrop-blur-md border border-border rounded-xl shadow-lg z-50'>
                    <div className='py-2'>
                      {moreNavigation.map((item, idx) => {
                        const isActive =
                          item.href === '/'
                            ? pathname === '/' || pathname.startsWith('/deposit')
                            : pathname.startsWith(item.href)
                        return (
                          <Link
                            key={`more-${item.name}-${idx}`}
                            href={item.href}
                            className={cn(
                              'block px-4 py-3 text-sm transition-colors duration-200',
                              isActive
                                ? 'text-foreground bg-muted/50'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/20',
                            )}
                            onClick={() => setMoreDropdownOpen(false)}
                          >
                            {item.name}
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Actions */}
            <div className='hidden md:flex md:items-center md:space-x-3'>
              <div className='hidden p-1 rounded-full border md:flex md:items-center bg-card border-border/80'>
                <ThemeToggle />
              </div>
              <div className='hidden p-2 text-base rounded-full border md:flex md:items-center md:space-x-3 bg-card border-border/80'>
                <ConnectButton />
              </div>
            </div>

            {/* Mobile menu button */}
            <div className='flex items-center space-x-3 md:hidden'>
              <ThemeToggle />
              <button
                type='button'
                className='inline-flex justify-center items-center p-2 rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-secondary'
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded='false'
              >
                <span className='sr-only'>Open main menu</span>
                {mobileMenuOpen ? (
                  <X className='block w-5 h-5' aria-hidden='true' />
                ) : (
                  <Menu className='block w-5 h-5' aria-hidden='true' />
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
            className='fixed inset-0 backdrop-blur-sm bg-background/80'
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className='fixed right-0 left-0 top-16 border-b shadow-lg backdrop-blur-md bg-background/95 border-border'>
            <div className='px-6 py-8 space-y-6'>
              <div className='space-y-2'>
                {allNavigation.map((item) => {
                  const isActive =
                    item.href === '/'
                      ? pathname === '/' || pathname.startsWith('/deposit')
                      : pathname.startsWith(item.href)
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'relative block px-6 py-4 text-base tracking-wide rounded-full transition-all duration-500',
                        isActive
                          ? 'text-foreground nav-glow-active shadow-lg'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/20',
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
