'use client'

import Image from 'next/image'

import { motion } from 'framer-motion'
import { BookOpen, ChevronRight } from 'lucide-react'

import SplineBgObject from '@/components/SplineBgObject'
import { Partners } from '@/components/sections/Partners'
import { cn } from '@/lib/utils'

import { AnimatedGradientText } from './ui/animated-gradient-text'

const XIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      role='img'
      fill='white'
      viewBox='0 0 24 24'
      xmlns='http://www.w3.org/2000/svg'
      className={className}
    >
      <title>X</title>
      <path d='M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z' />
    </svg>
  )
}
export const HeroContent = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className='flex flex-col items-center gap-6 pb-8 text-center w-full justify-between px-8 md:px-16'
    >
      <div className='flex flex-col items-center gap-8 pt-20 lg:gap-10 text-center lg:text-left flex-1 z-30 max-w-3xl lg:max-w-3xl'>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className='group relative mx-auto flex items-center justify-center bg-black/20 rounded-full px-4 py-1.5 shadow-[inset_0_-8px_10px_#8fdfff1f] transition-shadow duration-500 ease-out hover:shadow-[inset_0_-5px_10px_#8fdfff3f] cursor-pointer'
        >
          <span
            className={cn(
              'absolute inset-0 block w-full animate-gradient rounded-[inherit] bg-gradient-to-r from-[#ffaa40]/50 via-[#9c40ff]/50 to-[#ffaa40]/50 bg-[length:300%_100%] p-[1px] cursor-pointer',
            )}
            style={{
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'destination-out',
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'subtract',
              WebkitClipPath: 'padding-box',
            }}
          />
          <XIcon className='h-4 w-4' />
          <hr className='mx-2 h-4 w-px shrink-0 bg-neutral-500' />
          <AnimatedGradientText className='text-xs font-medium'>
            Follow us on X
          </AnimatedGradientText>
          <ChevronRight
            className='ml-1 size-4 stroke-neutral-500 transition-transform
            duration-300 ease-in-out group-hover:translate-x-0.5'
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
        >
          <Image src='/logo/logo-claim-light.svg' alt='logo' width={500} height={500} />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: 'easeOut' }}
          className='sm:text-xs md:text-sm lg:text-base xl:text-base tracking-wide text-white/70 md:text-white/60 max-w-3xl text-center'
        >
          Maximize your Bitcoin yield. Deploy BRTs (Bitcoin-Related Tokens) with up to 10x leverage
          through automated strategies on maxBTC.
        </motion.p>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
        className='flex flex-row gap-4'
      >
        <div className='flex flex-col gap-4 lg:flex-row'>
          <a
            href='https://app.amberfi.io'
            className={cn(
              // colors
              'bg-white text-black shadow hover:bg-white/90 dark:bg-white dark:text-black dark:hover:bg-white/90',

              // layout
              'group relative inline-flex h-9 w-full items-center justify-center gap-2 overflow-hidden whitespace-pre rounded-md px-4 py-2 text-sm font-semibold tracking-tighter focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 md:flex',

              // animation
              'transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-2',
            )}
          >
            Enter App
            <ChevronRight className='size-4 translate-x-0 transition-all duration-300 ease-out group-hover:translate-x-1' />
          </a>
        </div>
        <div className='flex flex-col gap-4 lg:flex-row'>
          <a
            href='https://docs.amberfi.io'
            className={cn(
              // colors
              'bg-black text-white shadow hover:bg-black/90 dark:bg-black dark:text-white dark:hover:bg-black/90',

              // layout
              'group relative inline-flex h-9 w-full items-center justify-center gap-2 overflow-hidden whitespace-pre rounded-md px-4 py-2 text-sm font-semibold tracking-tighter focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 md:flex',

              // animation
              'transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-2',
            )}
          >
            Docs
            <BookOpen className='size-4 translate-x-0 transition-all duration-300 ease-out group-hover:translate-x-1' />
          </a>
        </div>
      </motion.div>
    </motion.div>
  )
}
export function Hero() {
  return (
    <section id='hero' className='w-full h-full min-h-screen flex justify-center relative'>
      <div className='absolute inset-0 w-full h-full z-0'>
        <SplineBgObject />
      </div>
      {/* Fade overlay for smooth transition at bottom */}
      <div className='absolute inset-x-0 bottom-0 h-64 z-5 bg-gradient-to-t from-background via-background/90 via-background/60 to-transparent pointer-events-none' />
      <div className='relative h-screen w-full overflow-hidden z-10 flex flex-col justify-between items-center py-8'>
        <div className='flex-1 flex items-center justify-center'>
          <HeroContent />
        </div>
        <div className='w-full mt-auto relative z-20'>
          <Partners />
        </div>
      </div>
    </section>
  )
}
