import { useEffect, useState } from 'react'

import { LucideIcon } from 'lucide-react'

import TokenBalance from '@/components/common/TokenBalance'
import { cn } from '@/lib/utils'

interface BalanceRowProps {
  icon: LucideIcon
  label: string
  coin: {
    denom: string
    amount: string
  }
  brandColor?: string
  actionType?: 'deposit' | 'withdraw' | null
}

export default function BalanceRow({
  icon: Icon,
  label,
  coin,
  brandColor,
  actionType = null,
}: BalanceRowProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [color, setColor] = useState<'text-green-500' | 'text-red-500' | 'text-foreground'>(
    'text-foreground',
  )

  useEffect(() => {
    if (actionType === 'deposit') {
      setColor('text-green-500')
      setIsAnimating(true)
    } else if (actionType === 'withdraw') {
      setColor('text-red-500')
      setIsAnimating(true)
    } else {
      setColor('text-foreground')
    }

    if (actionType) {
      const scaleTimer = setTimeout(() => setIsAnimating(false), 300)
      const colorTimer = setTimeout(() => setColor('text-foreground'), 3000)
      return () => {
        clearTimeout(scaleTimer)
        clearTimeout(colorTimer)
      }
    }
  }, [actionType])

  return (
    <div className='flex justify-between items-center p-2 rounded-lg bg-muted/20'>
      <div className='flex items-center gap-2'>
        <Icon className='w-3 h-3 sm:w-4 sm:h-4' style={{ color: brandColor }} />
        <span className='text-xs sm:text-sm font-medium'>{label}</span>
      </div>
      <div className='text-right'>
        <div className={cn('transition-all duration-200', isAnimating && 'scale-110 transform')}>
          <TokenBalance coin={coin} size='sm' textClassName={color} />
        </div>
      </div>
    </div>
  )
}
