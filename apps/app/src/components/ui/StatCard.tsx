import { CountingNumber } from '@/components/ui/CountingNumber'
import { parseCompactCurrency } from '@/utils/format'
import { ReactNode } from 'react'

interface StatCardProps {
  value: number
  label: string | ReactNode
  isCurrency?: boolean
  decimalPlaces?: number
  prefix?: string
  suffix?: string
}

export function StatCard({
  value,
  label,
  isCurrency = false,
  decimalPlaces = 0,
  prefix = '',
  suffix = '',
}: StatCardProps) {
  const renderValue = () => {
    if (isCurrency && value > 0) {
      const parsed = parseCompactCurrency(value)
      return (
        <>
          {prefix}
          <CountingNumber value={parsed.value} decimalPlaces={value >= 10000000 ? 1 : 2} />
          {parsed.unit}
          {suffix}
        </>
      )
    }

    return (
      <>
        {prefix}
        <CountingNumber value={value} decimalPlaces={decimalPlaces} />
        {suffix}
      </>
    )
  }

  return (
    <div className='flex-1 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-2 sm:p-4 text-center hover:bg-card/70 transition-all duration-300 group'>
      <div className='space-y-1'>
        <div className='text-base sm:text-lg lg:text-2xl font-bold text-primary group-hover:scale-110 transition-transform duration-300'>
          {renderValue()}
        </div>
        <div className='text-[10px] sm:text-sm text-muted-foreground font-medium'>{label}</div>
      </div>
      <div className='mt-1 sm:mt-2 w-full h-1 bg-gradient-to-r from-gradient-start to-gradient-end rounded-full opacity-60' />
    </div>
  )
}
