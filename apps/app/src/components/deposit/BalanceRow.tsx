import { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface BalanceRowProps {
  icon: LucideIcon
  label: string
  value: string
  usdValue?: string
  brandColor?: string
  valueChange?: 'increase' | 'decrease' | null
}

export default function BalanceRow({
  icon: Icon,
  label,
  value,
  usdValue,
  brandColor,
  valueChange,
}: BalanceRowProps) {
  const getValueColor = () => {
    if (valueChange === 'increase') return 'text-green-500'
    if (valueChange === 'decrease') return 'text-red-500'
    return 'text-foreground'
  }

  return (
    <div className='flex justify-between items-center p-2 rounded-lg bg-muted/20'>
      <div className='flex items-center gap-2'>
        <Icon className='w-3 h-3 sm:w-4 sm:h-4' style={{ color: brandColor }} />
        <span className='text-xs sm:text-sm font-medium'>{label}</span>
      </div>
      <div className='text-right'>
        <div className={cn('text-xs sm:text-sm font-funnel', getValueColor())}>{value}</div>
        {usdValue && <div className='text-xs text-muted-foreground/80'>{usdValue}</div>}
      </div>
    </div>
  )
}
