'use client'

import { ReactNode, useState } from 'react'

import { Card, CardContent } from '@/components/ui/card'

interface Props {
  title: string
  subtitle: string
  value: ReactNode
  backContent: ReactNode
}

export default function FlipCard({ title, subtitle, value, backContent }: Props) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div
      className='relative cursor-pointer'
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      style={{ perspective: '1000px' }}
    >
      {/* Front side */}
      <div
        className='transition-transform duration-500 transform-gpu'
        style={{
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        <Card className='bg-background'>
          <CardContent className='p-4 text-center'>
            <div className='text-muted-foreground text-xs uppercase tracking-wider mb-2'>
              {title}
            </div>
            <div className='text-2xl font-bold'>{value}</div>
            <div className='text-xs text-muted-foreground mt-1'>{subtitle}</div>
          </CardContent>
        </Card>
      </div>

      {/* Back side */}
      <div
        className='absolute inset-0 w-full h-full transition-transform duration-500 transform-gpu'
        style={{
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
          transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(-180deg)',
        }}
      >
        {backContent}
      </div>
    </div>
  )
}
