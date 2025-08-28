import { ReactNode } from 'react'

import { AuroraText } from '@/components/ui/AuroraText'
import { StatCard } from '@/components/ui/StatCard'

interface HeroProps {
  title?: string | ReactNode
  subtitle?: string | ReactNode
  description?: string
  stats?: Array<{
    value: number
    label: string | ReactNode
    isCurrency?: boolean
    prefix?: string
  }>
}

export default function Hero({ title, subtitle, description, stats }: HeroProps) {
  return (
    <section className='relative w-full py-10 sm:py-20 overflow-hidden px-4 sm:px-8'>
      <div className='flex flex-col lg:flex-row items-start lg:items-end gap-8 lg:gap-12'>
        {/* Left Column - Main Content */}
        <div className='flex-1 flex flex-col justify-between gap-6'>
          <div className='space-y-3'>
            <h1 className='text-3xl lg:text-5xl font-funnel leading-tight'>
              {title && (
                <>
                  {title}
                  {subtitle && <span className='block'>{subtitle}</span>}
                </>
              )}
            </h1>
            {description && (
              <p className='text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg'>
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Right Column - Stats Cards */}
        {stats && stats.length > 0 && (
          <div className='flex-1 max-w-md w-full h-full flex justify-end'>
            <div className='flex flex-row gap-2 sm:gap-3'>
              {stats.map((stat, index) => (
                <StatCard
                  key={index}
                  value={stat.value}
                  label={stat.label}
                  isCurrency={stat.isCurrency}
                  prefix={stat.prefix}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
