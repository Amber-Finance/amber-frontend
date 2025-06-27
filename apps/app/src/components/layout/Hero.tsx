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
      {/* Additional background effects */}
      <div className='absolute left-1/2 top-1/2 w-[240px] h-[240px] -translate-x-1/2 -translate-y-[55%] rounded-full bg-primary/5 blur-3xl -z-10' />

      <div className='relative max-w-3xl mx-auto px-3 sm:px-5 lg:px-6'>
        <div className='space-y-5'>
          <h1 className='text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[#f48a59] flex items-center justify-center'>
            <span style={{ display: 'inline-block' }}>
              <AuroraText colors={['#b1241e', '#FF6B35', '#f48a59', '#b1241e']}>Bit</AuroraText>
            </span>
            <svg
              height='60'
              viewBox='0 0 240 100'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
              style={{
                marginTop: '10px',
              }}
            >
              <defs>
                <linearGradient
                  id='spire-gradient'
                  x1='0'
                  y1='0'
                  x2='400'
                  y2='0'
                  gradientUnits='userSpaceOnUse'
                >
                  <stop stopColor='#b1241e' />
                  <stop offset='0.5' stopColor='#FF6B35' />
                  <stop offset='1' stopColor='#f57136' />
                </linearGradient>
              </defs>
              <text
                x='0'
                y='70'
                fontFamily="'Space Mono', monospace"
                fontWeight='bold'
                fontSize='80'
                fill='none'
                stroke='url(#spire-gradient)'
                strokeWidth='2'
              >
                Spire
              </text>
            </svg>
          </h1>

          <p className='mx-auto max-w-2xl text-sm text-muted-foreground leading-relaxed'>
            Bridge your liquid staking tokens and earn maximum yield. Deposit LSTs to earn both
            underlying staking rewards plus additional lending APY.
          </p>

          <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
            <div className='flex'>
              <div className='slanted-border p-[2px] inline-block bg-gradient-to-r from-[#b1241e] to-[#f57136]'>
                <button className='slanted-btn bg-gradient-to-r from-[#b1241e] to-[#f57136] text-white font-medium py-2 px-8 w-full h-full text-sm'>
                  Bridge
                </button>
              </div>
              <div className='slanted-border-2 p-[2px] inline-block bg-gradient-to-r from-[#b1241e] to-[#f57136]'>
                <button className='slanted-btn-2 bg-background text-white font-medium py-2 px-10 w-full h-full text-sm'>
                  Swap
                </button>
              </div>
            </div>
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
