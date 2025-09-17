import { ReactNode } from 'react'

import { CountingNumber } from '@/components/ui/CountingNumber'
import { formatLargeCurrency, formatLargeNumber } from '@/utils/format'

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
      // For currency, we need to separate the dollar sign and number for different colors
      const formattedValue = formatLargeCurrency(value)
      const dollarSign = formattedValue.startsWith('-$') ? '-$ ' : '$ '
      const numberPart = formattedValue.replace(/^(-\$|\$)/, '')

      return (
        <>
          <span className='text-orange-500'>{dollarSign}</span>
          <span className='text-foreground'>{numberPart}</span>
        </>
      )
    }

    // Use abbreviated formatting for large numbers
    if (value >= 1000) {
      return formatLargeNumber(decimalPlaces)(value)
    }

    return (
      <>
        {prefix}
        <CountingNumber value={value} decimalPlaces={decimalPlaces} />
        {suffix}
      </>
    )
  }

  // Calculate dynamic width based on content length
  const getDynamicWidth = () => {
    if (isCurrency && value > 0) {
      const formattedValue = formatLargeCurrency(value)
      if (formattedValue.includes('B')) return 'min-w-[120px]'
      if (formattedValue.includes('M')) return 'min-w-[100px]'
      if (formattedValue.includes('k')) return 'min-w-[80px]'
      return 'min-w-[90px]'
    }

    if (value >= 1000) {
      const formattedValue = formatLargeNumber(decimalPlaces)(value)
      if (formattedValue.includes('B')) return 'min-w-[110px]'
      if (formattedValue.includes('M')) return 'min-w-[90px]'
      if (formattedValue.includes('k')) return 'min-w-[70px]'
    }

    return 'min-w-[80px]'
  }

  return (
    <div
      className={`${getDynamicWidth()} bg-card/20 backdrop-blur-xl border border-border/50 rounded-xl p-2 sm:p-4 text-center hover:bg-card/50 transition-all duration-300 group`}
    >
      <div className='space-y-1'>
        <div className='text-base font-funnel sm:text-lg lg:text-2xl text-foreground group-hover:scale-110 transition-transform duration-300'>
          {renderValue()}
        </div>
        <div className='text-[10px] sm:text-sm text-muted-foreground font-medium uppercase tracking-widest'>
          {label}
        </div>
      </div>
      <div className='mt-1 sm:mt-2 w-full h-1 bg-gradient-to-r from-gradient-start to-gradient-end rounded-full opacity-60' />
    </div>
  )
}
