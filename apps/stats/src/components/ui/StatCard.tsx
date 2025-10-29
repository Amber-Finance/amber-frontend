import { ReactNode } from 'react'

import { CountingNumber } from '@/components/ui/CountingNumber'
import { Skeleton } from '@/components/ui/Skeleton'

interface StatCardProps {
  value: number | null
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
  const isLoading = value === null

  const renderValue = () => {
    if (isLoading) {
      return <Skeleton className='h-6 sm:h-7 lg:h-8 w-20 mx-auto' />
    }

    if (isCurrency) {
      return (
        <>
          <span className='text-orange-500'>$ </span>
          <CountingNumber value={value} decimalPlaces={decimalPlaces} />
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
    <div className='min-w-[80px] bg-card/20 backdrop-blur-xl border border-border/50 rounded-xl p-2 sm:p-4 text-center hover:bg-card/50 transition-all duration-300 group'>
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
