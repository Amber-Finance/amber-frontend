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
import { Coins, Percent, Wallet, Zap, Landmark } from 'lucide-react'
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

  const cardStyle = {
    '--brand-color': token.brandColor,
    '--brand-color-10': `${token.brandColor}1A`, 
    '--brand-color-20': `${token.brandColor}33`, 
    '--brand-color-30': `${token.brandColor}4D`, 
  } as React.CSSProperties

  return (
    <Card
      className='group relative w-[272px] transition-all duration-300 hover:shadow-xl bg-card/75 backdrop-blur-sm border overflow-hidden'
      style={cardStyle}
    >
      <FlickeringGrid
        className='absolute inset-0 z-0'
        color={token.brandColor}
        squareSize={6}
        gridGap={2}
        flickerChance={0.2}
        maxOpacity={0.5}
        gradientDirection='top-to-bottom'
        width={272}
        height={80}
      />

      <div
        className='absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10'
        style={{
          background: `linear-gradient(135deg, ${token.brandColor}08 0%, transparent 50%, transparent 100%)`,
        }}
      />
      <div className='flex flex-col justify-between gap-4 h-full'>

      <CardHeader className='relative pb-3 space-y-2 z-20'>
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-2'>
            {/* Token Icon with brand color glow effect */}
            <div className='relative'>
              <div
                className='absolute inset-0 rounded-full blur-md scale-110 opacity-0 group-hover:opacity-100 transition-all duration-300'
                style={{
                  backgroundColor: `${token.brandColor}40`, // 25% opacity
                }}
              />
              <div className='relative w-10 h-10 rounded-full overflow-hidden bg-secondary/80 border border-border/60 p-1 shadow-sm'>
                <Image
                  src={token.icon}
                  alt={token.symbol}
                  fill
                  className='object-contain'
                  sizes='40px'
                />
              </div>
            </div>

            <div className='space-y-0.5'>
              <CardTitle className='text-base font-semibold text-card-foreground flex items-center gap-2'>
                {token.symbol}
              </CardTitle>
              <CardDescription className='text-xs text-muted-foreground/90 font-medium'>
                {token.protocol}
              </CardDescription>
            </div>
          </div>

          <div className='flex flex-col items-end gap-1'>
            {/* Total APY - Clean display in header */}
            <div className='text-right'>
              <div className='text-xl font-bold' style={{ color: token.brandColor }}>
                <CountingNumber value={metrics.totalApy} decimalPlaces={2} />%
              </div>
              <div className='text-xs text-muted-foreground/80 font-medium'>Total APY</div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className='relative space-y-4 z-20'>
        {/* Yield Breakdown Section */}
        <div className='space-y-3'>
          <div className='space-y-2'>
            {/* Staking APY for LSTs - Always show for consistent layout */}
            <div className='flex justify-between items-center'>
              <div className='flex items-center gap-2'>
                <Zap
                  className='w-3 h-3'
                  style={{ color: `${token.brandColor}CC` }} // 80% opacity
                />
                <span className='text-xs text-muted-foreground/90'>Staking APY</span>
              </div>
              <span className='text-xs font-semibold text-card-foreground'>
                {token.stakingApy > 0 ? (
                  <span>
                    <CountingNumber value={token.stakingApy} decimalPlaces={2} />%
                  </span>
                ) : (
                  <span className='text-muted-foreground/90'>N/A</span>
                )}
              </span>
            </div>

            {/* Protocol APY */}
            <div className='flex justify-between items-center'>
              <div className='flex items-center gap-2'>
                <Percent
                  className='w-3 h-3'
                  style={{ color: `${token.brandColor}CC` }} // 80% opacity
                />
                <span className='text-xs text-muted-foreground/90'>Protocol APY</span>
              </div>
              <span className='text-xs font-semibold text-card-foreground'>
                <CountingNumber value={metrics.lendingApy} decimalPlaces={2} />%
              </span>
            </div>
          </div>
        </div>

        <Separator className='bg-border/60' />

        {/* Wallet Balance Section - Better Layout */}
        <div className='space-y-3'>
          {/* Wallet Balance Section */}
          <div className='flex flex-col space-y-2 gap-2'>
            <div className='flex items-center gap-2 text-muted-foreground/90'>
              <Wallet className='w-3 h-3' />
              <span className='text-xs font-medium'>Wallet Balance</span>
            </div>
            <div className='flex items-center justify-between'>
              <div className='text-card-foreground font-semibold text-xs'>
                {formatBalance(metrics.balance)} {token.symbol}
              </div>
              <div className='text-xs text-muted-foreground/80'>{formatUsd(metrics.valueUsd)}</div>
            </div>
          </div>

          {/* Deposited Section - Only show if there's a deposit */}
          {metrics.deposited > 0 && (
            <div className='space-y-2'>
              <div className='flex items-center gap-2 text-muted-foreground/90'>
                <Coins className='w-3 h-3' />
                <span className='text-xs font-medium'>Deposited</span>
              </div>
              <div className='text-card-foreground font-semibold text-xs'>
                {formatBalance(metrics.deposited)} {token.symbol}
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className='relative pt-3 z-20 space-y-2'>
        <div className='flex gap-2 w-full'>
          <Button
            className='flex-1 h-9 font-semibold transition-all duration-200 group shadow-sm bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground text-xs'
          >
            <span className='flex items-center gap-1.5'>
              <Landmark className='w-3 h-3' />
              Bridge
            </span>
          </Button>
          <Button
            className='flex-1 h-9 font-semibold transition-all duration-200 group shadow-sm border border-border/50 hover:border-border hover:bg-muted/50 bg-background text-xs'
          >
            <span className='flex items-center gap-1.5 text-card-foreground'>
              <Coins className='w-3 h-3' />
              Deposit
            </span>
          </Button>
        </div>
      </CardFooter>
      </div>
    </Card>
  )
}
