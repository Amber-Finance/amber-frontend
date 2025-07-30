'use client'

import Image from 'next/image'

import { BookOpen, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'

import SplineBgObject from './SplineBgObject'
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
    <div className='flex flex-col items-center gap-6 pb-8 text-center w-full justify-between'>
      <div className='flex flex-col items-center gap-8 pt-20 lg:gap-10 text-center lg:text-left flex-1 z-30 max-w-2xl lg:max-w-none'>
        <div className='group relative mx-auto flex items-center justify-center bg-black/20 rounded-full px-4 py-1.5 shadow-[inset_0_-8px_10px_#8fdfff1f] transition-shadow duration-500 ease-out hover:shadow-[inset_0_-5px_10px_#8fdfff3f] cursor-pointer'>
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
          <AnimatedGradientText className='text-sm font-medium'>
            Follow us on X
          </AnimatedGradientText>
          <ChevronRight
            className='ml-1 size-4 stroke-neutral-500 transition-transform
            duration-300 ease-in-out group-hover:translate-x-0.5'
          />
        </div>
        <Image src='/logo/logo-claim-light.svg' alt='logo' width={500} height={500} />

        <p className='sm:text-sm md:text-lg lg:text-xl xl:text-xl tracking-wide text-white/70 md:text-white/60 max-w-xl lg:max-w-2xl xl:max-w-3xl text-center'>
          Put your liquid staking tokens to work. Earn maximum yield on your Bitcoin LSTs. Increase
          your exposure to maxBTC and leverage loop with smart strategies.
        </p>
      </div>
      <div className='flex flex-row gap-4'>
        <div className='flex flex-col gap-4 lg:flex-row'>
          <a
            href='#'
            className={cn(
              // colors
              'bg-white text-black shadow hover:bg-white/90 dark:bg-white dark:text-black dark:hover:bg-white/90',

              // layout
              'group relative inline-flex h-9 w-full items-center justify-center gap-2 overflow-hidden whitespace-pre rounded-md px-4 py-2 text-base font-semibold tracking-tighter focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 md:flex',

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
            href='#'
            className={cn(
              // colors
              'bg-black text-white shadow hover:bg-black/90 dark:bg-black dark:text-white dark:hover:bg-black/90',

              // layout
              'group relative inline-flex h-9 w-full items-center justify-center gap-2 overflow-hidden whitespace-pre rounded-md px-4 py-2 text-base font-semibold tracking-tighter focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 md:flex',

              // animation
              'transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-2',
            )}
          >
            Docs
            <BookOpen className='size-4 translate-x-0 transition-all duration-300 ease-out group-hover:translate-x-1' />
          </a>
        </div>
      </div>
    </div>
  )
}
export function Hero() {
  return (
    <section id='hero' className='w-full h-full min-h-screen flex justify-center relative'>
      <div className='absolute inset-0 w-full h-full z-0'>
        <SplineBgObject />
      </div>
      <div className='relative h-screen w-full overflow-hidden z-10 flex flex-col items-center justify-center'>
        <HeroContent />
        <h3 className='pb-10 bottom-0 absolute text-center text-sm font-semibold text-gray-500 bg-gradient-to-r from-background to-transparent'>
          Our Partners
        </h3>
      </div>
    </section>
  )
}
