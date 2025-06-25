import { Button } from '@/components/ui/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CountingNumber } from '@/components/ui/CountingNumber'
import { FlickeringGrid } from '@/components/ui/FlickeringGrid'
import { AnimatedCircularProgressBar } from '@/components/ui/AnimatedCircularProgress'
import { Coins, Percent, TrendingUp, Wallet, Zap } from 'lucide-react'
import Image from 'next/image'

interface DepositCardProps {
  token: {
    symbol: string
    icon: string
    description: string
    protocol: string
    isLST: boolean
    stakingApy: number
    brandColor: string
  }
  metrics: {
    lendingApy: number
    totalApy: number
    balance: number
    deposited: number
    valueUsd: number
    utilizationRate: number
    depositCapUsage: number
    optimalUtilizationRate: number
    collateralTotalUsd: number
    depositCapUsd: number
  }
}

export default function DepositCard({ token, metrics }: DepositCardProps) {
  const formatBalance = (balance: number) => (balance > 0 ? balance.toFixed(6) : '0.000000')
  const formatUsd = (usd: number) => (usd > 0 ? `$${usd.toFixed(2)}` : '$0.00')
  const formatUsdK = (usd: number) => {
    if (usd >= 1000000000) {
      // Billions
      const billions = usd / 1000000000
      return billions >= 10 ? `$${billions.toFixed(1)}B` : `$${billions.toFixed(2)}B`
    } else if (usd >= 1000000) {
      // Millions
      const millions = usd / 1000000
      return millions >= 10 ? `$${millions.toFixed(1)}M` : `$${millions.toFixed(2)}M`
    } else if (usd >= 1000) {
      // Thousands
      const thousands = usd / 1000
      return thousands >= 10 ? `$${thousands.toFixed(0)}K` : `$${thousands.toFixed(1)}K`
    } else {
      // Less than 1000 - show with commas if needed
      return usd >= 100 ? `$${Math.round(usd).toLocaleString()}` : `$${usd.toFixed(2)}`
    }
  }

  // Create dynamic styles using the token's brand color
  const cardStyle = {
    '--brand-color': token.brandColor,
    '--brand-color-10': `${token.brandColor}1A`, // 10% opacity
    '--brand-color-20': `${token.brandColor}33`, // 20% opacity
    '--brand-color-30': `${token.brandColor}4D`, // 30% opacity
  } as React.CSSProperties

  return (
    <Card
      className='group relative w-[340px] transition-all duration-300 hover:shadow-xl bg-card backdrop-blur-sm border overflow-hidden'
      style={cardStyle}
    >
      {/* FlickeringGrid background with gradient opacity */}
      <FlickeringGrid
        className='absolute inset-0 z-0'
        color={token.brandColor}
        squareSize={8}
        gridGap={2}
        flickerChance={0.2}
        maxOpacity={0.5}
        gradientDirection='top-to-bottom'
        width={340}
        height={100}
      />

      {/* Enhanced gradient overlay for depth using brand color */}
      <div
        className='absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10'
        style={{
          background: `linear-gradient(135deg, ${token.brandColor}08 0%, transparent 50%, transparent 100%)`,
        }}
      />

      <CardHeader className='relative pb-4 space-y-3 z-20'>
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-3'>
            {/* Token Icon with brand color glow effect */}
            <div className='relative'>
              <div
                className='absolute inset-0 rounded-full blur-md scale-110 opacity-0 group-hover:opacity-100 transition-all duration-300'
                style={{
                  backgroundColor: `${token.brandColor}40`, // 25% opacity
                }}
              />
              <div className='relative w-12 h-12 rounded-full overflow-hidden bg-secondary/80 border border-border/60 p-1.5 shadow-sm'>
                <Image
                  src={token.icon}
                  alt={token.symbol}
                  fill
                  className='object-contain'
                  sizes='48px'
                />
              </div>
            </div>

            <div className='space-y-1'>
              <CardTitle className='text-lg font-semibold text-card-foreground flex items-center gap-2'>
                {token.symbol}
              </CardTitle>
              <CardDescription className='text-xs text-muted-foreground/90 font-medium'>
                {token.protocol}
              </CardDescription>
            </div>
          </div>

          <div className='flex flex-col items-end gap-2'>
            {/* Total APY - Clean display in header */}
            <div className='text-right'>
              <div className='text-2xl font-bold' style={{ color: token.brandColor }}>
                <CountingNumber value={metrics.totalApy} decimalPlaces={2} />%
              </div>
              <div className='text-xs text-muted-foreground/80 font-medium'>Total APY</div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className='relative space-y-5 z-20'>
        {/* Yield Breakdown Section */}
        <div className='space-y-4'>
          {/* <div className='flex items-center gap-2 text-muted-foreground/90'>
            <TrendingUp className='w-4 h-4' />
            <span className='text-sm font-semibold'>Yield Breakdown</span>
          </div> */}

          <div className='space-y-3'>
            {/* Staking APY for LSTs - Always show for consistent layout */}
            <div className='flex justify-between items-center'>
              <div className='flex items-center gap-2'>
                <Zap
                  className='w-3.5 h-3.5'
                  style={{ color: `${token.brandColor}CC` }} // 80% opacity
                />
                <span className='text-sm text-muted-foreground/90'>Staking APY</span>
              </div>
              <span className='text-sm font-semibold text-card-foreground'>
                {token.stakingApy > 0 ? (
                  <span>
                    <CountingNumber value={token.stakingApy} decimalPlaces={2} />%
                  </span>
                ) : (
                  <span className='text-muted-foreground/90'>N/A</span>
                )}
              </span>
            </div>

            {/* Lending APY */}
            <div className='flex justify-between items-center'>
              <div className='flex items-center gap-2'>
                <Percent
                  className='w-3.5 h-3.5'
                  style={{ color: `${token.brandColor}CC` }} // 80% opacity
                />
                <span className='text-sm text-muted-foreground/90'>Lending APY</span>
              </div>
              <span className='text-sm font-semibold text-card-foreground'>
                <CountingNumber value={metrics.lendingApy} decimalPlaces={2} />%
              </span>
            </div>
          </div>
        </div>

        <Separator className='bg-border/60' />

        {/* Progress Bars Section */}
        <div className='space-y-4'>
          <div className='flex items-center gap-2 text-muted-foreground/90'>
            <TrendingUp className='w-4 h-4' />
            <span className='text-sm font-semibold'>Market Metrics</span>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            {/* Utilization Rate Progress */}
            <div className='flex flex-col items-center space-y-2'>
              <AnimatedCircularProgressBar
                max={100}
                min={0}
                value={metrics.utilizationRate}
                gaugePrimaryColor={token.brandColor}
                gaugeSecondaryColor={`${token.brandColor}20`}
                className='size-20 text-xs'
              />
              <div className='text-center'>
                <div className='text-xs font-medium text-card-foreground'>Utilization</div>
                <div className='text-xs text-muted-foreground/80'>
                  Optimal:{' '}
                  <CountingNumber value={metrics.optimalUtilizationRate} decimalPlaces={1} />%
                </div>
              </div>
            </div>

            {/* Deposit Cap Usage Progress */}
            <div className='flex flex-col items-center space-y-2'>
              <AnimatedCircularProgressBar
                max={100}
                min={0}
                value={metrics.depositCapUsage}
                gaugePrimaryColor={token.brandColor}
                gaugeSecondaryColor={`${token.brandColor}20`}
                className='size-20 text-xs'
              />
              <div className='text-center'>
                <div className='text-xs font-medium text-card-foreground'>Deposit Cap</div>
                <div className='text-xs text-muted-foreground/80'>
                  {formatUsdK(metrics.collateralTotalUsd)} / {formatUsdK(metrics.depositCapUsd)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className='bg-border/60' />

        {/* Wallet Balance Section - Moved to bottom */}
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2 text-muted-foreground/90'>
              <Wallet className='w-4 h-4' />
              <span className='text-sm font-medium'>Wallet</span>
            </div>
            <div className='text-right'>
              <div className='text-card-foreground font-semibold text-sm'>
                {formatBalance(metrics.balance)} {token.symbol}
              </div>
              <div className='text-xs text-muted-foreground/80'>{formatUsd(metrics.valueUsd)}</div>
            </div>
          </div>

          {/* Deposited Amount */}
          {metrics.deposited > 0 && (
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2 text-muted-foreground/90'>
                <Coins className='w-4 h-4' />
                <span className='text-sm font-medium'>Deposited</span>
              </div>
              <div className='text-right'>
                <div className='text-card-foreground font-semibold text-sm'>
                  {formatBalance(metrics.deposited)} {token.symbol}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className='relative pt-4 z-20'>
        <Button
          className='w-full h-11 font-semibold transition-all duration-200 group shadow-sm'
          size='default'
        >
          <span className='flex items-center gap-2'>Bridge & Deposit</span>
        </Button>
      </CardFooter>
    </Card>
  )
}
