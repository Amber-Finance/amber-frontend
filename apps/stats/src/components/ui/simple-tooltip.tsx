'use client'

import React, { useState } from 'react'

import { cn } from '@/utils/ui'

interface SimpleTooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  className?: string
  delay?: number
}

export default function SimpleTooltip({
  children,
  content,
  className = '',
  delay = 300,
}: SimpleTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    const id = setTimeout(() => {
      setIsVisible(true)
    }, delay)
    setTimeoutId(id)
  }

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
    setIsVisible(false)
  }

  return (
    <div
      className={cn('relative inline-block', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div className='absolute z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full top-0 left-1/2 mb-2 w-max'>
          <div className='bg-background border border-border rounded-lg shadow-xl p-0 max-w-sm'>
            {content}
          </div>
          {/* Arrow pointing down */}
          <div className='absolute top-full left-1/2 transform -translate-x-1/2'>
            <div className='w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-border'></div>
            <div className='absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full'>
              <div className='w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-background'></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
