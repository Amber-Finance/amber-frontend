'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import ConnectButton from '@/components/common/ConnectButton'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const navigation = [
  { name: 'Yield', href: '/' },
  { name: 'Strategies', href: '/strategies' },
  { name: 'Swap', href: '/swap' },
]

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

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
          <div className='flex items-center justify-between h-16'>
            {/* Logo */}
            <Link href='/' className='flex items-center space-x-2 group'>
              AmberFinance
            </Link>

            <div className='hidden md:flex items-center justify-center bg-card/50 border border-border/50 rounded-xl p-1'>
              {navigation.map((item, idx) => {
                const isActive = pathname === item.href
                return (
                  <React.Fragment key={`nav-${item.name}-${idx}`}>
                    <Link
                      href={item.href}
                      className={cn(
                        'relative flex items-center px-5 py-2 text-xs rounded-md transition-all duration-300 border border-transparent',
                        isActive
                          ? 'text-foreground nav-glow-active'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {item.name.toUpperCase()}
                    </Link>
                    {idx < navigation.length - 1 && (
                      <div className='h-6 w-px bg-border mx-1 opacity-60' />
                    )}
                  </React.Fragment>
                )
              })}
            </div>

            {/* Desktop Actions */}
            <div className='hidden md:flex md:items-center md:space-x-3'>
              <ThemeToggle />
              <ConnectButton />
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
          <div className='fixed top-16 left-0 right-0 bg-background border-b border-border shadow-lg'>
            <div className='px-4 py-6 space-y-4'>
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'relative block px-4 py-3 text-base font-medium rounded-md border border-border bg-card transition-all duration-300 group',
                      isActive
                        ? 'text-foreground nav-glow-active'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className='relative z-10'>{item.name}</span>
                  </Link>
                )
              })}

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
