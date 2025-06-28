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
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'

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
  const router = useRouter()

  const formatBalance = (balance: number) => (balance > 0 ? balance.toFixed(6) : '0.000000')
  const formatUsd = (usd: number) => (usd > 0 ? `$${usd.toFixed(2)}` : '$0.00')

  const handleDepositClick = () => {
    router.push(`/deposit?token=${token.symbol}`)
  }

  const cardStyle = {
    '--brand-color': token.brandColor,
    '--brand-color-10': `${token.brandColor}1A`,
    '--brand-color-20': `${token.brandColor}33`,
    '--brand-color-30': `${token.brandColor}4D`,
  } as React.CSSProperties

  return (
    <Card
      className='group relative w-[340px] transition-all duration-300 hover:shadow-xl bg-card backdrop-blur-sm border overflow-hidden'
      style={cardStyle}
    >
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

      <CardHeader className='relative pb-3 z-20'>
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-2'>
            {/* Token Icon with brand color glow effect */}
            <div className='relative flex-shrink-0'>
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

            <div className='min-w-0 flex-1 max-w-[120px]'>
              <CardTitle className='text-base font-semibold text-card-foreground truncate'>
                {token.symbol}
              </CardTitle>
              <CardDescription className='text-xs text-muted-foreground/90 font-medium h-8 overflow-hidden leading-tight'>
                <div
                  className='overflow-hidden'
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical' as const,
                  }}
                >
                  {token.protocol}
                </div>
              </CardDescription>
            </div>
          </div>

          <div className='flex flex-col items-end justify-start flex-shrink-0 ml-2 min-w-[80px]'>
            {/* Total APY - Clean display in header */}
            <div className='text-right'>
              <div className='text-xl font-bold leading-tight' style={{ color: token.brandColor }}>
                <CountingNumber value={metrics.totalApy} decimalPlaces={2} />%
              </div>
              <div className='text-xs text-muted-foreground/80 font-medium leading-tight whitespace-nowrap'>
                Total APY
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className='relative space-y-5 z-20'>
        {/* Yield Breakdown Section */}
        <div className='space-y-3'>
          <div className='space-y-2'>
            {/* <div className='flex justify-between items-center'>
              <div className='flex items-center gap-2 pt-2'>
                <Zap
                  className='w-3 h-3 flex-shrink-0'
                  style={{ color: `${token.brandColor}CC` }} // 80% opacity
                />
                <span className='text-xs text-muted-foreground/90'>Total APY</span>
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
            </div> */}
            <div className='flex justify-between items-center'>
              <div className='flex items-center gap-2'>
                <Zap
                  className='w-3 h-3 flex-shrink-0'
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
                  className='w-3 h-3 flex-shrink-0'
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

        {/* Progress Bars Section */}
        <div className='space-y-5'>
          <div className='flex items-center gap-2 text-muted-foreground/90'>
            <TrendingUp className='w-3.5 h-3.5' />
            <span className='text-xs font-semibold'>Yield Breakdown</span>
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='flex flex-col items-center space-y-2'>
              <AnimatedCircularProgressBar
                max={50}
                min={0}
                value={token.stakingApy}
                gaugePrimaryColor={token.brandColor}
                gaugeSecondaryColor={`${token.brandColor}20`}
                className='size-16 text-xs'
              />
              <div className='text-center'>
                <div className='text-xs font-medium text-card-foreground'>Staking APY</div>
              </div>
            </div>

            <div className='flex flex-col items-center space-y-2'>
              <AnimatedCircularProgressBar
                max={50}
                min={0}
                value={metrics.lendingApy}
                gaugePrimaryColor={token.brandColor}
                gaugeSecondaryColor={`${token.brandColor}20`}
                className='size-16 text-xs'
              />
              <div className='text-center'>
                <div className='text-xs font-medium text-card-foreground'>Protocol APY</div>
              </div>
            </div>
          </div>
        </div>

        <Separator className='bg-border/60' />

        {/* Wallet Balance Section - Moved to bottom */}
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2 text-muted-foreground/90'>
              <Wallet className='w-3.5 h-3.5' />
              <span className='text-xs font-medium'>Wallet</span>
            </div>
            <div className='text-right'>
              <div className='text-card-foreground font-semibold text-xs'>
                {formatBalance(metrics.balance)} {token.symbol}
              </div>
              <div className='text-xs text-muted-foreground/80'>{formatUsd(metrics.valueUsd)}</div>
            </div>
          </div>

          {/* Deposited Amount */}
          {metrics.deposited > 0 && (
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2 text-muted-foreground/90'>
                <Coins className='w-3.5 h-3.5' />
                <span className='text-xs font-medium'>Deposited</span>
              </div>
              <div className='text-right'>
                <div className='text-card-foreground font-semibold text-xs'>
                  {formatBalance(metrics.deposited)} {token.symbol}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className='relative pt-3 z-20 w-full'>
        <Button variant='outline-gradient' className='w-full' onClick={handleDepositClick}>
          Deposit
        </Button>
      </CardFooter>
    </Card>
  )
}
