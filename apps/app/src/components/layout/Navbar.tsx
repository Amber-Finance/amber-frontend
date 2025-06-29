'use client'

import { cn } from '@/lib/utils'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import ConnectButton from '@/components/common/ConnectButton'
import RunningCircle from '@/components/common/RunningCircle'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { AuroraText } from '@/components/ui/AuroraText'

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
      {/* Main Navigation */}
      <header className='fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50'>
        <nav className='mx-auto py-2 max-w-screen-2xl px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            {/* Logo */}
            <Link href='/' className='flex items-center space-x-2 group'>
              <RunningCircle className='scale-[0.7]' />
              <span className='text-lg font-bold group-hover:text-primary transition-colors'>
                Max{' '}
                <AuroraText colors={['#FF8C00', '#FF6B35', '#F7931E', '#FFA500']}>BTC</AuroraText>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className='hidden md:flex md:items-center md:space-x-8'>
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'text-sm font-medium transition-colors hover:text-primary px-3 py-2 rounded-md',
                      isActive
                        ? 'text-primary bg-primary/10'
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
                      'block px-4 py-3 text-base font-medium rounded-lg transition-colors',
                      isActive
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary',
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
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
