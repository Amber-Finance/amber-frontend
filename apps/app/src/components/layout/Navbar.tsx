'use client'

import { cn } from '@/lib/utils'
import { AnimatePresence, motion, Variants } from 'motion/react'
import { AlignJustify, XIcon } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import ConnectButton from '../common/ConnectButton'
import RunningCircle from '../common/RunningCircle'
import { ThemeToggle } from '../ui/ThemeToggle'
import { AuroraText } from '../ui/AuroraText'

const menuItem = [
  {
    id: 1,
    label: 'Bridge',
    href: '/',
  },
  {
    id: 2,
    label: 'Deposit',
    href: '/deposit',
  },
  {
    id: 3,
    label: 'Swap',
    href: '/swap',
  },
]

export function Navbar() {
  const mobileNavbarVariant = {
    initial: {
      opacity: 0,
      scale: 1,
    },
    animate: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.2,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2,
        delay: 0.2,
        ease: 'easeOut',
      },
    },
  }

  const mobileLinkVar = {
    initial: {
      y: '-20px',
      opacity: 0,
    },
    open: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
  }

  const containerVariants = {
    open: {
      transition: {
        staggerChildren: 0.06,
      },
    },
  }

  const [hamburgerMenuIsOpen, setHamburgerMenuIsOpen] = useState(false)

  useEffect(() => {
    const html = document.querySelector('html')
    if (html) html.classList.toggle('overflow-hidden', hamburgerMenuIsOpen)
  }, [hamburgerMenuIsOpen])

  useEffect(() => {
    const closeHamburgerNavigation = () => setHamburgerMenuIsOpen(false)
    window.addEventListener('orientationchange', closeHamburgerNavigation)
    window.addEventListener('resize', closeHamburgerNavigation)

    return () => {
      window.removeEventListener('orientationchange', closeHamburgerNavigation)
      window.removeEventListener('resize', closeHamburgerNavigation)
    }
  }, [setHamburgerMenuIsOpen])

  return (
    <>
      <header className='fixed left-0 top-0 z-50 w-full border-b backdrop-blur-[12px]'>
        <div className='mx-auto max-w-screen-2xl px-4 flex h-[7rem] items-center justify-between'>
          {/* Logo section with running circle */}
          <Link className='flex items-center gap-3' href='/'>
            <RunningCircle className='scale-75' />
            <span className='text-lg font-bold'>
              Max <AuroraText colors={['#FF8C00', '#FF6B35', '#F7931E', '#FFA500']}>BTC</AuroraText>
            </span>
          </Link>

          {/* Desktop Navigation Links - Center */}
          <nav className='hidden md:flex items-center gap-8 py-4'>
            {menuItem.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className='text-lg font-medium transition-colors hover:text-primary py-2'
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side controls */}
          <div className='flex h-full items-center gap-2'>
            <ThemeToggle />
            <ConnectButton />
            <button
              className='ml-2 md:hidden'
              onClick={() => setHamburgerMenuIsOpen((open) => !open)}
            >
              <span className='sr-only'>Toggle menu</span>
              {hamburgerMenuIsOpen ? <XIcon /> : <AlignJustify />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        <motion.nav
          initial='initial'
          exit='exit'
          variants={mobileNavbarVariant as Variants}
          animate={hamburgerMenuIsOpen ? 'animate' : 'exit'}
          className={cn(
            `fixed left-0 top-0 z-50 h-screen w-full overflow-auto bg-background/70 backdrop-blur-[12px] `,
            {
              'pointer-events-none': !hamburgerMenuIsOpen,
            },
          )}
        >
          <div className='mx-auto max-w-screen-2xl px-4 flex h-[5rem] items-center justify-between'>
            <Link className='flex items-center gap-3' href='/'>
              <RunningCircle className='scale-75' />
              <span className='text-lg font-bold'>
                Max{' '}
                <AuroraText colors={['#FF8C00', '#FF6B35', '#F7931E', '#FFA500']}>BTC</AuroraText>
              </span>
            </Link>

            <button
              className='ml-6 md:hidden'
              onClick={() => setHamburgerMenuIsOpen((open) => !open)}
            >
              <span className='sr-only'>Toggle menu</span>
              {hamburgerMenuIsOpen ? <XIcon /> : <AlignJustify />}
            </button>
          </div>
          <motion.ul
            className={`flex flex-col md:flex-row md:items-center uppercase md:normal-case ease-in`}
            variants={containerVariants}
            initial='initial'
            animate={hamburgerMenuIsOpen ? 'open' : 'exit'}
          >
            {menuItem.map((item) => (
              <motion.li
                variants={mobileLinkVar as Variants}
                key={item.id}
                className='border-grey-dark pl-6 py-0.5 border-b md:border-none'
              >
                <Link
                  className={`hover:text-grey flex h-[var(--navigation-height)] w-full items-center text-xl transition-[color,transform] duration-300 md:translate-y-0 md:text-sm md:transition-colors ${
                    hamburgerMenuIsOpen ? '[&_a]:translate-y-0' : ''
                  }`}
                  href={item.href}
                >
                  {item.label}
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        </motion.nav>
      </AnimatePresence>
    </>
  )
}
