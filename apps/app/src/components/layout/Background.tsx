import { cn } from '@/lib/utils'
import React from 'react'

export default function Background() {
  return (
    <div
      className={cn(
        'absolute top-0 left-0',
        'w-full h-screen',
        'overflow-hidden pointer-events-none z-40',
      )}
    >
      <div className='absolute -top-1/4 left-1/4 w-1/2 h-[800px] opacity-30 gradient-primary' />
    </div>
  )
}
