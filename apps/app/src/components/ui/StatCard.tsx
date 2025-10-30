import { ReactNode } from 'react'

import { CountingNumber } from '@/components/ui/CountingNumber'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatLargeCurrency, formatLargeNumber } from '@/utils/formatting/format'

// Helper to determine width class based on formatted value suffix
const getWidthForSuffix = (formattedValue: string, isCurrency: boolean): string => {
  if (formattedValue.includes('B')) return isCurrency ? 'min-w-[120px]' : 'min-w-[110px]'
  if (formattedValue.includes('M')) return isCurrency ? 'min-w-[100px]' : 'min-w-[90px]'
  if (formattedValue.includes('k')) return isCurrency ? 'min-w-[80px]' : 'min-w-[70px]'
  return isCurrency ? 'min-w-[90px]' : 'min-w-[80px]'
}

// Helper to render large currency with colored dollar sign
const renderLargeCurrency = (value: number) => {
  const formattedValue = formatLargeCurrency(value)
  const dollarSign = formattedValue.startsWith('-$') ? '-$ ' : '$ '
  const numberPart = formattedValue.replace(/^(-\$|\$)/, '')

  return (
    <>
      <span className='text-primary'>{dollarSign}</span>
      <span className='text-foreground'>{numberPart}</span>
    </>
  )
}

// Helper to render small currency with colored dollar sign
const renderSmallCurrency = (value: number, decimalPlaces: number) => (
  <>
    <span className='text-primary'>$ </span>
    <CountingNumber value={value} decimalPlaces={decimalPlaces} />
  </>
)

interface StatCardProps {
  value: number | null
  label: string | ReactNode
  isCurrency?: boolean
  decimalPlaces?: number
  prefix?: string
  suffix?: string
  abbreviated?: boolean
}

export function StatCard({
  value,
  label,
  isCurrency = false,
  decimalPlaces = 0,
  prefix = '',
  suffix = '',
  abbreviated = true,
}: StatCardProps) {
  const isLoading = value === null
  const isLargeValue = !isLoading && value >= 10000 && abbreviated

  const renderValue = () => {
    if (isLoading) {
      return <Skeleton className='h-6 sm:h-7 lg:h-8 w-20 mx-auto' />
    }

    if (isCurrency && isLargeValue) return renderLargeCurrency(value)
    if (isCurrency) return renderSmallCurrency(value, decimalPlaces)
    if (isLargeValue) return formatLargeNumber(decimalPlaces)(value)

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
    if (isLoading) return 'min-w-[90px]'
    if (!isLargeValue) return 'min-w-[80px]'

    const formattedValue = isCurrency
      ? formatLargeCurrency(value)
      : formatLargeNumber(decimalPlaces)(value)

    return getWidthForSuffix(formattedValue, isCurrency)
  }

  return (
    <div
      className={`${getDynamicWidth()} bg-card backdrop-blur-xl border border-border/50 rounded-xl p-2 sm:p-4 text-center hover:bg-card transition-all duration-300 group cursor-default`}
    >
      <div className='space-y-1'>
        <div className='text-base font-funnel sm:text-lg lg:text-2xl text-foreground transition-transform duration-300'>
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
