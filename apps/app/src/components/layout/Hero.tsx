import { Button } from '@/components/ui/Button'
import { AuroraText } from '@/components/ui/AuroraText'
import { CountingNumber } from '@/components/ui/CountingNumber'
import { ArrowRight } from 'lucide-react'
import tokens from '@/config/tokens'

interface HeroProps {
  markets?: Array<{
    token: {
      symbol: string
      stakingApy: number
    }
    metrics: {
      totalApy: number
      collateralTotalUsd: number
    }
  }> | null
}

export default function Hero({ markets }: HeroProps) {
  // Calculate stats from market data
  const maxApy =
    markets && markets.length > 0 ? Math.max(...markets.map((m) => m.metrics.totalApy)) : 4.5

  const totalTvl =
    markets && markets.length > 0
      ? markets.reduce((sum, m) => sum + m.metrics.collateralTotalUsd, 0)
      : 0

  const totalMarkets = tokens.filter((token) => token.isLST).length

  // Format TVL for display
  const formatTvl = (usd: number) => {
    if (usd >= 1000000000) {
      const billions = usd / 1000000000
      return billions >= 10 ? billions.toFixed(1) : billions.toFixed(2)
    } else if (usd >= 1000000) {
      const millions = usd / 1000000
      return millions >= 10 ? millions.toFixed(1) : millions.toFixed(2)
    } else if (usd >= 1000) {
      const thousands = usd / 1000
      return thousands >= 10 ? thousands.toFixed(0) : thousands.toFixed(1)
    } else {
      return usd.toFixed(0)
    }
  }

  const getTvlUnit = (usd: number) => {
    if (usd >= 1000000000) return 'B'
    if (usd >= 1000000) return 'M'
    if (usd >= 1000) return 'K'
    return ''
  }

  return (
    <section className='relative w-full pt-16 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20 text-center'>
      {/* Background circle */}
      <div className='absolute left-1/2 top-1/2 w-[600px] h-[600px] lg:w-[800px] lg:h-[800px] -translate-x-1/2 -translate-y-[55%] rounded-full border border-border/20 -z-10 opacity-50' />

      {/* Additional background effects */}
      <div className='absolute left-1/2 top-1/2 w-[300px] h-[300px] -translate-x-1/2 -translate-y-[55%] rounded-full bg-primary/5 blur-3xl -z-10' />

      <div className='relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='space-y-6'>
          <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight'>
            Max <AuroraText colors={['#FF8C00', '#FF6B35', '#F7931E', '#FFA500']}>BTC</AuroraText>
          </h1>

          <p className='mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed'>
            Bridge your liquid staking tokens and earn maximum yield. Deposit LSTs to earn both
            underlying staking rewards plus additional lending APY.
          </p>

          <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
            <Button
              variant='default'
              size='lg'
              className='bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold px-8 py-3 h-12 group transition-all duration-200 hover:shadow-lg hover:shadow-primary/25'
            >
              <span className='flex items-center gap-2'>
                Bridge & Deposit
                <ArrowRight className='w-4 h-4 transition-transform group-hover:translate-x-0.5' />
              </span>
            </Button>

            <Button
              variant='outline'
              size='lg'
              className='h-12 px-8 py-3 font-semibold border-border/50 hover:border-border hover:bg-muted/50'
            >
              Learn More
            </Button>
          </div>

          {/* Stats Row */}
          <div className='pt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto'>
            <div className='text-center space-y-1'>
              <div className='text-2xl font-bold text-primary'>
                <CountingNumber value={maxApy} decimalPlaces={1} />%
              </div>
              <div className='text-sm text-muted-foreground'>Max APY</div>
            </div>
            <div className='text-center space-y-1'>
              <div className='text-2xl font-bold text-primary'>
                {totalTvl > 0 ? (
                  <>
                    $
                    <CountingNumber
                      value={parseFloat(formatTvl(totalTvl))}
                      decimalPlaces={totalTvl >= 10000000 ? 1 : 2}
                    />
                    {getTvlUnit(totalTvl)}
                  </>
                ) : (
                  '$0'
                )}
              </div>
              <div className='text-sm text-muted-foreground'>Total TVL</div>
            </div>
            <div className='text-center space-y-1'>
              <div className='text-2xl font-bold text-primary'>
                <CountingNumber value={totalMarkets} />
              </div>
              <div className='text-sm text-muted-foreground'>Markets</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
