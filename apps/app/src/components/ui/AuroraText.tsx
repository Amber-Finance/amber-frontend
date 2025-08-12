'use client'

import React, { memo } from 'react'

import { cn } from '@/lib/utils'

interface AuroraTextProps {
  children: React.ReactNode
  className?: string
  colors?: string[]
  speed?: number
}

export const AuroraText = memo(
  ({
    children,
    className = '',
    colors = ['#b1241e', '#FF6B35', '#f48a59', '#b1241e'],
    speed = 1,
  }: AuroraTextProps) => {
    const gradientStyle = {
      backgroundImage: `linear-gradient(135deg, ${colors.join(', ')}, ${colors[0]})`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      animationDuration: `${10 / speed}s`,
    }

    return (
      <span className={cn('relative inline-block', className)}>
        <span className='sr-only'>{children}</span>
        <span
          className='relative animate-aurora bg-[length:200%_auto] bg-clip-text text-transparent'
          style={gradientStyle}
          aria-hidden='true'
        >
          {children}
        </span>
      </span>
    )
  },
)

AuroraText.displayName = 'AuroraText'
