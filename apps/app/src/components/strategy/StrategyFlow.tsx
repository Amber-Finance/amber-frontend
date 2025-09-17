'use client'

import React, { forwardRef, useRef } from 'react'

import { ArrowRight, RotateCcw, TrendingUp, Wallet } from 'lucide-react'

import { AnimatedBeam } from '@/components/ui/AnimatedBeam'
import { cn } from '@/lib/utils'

const Circle = forwardRef<HTMLDivElement, { className?: string; children?: React.ReactNode }>(
  ({ className, children }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)] bg-card',
          className,
        )}
      >
        {children}
      </div>
    )
  },
)

Circle.displayName = 'Circle'

export function StrategyFlow() {
  const containerRef = useRef<HTMLDivElement>(null)
  const depositRef = useRef<HTMLDivElement>(null)
  const borrowRef = useRef<HTMLDivElement>(null)
  const swapRef = useRef<HTMLDivElement>(null)
  const relendRef = useRef<HTMLDivElement>(null)

  return (
    <div
      className='relative flex w-full items-center justify-center overflow-hidden p-10'
      ref={containerRef}
    >
      <div className='flex size-full flex-col items-stretch justify-between gap-10'>
        <div className='flex flex-row justify-between'>
          <Circle ref={depositRef}>
            <Wallet />
          </Circle>
          <Circle ref={borrowRef}>
            <ArrowRight />
          </Circle>
          <Circle ref={swapRef}>
            <RotateCcw />
          </Circle>
          <Circle ref={relendRef}>
            <TrendingUp />
          </Circle>
        </div>
      </div>

      <AnimatedBeam
        duration={3}
        containerRef={containerRef}
        fromRef={depositRef}
        toRef={borrowRef}
      />
      <AnimatedBeam duration={3} containerRef={containerRef} fromRef={borrowRef} toRef={swapRef} />
      <AnimatedBeam duration={3} containerRef={containerRef} fromRef={swapRef} toRef={relendRef} />
    </div>
  )
}
