'use client'

import React, { forwardRef, useRef } from 'react'

import Image from 'next/image'

import { AnimatedBeam } from '@/components/ui/AnimatedBeam'
import { cn } from '@/lib/utils'

const Circle = forwardRef<HTMLDivElement, { className?: string; children?: React.ReactNode }>(
  ({ className, children }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'z-10 flex size-12 items-center justify-center rounded-full border-2 bg-background p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]',
          className,
        )}
      >
        {children}
      </div>
    )
  },
)

Circle.displayName = 'Circle'

export function FirstBentoSection({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const div1Ref = useRef<HTMLDivElement>(null)
  const div2Ref = useRef<HTMLDivElement>(null)
  const div3Ref = useRef<HTMLDivElement>(null)
  const div5Ref = useRef<HTMLDivElement>(null)
  const div6Ref = useRef<HTMLDivElement>(null)
  const div7Ref = useRef<HTMLDivElement>(null)

  return (
    <div
      className={cn(
        'absolute opacity-60 flex h-full w-full items-center justify-center overflow-hidden p-4 hover:opacity-100 transition-all duration-300',
        className,
      )}
      ref={containerRef}
    >
      <div className='flex size-full w-full flex-row items-stretch justify-between'>
        <div className='flex flex-col justify-center'>
          <Circle ref={div7Ref}>
            <Icons.user />
          </Circle>
        </div>
        <div className='flex flex-col justify-center'>
          <Circle ref={div6Ref} className='size-16'>
            <Icons.favicon />
          </Circle>
        </div>
        <div className='flex flex-col justify-center gap-2'>
          <Circle ref={div1Ref}>
            <Icons.wbtc />
          </Circle>
          <Circle ref={div2Ref}>
            <Icons.uniBTC />
          </Circle>
          <Circle ref={div3Ref}>
            <Icons.solvBTC />
          </Circle>
          <Circle ref={div5Ref}>
            <Icons.lbtc />
          </Circle>
        </div>
      </div>

      {/* AnimatedBeams */}
      <AnimatedBeam containerRef={containerRef} fromRef={div1Ref} toRef={div6Ref} duration={3} />
      <AnimatedBeam containerRef={containerRef} fromRef={div2Ref} toRef={div6Ref} duration={3} />
      <AnimatedBeam containerRef={containerRef} fromRef={div3Ref} toRef={div6Ref} duration={3} />
      <AnimatedBeam containerRef={containerRef} fromRef={div5Ref} toRef={div6Ref} duration={3} />
      <AnimatedBeam containerRef={containerRef} fromRef={div6Ref} toRef={div7Ref} duration={3} />
    </div>
  )
}

const Icons = {
  favicon: () => (
    <Image
      src='/logo/maxBTC_Token_dark.png'
      alt='Favicon'
      width={24}
      height={24}
      className='w-6 h-6'
    />
  ),
  wbtc: () => (
    <Image src='/images/WBTC.svg' alt='WBTC' width={24} height={24} className='w-6 h-6' />
  ),
  uniBTC: () => (
    <Image src='/images/uniBTC.svg' alt='uniBTC' width={24} height={24} className='w-6 h-6' />
  ),
  solvBTC: () => (
    <Image src='/images/solvBTC.svg' alt='solvBTC' width={24} height={24} className='w-6 h-6' />
  ),
  lbtc: () => (
    <Image src='/images/LBTC.svg' alt='LBTC' width={24} height={24} className='w-6 h-6' />
  ),
  user: () => (
    <svg
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' />
      <circle cx='12' cy='7' r='4' />
    </svg>
  ),
}
