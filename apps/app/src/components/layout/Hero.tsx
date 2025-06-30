import { AuroraText } from '@/components/ui/AuroraText'
import { CountingNumber } from '@/components/ui/CountingNumber'
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
  const maxApy =
    markets && markets.length > 0 ? Math.max(...markets.map((m) => m.metrics.totalApy)) : 4.5

  const totalTvl =
    markets && markets.length > 0
      ? markets.reduce((sum, m) => sum + m.metrics.collateralTotalUsd, 0)
      : 0

  const totalBtcDerivatives = tokens.filter((token) => token.isLST).length

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
    <section className='relative w-full py-10 sm:py-20 overflow-hidden px-4 sm:px-8'>
      <div className='flex flex-col lg:flex-row items-start lg:items-end gap-8 lg:gap-12'>
        {/* Left Column - Main Content */}
        <div className='flex-1 flex flex-col justify-between gap-6'>
          <div className='space-y-3'>
            <h1 className='text-2xl sm:text-3xl lg:text-5xl font-bold leading-tight'>
              <span className='block text-foreground'>Liquid Staking.</span>
              <span className='block'>
                <AuroraText colors={['#b1241e', '#FF6B35', '#f48a59', '#b1241e']}>
                  Solid Yield.
                </AuroraText>
              </span>
            </h1>

            <p className='text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg'>
              Bridge your liquid staking tokens and earn maximum yield. Deposit LSTs to earn both
              underlying staking rewards plus additional lending APY.
            </p>
          </div>

          <div className='flex'>
            <div className='slanted-border p-[2px] inline-block bg-gradient-to-r from-[#b1241e] to-[#f57136] rounded-l-lg group'>
              <button className='slanted-btn bg-gradient-to-r from-[#b1241e] to-[#f57136] text-foreground font-medium py-2 px-8 w-full h-full text-sm rounded-l-lg relative overflow-hidden'>
                <span className='relative z-10'>Bridge Now</span>
                <span className='absolute inset-0 bg-gradient-to-r from-[#f57136] to-[#b1241e] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-l-lg' />
              </button>
            </div>
            <div className='slanted-border-2 p-[2px] inline-block bg-gradient-to-r from-[#b1241e] to-[#f57136] rounded-r-lg group'>
              <button className='slanted-btn-2 bg-background text-foreground font-medium py-2 px-8 w-full h-full text-sm rounded-r-lg relative overflow-hidden'>
                <span className='relative z-10'>Learn More</span>
                <span className='absolute inset-0 bg-gradient-to-r from-[#b1241e] to-[#f57136] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-r-lg' />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Stats Cards */}
        <div className='flex-1 max-w-lg w-full h-full'>
          <div className='flex flex-row gap-2 sm:gap-3'>
            {/* Max APY Card */}
            <div className='flex-1 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-2 sm:p-4 text-center hover:bg-card/70 transition-all duration-300 group'>
              <div className='space-y-1'>
                <div className='text-base sm:text-lg lg:text-2xl font-bold text-primary group-hover:scale-110 transition-transform duration-300'>
                  <CountingNumber value={maxApy} decimalPlaces={1} />%
                </div>
                <div className='text-[10px] sm:text-sm text-muted-foreground font-medium'>
                  Max <span className='block sm:inline' />
                  APY
                </div>
              </div>
              <div className='mt-1 sm:mt-2 w-full h-1 bg-gradient-to-r from-gradient-start to-gradient-end rounded-full opacity-60' />
            </div>

            {/* Total TVL Card */}
            <div className='flex-1 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-2 sm:p-4 text-center hover:bg-card/70 transition-all duration-300 group'>
              <div className='space-y-1'>
                <div className='text-base sm:text-lg lg:text-2xl font-bold text-primary group-hover:scale-110 transition-transform duration-300'>
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
                <div className='text-[10px] sm:text-sm text-muted-foreground font-medium'>
                  Total <span className='block sm:inline' />
                  TVL
                </div>
              </div>
              <div className='mt-1 sm:mt-2 w-full h-1 bg-gradient-to-r from-gradient-start to-gradient-end rounded-full opacity-60' />
            </div>

            {/* BTC Derivatives Card */}
            <div className='flex-1 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-2 sm:p-4 text-center hover:bg-card/70 transition-all duration-300 group'>
              <div className='space-y-1'>
                <div className='text-base sm:text-lg lg:text-2xl font-bold text-primary group-hover:scale-110 transition-transform duration-300'>
                  <CountingNumber value={totalBtcDerivatives} />
                </div>
                <div className='text-[10px] sm:text-sm text-muted-foreground font-medium'>
                  BTC <span className='block sm:inline' />
                  Derivatives
                </div>
              </div>
              <div className='mt-1 sm:mt-2 w-full h-1 bg-gradient-to-r from-gradient-start to-gradient-end rounded-full opacity-60' />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
