import { useRouter } from 'next/navigation'

import { AuroraText } from '@/components/ui/AuroraText'
import { StatCard } from '@/components/ui/StatCard'
import tokens from '@/config/tokens'

interface HeroProps {
  markets?: Array<{
    token: {
      symbol: string
    }
    metrics: {
      lendingApy: number
      stakingApy: number
      totalApy: number
      collateralTotalUsd: number
    }
  }> | null
}

export default function Hero({ markets }: HeroProps) {
  const router = useRouter()

  const maxApy =
    markets && markets.length > 0 ? Math.max(...markets.map((m) => m.metrics.totalApy)) : 4.5

  const totalTvl =
    markets && markets.length > 0
      ? markets.reduce((sum, m) => sum + m.metrics.collateralTotalUsd, 0)
      : 0

  const totalBtcDerivatives = tokens.filter((token) => token.isLST).length

  return (
    <section className='relative w-full py-10 sm:py-20 overflow-hidden px-4 sm:px-8'>
      <div className='flex flex-col lg:flex-row items-start lg:items-end gap-8 lg:gap-12'>
        {/* Left Column - Main Content */}
        <div className='flex-1 flex flex-col justify-between gap-6'>
          <div className='space-y-3'>
            <h1 className='text-2xl sm:text-3xl lg:text-5xl font-bold leading-tight'>
              <span className='block text-foreground'>Liquid Staking.</span>
              <span className='block'>
                <AuroraText colors={['#b1241e', '#FF6B35', '#f48a59', '#b1241e']}>
                  Amber Finance
                </AuroraText>
              </span>
            </h1>
            <p className='text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg'>
              Bridge your liquid staking tokens and earn maximum yield. Deposit LSTs to earn both
              underlying staking rewards plus additional lending APY.
            </p>
          </div>

          <div className='flex'>
            <div className='slanted-border p-[2px] inline-block bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] rounded-l-lg group'>
              <button
                onClick={() => router.push('/swap')}
                className='slanted-btn bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] text-foreground font-medium py-2 px-8 w-full h-full text-sm rounded-l-lg relative overflow-hidden'
              >
                <span className='relative z-10'>Bridge Now</span>
                <span className='absolute inset-0 bg-gradient-to-r from-[var(--gradient-end)] to-[var(--gradient-start)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-l-lg' />
              </button>
            </div>
            <div className='slanted-border-2 p-[2px] inline-block bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] rounded-r-lg group'>
              <button className='slanted-btn-2 bg-background text-foreground font-medium py-2 px-8 w-full h-full text-sm rounded-r-lg relative overflow-hidden'>
                <span className='relative z-10'>Learn More</span>
                <span className='absolute inset-0 bg-gradient-to-r from-[var(--gradient-start)] to-[var(--gradient-end)] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-r-lg' />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Stats Cards */}
        <div className='flex-1 max-w-lg w-full h-full'>
          <div className='flex flex-row gap-2 sm:gap-3'>
            <StatCard
              value={maxApy}
              label={
                <>
                  Max <span className='block sm:inline' /> APY
                </>
              }
              decimalPlaces={2}
              suffix='%'
            />
            <StatCard
              value={totalTvl}
              label={
                <>
                  Total <span className='block sm:inline' /> TVL
                </>
              }
              isCurrency={true}
              prefix='$'
            />
            <StatCard
              value={totalBtcDerivatives}
              label={
                <>
                  BTC <span className='block sm:inline' /> LSTs
                </>
              }
            />
          </div>
        </div>
      </div>
    </section>
  )
}
