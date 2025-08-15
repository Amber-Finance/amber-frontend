import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { ArrowDownToLine, Info, Zap } from 'lucide-react'

import { useTheme } from '@/components/providers/ThemeProvider'
import { Button } from '@/components/ui/Button'
import { CountingNumber } from '@/components/ui/CountingNumber'
import { FlickeringGrid } from '@/components/ui/FlickeringGrid'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
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

  const formatBalance = (balance: number) => (balance > 0 ? balance.toFixed(8) : '0.00000000')

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

  const handleWithdrawClick = () => {
    router.push(`/deposit?token=${token.symbol}&action=withdraw`)
  }

  const cardStyle = {
    '--brand-color': token.brandColor,
    '--brand-color-10': `${token.brandColor}1A`,
    '--brand-color-20': `${token.brandColor}33`,
    '--brand-color-30': `${token.brandColor}4D`,
  } as React.CSSProperties

  return (
    <Card
      className='group relative w-[340px] transition-all duration-300 hover:shadow-xl bg-card backdrop-blur-sm border'
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

            <div className='flex flex-col'>
              <CardTitle className='text-xl font-funnel text-foreground'>{token.symbol}</CardTitle>
              <CardDescription className='text-sm text-muted-foreground/90 font-medium leading-tight tracking-widest'>
                {token.protocol}
              </CardDescription>
            </div>
          </div>

          <div className='flex flex-col items-end'>
            <div className='text-2xl font-bold leading-tight' style={{ color: token.brandColor }}>
              <CountingNumber value={metrics.totalApy} decimalPlaces={2} />%
            </div>
            <div className='flex items-center gap-1'>
              <div className='text-sm font-bold text-muted-foreground/70 leading-tight whitespace-nowrap uppercase tracking-wider'>
                Total APY
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className='w-3 h-3 text-muted-foreground/40 hover:text-muted-foreground/60 cursor-help transition-colors' />
                </TooltipTrigger>
                <TooltipContent>
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm font-bold text-foreground'>Points Campaign</span>
                    </div>
                    <div className='text-xs text-muted-foreground space-y-1'>
                      <p>• Mars Fragments</p>
                      <p>• Neutron Quarks: ~2% of total APY</p>
                      <p>• Base yield: ~0.5% of total APY</p>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className='relative space-y-6 z-20'>
        {/* Yields Section */}
        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            {/* <TrendingUp className='w-4 h-4' style={{ color: token.brandColor }} /> */}
            <span className='text-sm font-bold tracking-wider uppercase text-foreground/70'>
              Yield
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
                <span className='text-sm'>Yield in {token.symbol}</span>
              </div>
              <div className='flex items-center gap-1'>
                {metrics.stakingApy > 0 ? (
                  <span className='text-base font-bold' style={{ color: token.brandColor }}>
                    <CountingNumber value={metrics.stakingApy} decimalPlaces={2} />%
                  </span>
                ) : (
                  <>
                    <span className='text-base font-bold text-muted-foreground/60'>N/A</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className='w-3 h-3 text-muted-foreground/40 hover:text-muted-foreground/60 cursor-help transition-colors' />
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className='space-y-2'>
                          <div className='flex items-center gap-2'>
                            <span className='text-sm font-bold text-foreground'>
                              No underlying yield available.
                            </span>
                          </div>
                          <div className='text-xs text-muted-foreground'>
                            <p>This LST doesn&apos;t generate any yield.</p>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Points Section */}
        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            {/* <Flame
              className='w-3 h-3 flex-shrink-0'
              style={{ color: `${token.brandColor}CC` }} // 80% opacity
            /> */}
            <span className='text-sm font-bold tracking-wider uppercase text-foreground/70'>
              Points
            </span>
          </div>

          <div className='space-y-2'>
            <div className='flex justify-between items-center'>
              <div className='flex items-center gap-2'>
                <Image
                  src='/images/marsFragments/mars-fragments.svg'
                  alt='Mars Fragments'
                  width={18}
                  height={18}
                  className='w-5 h-5'
                />
                <span className='text-sm'>Mars Fragments</span>
              </div>
              <div className='flex items-center gap-2'>
                <Zap
                  className='w-5 h-5 flex-shrink-0'
                  style={{ color: `${token.brandColor}CC` }} // 80% opacity
                />
                <span className='text-sm'>Neutron Quarks</span>
              </div>
            </div>
          </div>
        </div>

        <Separator className='bg-border/60' />

        {/* Balances Section */}
        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            {/* <Wallet className='w-4 h-4' style={{ color: token.brandColor }} /> */}
            <span className='text-sm font-bold tracking-wider uppercase text-foreground/70'>
              Balances
            </span>
          </div>

          <div className='space-y-2'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground/90'>Deposited</span>
              <div className='text-base text-foreground'>
                {formatBalance(metrics.deposited)} {token.symbol}
              </div>
            </div>

            <div className='flex justify-between items-center'>
              <span className='text-sm text-muted-foreground/90'>Available</span>
              <div className='text-base text-foreground'>
                {formatBalance(metrics.balance)} {token.symbol}
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className='relative z-20 pt-2'>
        <div className='flex gap-2 w-full'>
          {/* Deposit Button */}
          <div className='relative group/button flex-1'>
            <div
              className='absolute inset-0 rounded-lg blur-md opacity-0 group-hover/button:opacity-50 transition-all duration-500 scale-105'
              style={{
                background: `linear-gradient(135deg, ${token.brandColor}, ${token.brandColor})`,
              }}
            />
            <div
              className='relative p-[1px] rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 ease-out group/btn-wrapper w-full'
              style={{
                background: `linear-gradient(135deg, ${token.brandColor}, ${token.brandColor})`,
              }}
            >
              <Button
                onClick={handleDepositClick}
                variant='secondary'
                className='relative w-full font-semibold text-foreground border-0 bg-card hover:bg-background/90 transition-all duration-300 ease-out overflow-hidden group/btn rounded-md'
              >
                Deposit
              </Button>
            </div>
          </div>

          {/* Withdraw Button  */}
          {metrics.deposited > 0 && (
            <Button
              onClick={handleWithdrawClick}
              variant='secondary'
              className='font-semibold rounded-md p-3 aspect-square'
              style={{ borderColor: token.brandColor }}
            >
              <ArrowDownToLine className='w-4 h-4 text-foreground/70' />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
