import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { Flame, Info, TrendingUp, Wallet, Zap } from 'lucide-react'

import { useTheme } from '@/components/providers/ThemeProvider'
import { Button } from '@/components/ui/Button'
import { CountingNumber } from '@/components/ui/CountingNumber'
import { FlickeringGrid } from '@/components/ui/FlickeringGrid'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface DepositCardProps {
  token: {
    symbol: string
    icon: string
    description: string
    protocol: string
    isLST: boolean
    brandColor: string
    protocolIconLight?: string
    protocolIconDark?: string
  }
  metrics: {
    lendingApy: number
    stakingApy: number
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
  const { theme } = useTheme()

  const formatBalance = (balance: number) => (balance > 0 ? balance.toFixed(6) : '0.000000')
  const formatUsd = (usd: number) => (usd > 0 ? `$${usd.toFixed(2)}` : '$0.00')

  // Get protocol icon based on theme
  const getProtocolIcon = () => {
    if (!token.protocolIconLight || !token.protocolIconDark) return null
    // For tokens with the same icon for both themes (like pump.svg, eBTC.png), just return the light version
    if (token.protocolIconLight === token.protocolIconDark) return token.protocolIconLight
    return theme === 'dark' ? token.protocolIconDark : token.protocolIconLight
  }

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
        height={120}
      />

      {/* Enhanced gradient overlay for depth using brand color */}
      <div
        className='absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10'
        style={{
          background: `linear-gradient(135deg, ${token.brandColor}08 0%, transparent 50%, transparent 100%)`,
        }}
      />

      <CardHeader className='pb-4 z-20 space-y-3'>
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-2'>
            <div className='relative'>
              {/* gradient aroudn token icon*/}
              <div
                className='absolute inset-0 rounded-full blur-md scale-110 opacity-0 group-hover:opacity-100 transition-all duration-300'
                style={{
                  backgroundColor: `${token.brandColor}50`,
                }}
              />
              <div
                className='relative w-10 h-10 rounded-full overflow-hidden bg-secondary/80 border-2 p-1 shadow-sm'
                style={{ borderColor: `${token.brandColor}40` }}
              >
                <Image
                  src={token.icon}
                  alt={token.symbol}
                  fill
                  className='object-contain'
                  sizes='40px'
                />
              </div>

              {/* Protocol Icon Badge */}
              {getProtocolIcon() && (
                <div className='absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-background border-2 border-border/80 p-1 shadow-md ring-1 ring-black/5'>
                  <Image
                    src={getProtocolIcon()!}
                    alt={`${token.protocol} logo`}
                    width={16}
                    height={16}
                    className='object-contain w-full h-full'
                    unoptimized={true}
                  />
                </div>
              )}
            </div>

            <div className='flex flex-col gap-1'>
              <CardTitle className='text-xl font-bold text-foreground'>{token.symbol}</CardTitle>
              <CardDescription className='text-sm text-muted-foreground/90 font-medium leading-tight'>
                {token.protocol}
              </CardDescription>
            </div>
          </div>

          <div className='flex flex-col items-end'>
            <div className='text-2xl font-bold leading-tight' style={{ color: token.brandColor }}>
              <CountingNumber value={metrics.totalApy} decimalPlaces={2} />%
            </div>
            <div className='text-sm text-muted-foreground/70 font-semibold leading-tight whitespace-nowrap uppercase tracking-wide'>
              Total APY
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className='relative space-y-6 z-20'>
        {/* Yields Section */}
        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            <TrendingUp className='w-4 h-4' style={{ color: token.brandColor }} />
            <span className='text-sm font-bold tracking-wide' style={{ color: token.brandColor }}>
              Yield Breakdown
            </span>
          </div>

          <div className='space-y-2'>
            <div className='flex justify-between items-center'>
              <div className='flex items-center gap-2'>
                {getProtocolIcon() ? (
                  <div className='w-4 h-4 flex-shrink-0 flex items-center justify-center'>
                    <Image
                      src={getProtocolIcon()!}
                      alt={`${token.protocol} logo`}
                      width={16}
                      height={16}
                      className='object-contain w-full h-full'
                      unoptimized={true}
                    />
                  </div>
                ) : (
                  <Zap
                    className='w-3 h-3 flex-shrink-0'
                    style={{ color: `${token.brandColor}CC` }} // 80% opacity
                  />
                )}
                <span className='text-sm text-muted-foreground/90'>{token.protocol}</span>
              </div>
              <div className='flex items-center gap-1'>
                {metrics.stakingApy > 0 ? (
                  <span className='text-base font-bold' style={{ color: token.brandColor }}>
                    <CountingNumber value={metrics.stakingApy} decimalPlaces={2} />%
                  </span>
                ) : (
                  <>
                    <span className='text-base font-bold text-muted-foreground/60'>N/A</span>
                    <div className='relative group/tooltip'>
                      <Info className='w-3 h-3 text-muted-foreground/40 hover:text-muted-foreground/60 cursor-help transition-colors' />
                      <div className='absolute bottom-full right-0 mb-2 w-64 p-2 bg-background border border-border rounded-md shadow-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none z-50'>
                        <p className='text-xs text-muted-foreground'>
                          <span className='font-semibold text-foreground'>
                            No underlying yield available.
                          </span>
                          <br />
                          This LST doesn&apos;t generate any yield.
                        </p>
                        <div className='absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-border'></div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className='flex justify-between items-center'>
              <div className='flex items-center gap-2'>
                <Flame
                  className='w-3 h-3 flex-shrink-0'
                  style={{ color: `${token.brandColor}CC` }} // 80% opacity
                />
                <span className='text-sm text-muted-foreground/90'>Amber Finance</span>
              </div>
              <span className='text-base font-bold' style={{ color: token.brandColor }}>
                <CountingNumber value={metrics.lendingApy} decimalPlaces={2} />%
              </span>
            </div>
          </div>
        </div>

        <Separator className='bg-border/60' />

        {/* Wallet Balance Section */}
        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            <Wallet className='w-4 h-4' style={{ color: token.brandColor }} />
            <span className='text-sm font-bold tracking-wide' style={{ color: token.brandColor }}>
              Wallet Balance
            </span>
          </div>

          <div className='space-y-2'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground/90'>Available</span>
              <div className='text-right'>
                <div className='text-base font-bold text-foreground'>
                  {formatBalance(metrics.balance)} {token.symbol}
                </div>
                {metrics.valueUsd > 0 && (
                  <div className='text-xs text-muted-foreground'>{formatUsd(metrics.valueUsd)}</div>
                )}
              </div>
            </div>

            {metrics.deposited > 0 && (
              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground/90'>Deposited</span>
                <div className='text-base font-bold text-foreground'>
                  {formatBalance(metrics.deposited)} {token.symbol}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className='relative z-20 pt-2'>
        <Button
          onClick={handleDepositClick}
          variant='default'
          gradientColor={token.brandColor}
          className='w-full'
        >
          Deposit {token.symbol}
        </Button>
      </CardFooter>
    </Card>
  )
}
