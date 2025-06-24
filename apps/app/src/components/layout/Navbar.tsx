'use client'

import { ThemeToggle } from '@/components/ui/ThemeToggle'
import Logo from '@/components/layout/Logo'
import { AuroraText } from '@/components/ui/AuroraText'
import { Button } from '@/components/ui/Button'
import ConnectButton from '@/components/common/ConnectButton'
import { initializeWasm } from '@/utils/health_computer/initWasm'
import NavLink from '@/components/common/NavLink'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  // Initialize the health computer
  useEffect(() => {
    initializeWasm()
  }, [])

  return (
    <nav className='w-full mt-14'>
      <div className='flex h-14 items-center justify-between px-4'>
        <div className='flex items-center gap-6'>
          <Link href='/' className='flex items-center gap-2 text-lg font-semibold'>
            <Logo className='w-8 h-8' />
            <AuroraText
              className='text-lg font-bold'
              colors={['#f7931a', '#ff6b35', '#f7931a', '#ffaa00']}
            >
              Bitcoin Outpost
            </AuroraText>
          </Link>
        </div>
        {/* Desktop Navigation */}
        <div className='hidden md:flex items-center gap-4 border border-muted-text/5 p-1 rounded-xl bg-primary/3 ml-14'>
          <NavLink href='/'>EARN</NavLink>

          <div className='w-px h-3 bg-muted-text/10' />

          <NavLink href='/strategies'>STRATEGIES</NavLink>

          <div className='w-px h-3 bg-muted-text/10' />

          <NavLink href='/swap'>SWAP</NavLink>
        </div>

        <div className='flex items-center gap-2'>
          <ThemeToggle />
          <ConnectButton />

          {/* Mobile Menu Button */}
          <Button
            variant='hero'
            size='lg'
            className='md:hidden'
            onClick={toggleMobileMenu}
            aria-expanded={isMobileMenuOpen}
            aria-label='Toggle navigation menu'
          >
            {isMobileMenuOpen ? <X className='h-4 w-4' /> : <Menu className='h-4 w-4' />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className='md:hidden border-t border-muted-text/10'>
          <div className='py-4 space-y-2 px-4 max-w-screen-2xl mx-auto'>
            <div className='flex flex-col gap-2 border border-muted-text/5 p-1 rounded-xl bg-primary/3'>
              <NavLink href='/' onClick={toggleMobileMenu}>
                EARN
              </NavLink>

              <NavLink href='/strategies' onClick={toggleMobileMenu}>
                STRATEGIES
              </NavLink>

              <NavLink href='/swap' onClick={toggleMobileMenu}>
                SWAP
              </NavLink>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
