import Image from 'next/image'
import { useRouter } from 'next/navigation'

import BigNumber from 'bignumber.js'
import { ArrowDownToLine, Wallet } from 'lucide-react'

import { useTheme } from '@/components/providers/ThemeProvider'
import { AnimatedCircularProgressBar } from '@/components/ui/AnimatedCircularProgress'
import { Button } from '@/components/ui/Button'
import { CountingNumber } from '@/components/ui/CountingNumber'
import { FlickeringGrid } from '@/components/ui/FlickeringGrid'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import useRedBankAssetsTvl from '@/hooks/redBank/useRedBankAssetsTvl'
import {
  formatBalance,
  getNeutronIcon,
  getProtocolIcon,
  getProtocolPoints,
  getProtocolPointsIcon,
} from '@/utils/depositCardHelpers'

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
    denom: string
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

  const { data: redBankAssetsTvl } = useRedBankAssetsTvl()

  const currentTokenTvlData = redBankAssetsTvl?.assets?.find(
    (asset: any) => asset.denom === token.denom,
  )
  const currentTokenTvlAmount = new BigNumber(currentTokenTvlData?.tvl).shiftedBy(-6).toString()

  const totalTvlAllAssets =
    redBankAssetsTvl?.assets?.reduce(
      (sum: number, asset: any) => sum + new BigNumber(asset.tvl).shiftedBy(-6).toNumber(),
      0,
    ) || 0

  const tvlPercentage =
    totalTvlAllAssets > 0
      ? (new BigNumber(currentTokenTvlAmount).toNumber() / totalTvlAllAssets) * 100
      : 0

  // Helper function calls
  const protocolPoints = getProtocolPoints(token.symbol)
  const neutronIcon = getNeutronIcon(theme)
  const protocolPointsIcon = getProtocolPointsIcon(token.symbol, theme)
  const protocolIcon = getProtocolIcon(token.protocolIconLight, token.protocolIconDark, theme)

  const handleDepositClick = () => {
    router.push(`/deposit?token=${token.symbol}`)
  }

  const handleWithdrawClick = () => {
    router.push(`/deposit?token=${token.symbol}&action=withdraw`)
  }

  return (
    <Card className='group relative w-full h-full flex flex-col transition-all duration-200 hover:shadow-lg hover:shadow-muted/25 border-border/50 hover:border-border overflow-hidden'>
      {/* FlickeringGrid in header area only */}
      <div className='absolute inset-x-0 top-0 h-32 z-0 flex justify-center items-center self-center'>
        <FlickeringGrid
          className='w-full h-full'
          color={token.brandColor}
          squareSize={8}
          gridGap={2}
          flickerChance={0.2}
          maxOpacity={0.2}
          gradientDirection='top-to-bottom'
          height={128}
        />
        {/* Subtle gradient overlay */}
        <div
          className='absolute inset-0 opacity-60'
          style={{
            background: `linear-gradient(180deg, ${token.brandColor}05 0%, transparent 70%)`,
          }}
        />
      </div>

      <CardHeader className='pb-4 relative z-10'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='relative'>
              <div className='relative w-16 h-16 rounded-xl overflow-hidden shadow-sm'>
                <Image
                  src={token.icon}
                  alt={token.symbol}
                  fill
                  className='object-contain p-2'
                  sizes='48px'
                />
              </div>

              {/* Protocol Icon Badge */}
              {protocolIcon && (
                <div className='absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-lg bg-background border shadow-sm p-0.5'>
                  <Image
                    src={protocolIcon}
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
              <CardTitle className='text-lg font-semibold'>{token.symbol}</CardTitle>
              <CardDescription className='text-sm text-muted-foreground'>
                {token.protocol}
              </CardDescription>
            </div>
          </div>

          <div className='text-4xl font-bold text-primary'>
            <CountingNumber value={metrics.totalApy} decimalPlaces={2} />%
          </div>
        </div>
      </CardHeader>

      <CardContent className='flex-1 space-y-4'>
        {/* TVL and Metrics Section */}
        <div className='space-y-4'>
          {/* TVL Info
          <div className='flex items-center justify-between p-3 rounded-lg bg-muted/50'>
            <div className='flex items-center gap-2'>
              <TrendingUp className='w-4 h-4 text-muted-foreground' />
              <span className='text-sm font-medium'>Total Value Locked</span>
            </div>
            <div className='text-right'>
              <div className='text-sm font-semibold'>
                {formatCompactCurrency(currentTokenTvlAmount)}
              </div>
              <div className='text-xs text-muted-foreground'>{token.symbol} denominated</div>
            </div>
          </div> */}

          {/* Progress Bars Section */}
          <div className='grid grid-cols-2 gap-4'>
            {/* Utilization Rate */}
            <div className='flex flex-col items-center space-y-2'>
              <AnimatedCircularProgressBar
                value={metrics.utilizationRate}
                max={100}
                min={0}
                gaugePrimaryColor={token.brandColor}
                gaugeSecondaryColor={`${token.brandColor}10`}
                className='size-16 text-xs'
              />
              <div className='text-center'>
                <div className='text-xs font-medium text-muted-foreground'>Utilization</div>
                <div className='text-xs text-muted-foreground'>Rate</div>
              </div>
            </div>

            {/* TVL Share */}
            <div className='flex flex-col items-center space-y-2'>
              <AnimatedCircularProgressBar
                value={tvlPercentage > 0 ? tvlPercentage : 0}
                max={100}
                min={0}
                gaugePrimaryColor={token.brandColor}
                gaugeSecondaryColor={`${token.brandColor}10`}
                className='size-16 text-xs'
              />
              <div className='text-center'>
                <div className='text-xs font-medium text-muted-foreground'>TVL Share</div>
                <div className='text-xs text-muted-foreground'>of Protocol</div>
              </div>
            </div>
          </div>
        </div>

        {/* Points Section */}
        <div className='space-y-3'>
          <h4 className='text-sm font-medium text-foreground'>Earning Points</h4>
          <div className='flex flex-wrap gap-2'>
            {/* Protocol Points - Show first if they exist */}
            {protocolPoints.protocolPoint && protocolPointsIcon && (
              <Badge variant='secondary' className='text-xs gap-1.5'>
                <div className='w-3 h-3 flex-shrink-0'>
                  <Image
                    src={protocolPointsIcon}
                    alt={protocolPoints.protocolPoint}
                    width={12}
                    height={12}
                    className='object-contain w-full h-full'
                    unoptimized={true}
                  />
                </div>
                <span>{protocolPoints.protocolPoint}</span>
                <span className='font-semibold'>{protocolPoints.multiplier}</span>
              </Badge>
            )}

            {/* Neutron Points */}
            <Badge variant='secondary' className='text-xs gap-1.5'>
              <div className='w-3 h-3 flex-shrink-0'>
                <Image
                  src={neutronIcon}
                  alt='Neutron'
                  width={12}
                  height={12}
                  className='object-contain w-full h-full'
                />
              </div>
              <span>Neutron</span>
            </Badge>

            {/* Mars Fragments */}
            <Badge variant='secondary' className='text-xs gap-1.5'>
              <div className='w-3 h-3 flex-shrink-0'>
                <Image
                  src='/points/mars-fragments.svg'
                  alt='Mars Fragments'
                  width={12}
                  height={12}
                  className='object-contain w-full h-full'
                />
              </div>
              <span>Mars Fragments</span>
            </Badge>
          </div>
        </div>

        {/* Flexible spacer to push content to bottom */}
        <div className='flex-1' />

        <Separator />

        {/* Balances Section */}
        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            <Wallet className='w-4 h-4 text-muted-foreground' />
            <span className='text-sm font-medium'>Your Balances</span>
          </div>

          <div className='space-y-2'>
            {/* Deposited Balance */}
            <div className='space-y-1'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>Deposited</span>
                <span className='text-sm font-medium'>
                  $
                  {(
                    metrics.deposited *
                    (metrics.balance > 0 ? metrics.valueUsd / metrics.balance : 0)
                  ).toFixed(2)}
                </span>
              </div>
              <div className='flex justify-end'>
                <span className='text-xs text-muted-foreground'>
                  {formatBalance(metrics.deposited)} {token.symbol}
                </span>
              </div>
            </div>

            {/* Available Balance */}
            <div className='space-y-1'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>Available</span>
                <span className='text-sm font-medium'>${metrics.valueUsd.toFixed(2)}</span>
              </div>
              <div className='flex justify-end'>
                <span className='text-xs text-muted-foreground'>
                  {formatBalance(metrics.balance)} {token.symbol}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className='pt-4'>
        <div className='flex gap-2 w-full'>
          {/* Deposit Button */}
          <Button onClick={handleDepositClick} className='flex-1'>
            Deposit
          </Button>

          {/* Withdraw Button */}
          {metrics.deposited > 0 && (
            <Button onClick={handleWithdrawClick} variant='outline' size='icon'>
              <ArrowDownToLine className='w-4 h-4' />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
