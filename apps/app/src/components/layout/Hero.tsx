import { Button } from '@/components/ui/Button'
import { AuroraText } from '@/components/ui/AuroraText'
import { CountingNumber } from '@/components/ui/CountingNumber'
import { ArrowRight, Landmark, Coins } from 'lucide-react'
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

  const totalBtcDerivatives = tokens.filter((token) => token.isLST).length

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
    <section className='relative w-full pt-20 pb-8 sm:pt-24 sm:pb-12 lg:pt-28 lg:pb-16 text-center'>
      {/* Background circle */}
      <div className='absolute left-1/2 top-1/2 w-[480px] h-[480px] lg:w-[640px] lg:h-[640px] -translate-x-1/2 -translate-y-[55%] rounded-full border border-border/20 -z-10 opacity-50' />

      {/* Additional background effects */}
      <div className='absolute left-1/2 top-1/2 w-[240px] h-[240px] -translate-x-1/2 -translate-y-[55%] rounded-full bg-primary/5 blur-3xl -z-10' />

      <div className='relative max-w-3xl mx-auto px-3 sm:px-5 lg:px-6'>
        <div className='space-y-5'>
          <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight'>
            Max <AuroraText colors={['#FF8C00', '#FF6B35', '#F7931E', '#FFA500']}>BTC</AuroraText>
          </h1>

          <p className='mx-auto max-w-xl text-sm sm:text-base text-muted-foreground leading-relaxed'>
            Bridge your liquid staking tokens and enter yield farming strategies. Earn both
            underlying staking rewards plus additional protocol yields.
          </p>

          <div className='flex flex-col sm:flex-row gap-3 justify-center items-center'>
            <Button className='bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold px-6 py-2 h-10 group transition-all duration-200 hover:shadow-lg hover:shadow-primary/25'>
              <span className='flex items-center gap-2'>
                <Landmark className='w-3.5 h-3.5' />
                Bridge
                <ArrowRight className='w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5' />
              </span>
            </Button>

            <Button className='h-10 px-6 py-2 font-semibold border border-border/50 hover:border-border hover:bg-muted/50 bg-background'>
              <span className='flex items-center gap-2 text-card-foreground'>
                <Coins className='w-3.5 h-3.5' />
                Deposit
              </span>
            </Button>
          </div>

          {/* Stats Row */}
          <div className='pt-5 grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-xl mx-auto'>
            <div className='text-center space-y-1'>
              <div className='text-xl font-bold text-primary'>
                <CountingNumber value={maxApy} decimalPlaces={1} />%
              </div>
              <div className='text-xs text-muted-foreground'>Max APY</div>
            </div>
            <div className='text-center space-y-1'>
              <div className='text-xl font-bold text-primary'>
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
              <div className='text-xs text-muted-foreground'>Total TVL</div>
            </div>
            <div className='text-center space-y-1'>
              <div className='text-xl font-bold text-primary'>
                <CountingNumber value={totalBtcDerivatives} />
              </div>
              <div className='text-xs text-muted-foreground'>BTC Derivatives</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
