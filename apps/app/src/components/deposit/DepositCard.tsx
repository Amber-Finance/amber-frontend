import Image from 'next/image'
import { useRouter } from 'next/navigation'

import BigNumber from 'bignumber.js'
import { ArrowDownToLine } from 'lucide-react'

import { EarningPointsRow } from '@/components/common/EarningPointsRow'
import TokenBalance from '@/components/common/TokenBalance'
import { useTheme } from '@/components/providers/ThemeProvider'
import { AnimatedCircularProgressBar } from '@/components/ui/AnimatedCircularProgress'
import { Button } from '@/components/ui/Button'
import { CountingNumber } from '@/components/ui/CountingNumber'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import useRedBankAssetsTvl from '@/hooks/redBank/useAssetsTvl'
import { useUserDeposit } from '@/hooks/useUserDeposit'
import useWalletBalances from '@/hooks/useWalletBalances'
import { cn } from '@/lib/utils'
import {
  getProtocolIcon,
  getProtocolPoints,
  getProtocolPointsIcon,
} from '@/utils/depositCardHelpers'

interface DepositCardProps {
  token: TokenInfo
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

  const { data: walletBalances } = useWalletBalances()
  const { amount: depositedAmount } = useUserDeposit(token.denom)

  const walletBalanceAmount =
    walletBalances?.find((balance) => balance.denom === token.denom)?.amount || '0'

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
  const protocolIcon = getProtocolIcon(token.protocolIconLight, token.protocolIconDark, theme)

  const handleDepositClick = () => {
    router.push(`/deposit?token=${token.symbol}`)
  }

  const handleWithdrawClick = () => {
    router.push(`/deposit?token=${token.symbol}&action=withdraw`)
  }

  const depositedCoin = {
    denom: token.denom,
    amount: depositedAmount || '0',
  }

  const availableCoin = {
    denom: token.denom,
    amount: walletBalanceAmount,
  }

  return (
    <Card className='group relative w-full h-full flex flex-col bg-card border border-border/20 backdrop-blur-xl hover:border-border/40 transition-all duration-500 hover:shadow-lg'>
      {/* FlickeringGrid in header area only */}
      <div className='absolute inset-x-0 top-0 h-32 z-0 flex justify-center items-center self-center overflow-hidden rounded-t-lg'>
        {/* <FlickeringGrid
          className='w-full h-full'
          color={token.brandColor}
          squareSize={8}
          gridGap={2}
          flickerChance={0.2}
          maxOpacity={0.2}
          gradientDirection='top-to-bottom'
          height={128}
        /> */}
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
              <div className='relative w-20 h-20'>
                <Image
                  src={token.icon}
                  alt={token.symbol}
                  fill
                  className='object-contain'
                  sizes='80px'
                />
              </div>

              {/* Protocol Icon Badge */}
              {protocolIcon && (
                <div className='absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-lg bg-background border shadow-sm p-1'>
                  <Image
                    src={protocolIcon}
                    alt={`${token.protocol} logo`}
                    width={32}
                    height={32}
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

          <div className='text-center'>
            <div className='text-4xl  font-funnel font-bold' style={{ color: token.brandColor }}>
              <CountingNumber value={metrics.totalApy} decimalPlaces={2} />%
            </div>
            <p className='text-muted-foreground uppercase tracking-wider text-xs font-medium mt-1'>
              APY
            </p>
          </div>
        </div>
      </CardHeader>

      <div className='relative w-full'>
        {token.comingSoon && (
          <div className='absolute inset-0 flex flex-wrap gap-4 items-center content-center z-10'>
            <h2 className='text-lg md:text-2xl font-funnel text-center w-full'>
              Temporary Disabled
            </h2>
            <p className='text-sm text-muted-foreground text-center w-full px-4 md:px-8'>
              Deposits and withdrawals will be disabled for the time being due to a bridge upgrade
              for {token.symbol}. Please check back soon.
            </p>
          </div>
        )}
        <CardContent className={cn('flex-1 space-y-5', token.comingSoon && 'blur-sm')}>
          {/* TVL and Metrics Section */}
          <div className='space-y-6'>
            {/* Progress Bars Section */}
            <div className='grid grid-cols-2 gap-4'>
              {/* Utilization Rate */}
              <div
                className='bg-secondary/20 rounded-lg p-3 text-center border border-border/40 flex flex-col items-center space-y-2'
                title='The percentage of total available liquidity that is currently being borrowed'
              >
                <div className='text-muted-foreground text-xs uppercase tracking-wider mb-1'>
                  UTILIZATION
                </div>
                <AnimatedCircularProgressBar
                  value={metrics.utilizationRate}
                  max={100}
                  min={0}
                  gaugePrimaryColor={token.brandColor}
                  gaugeSecondaryColor='rgba(255, 255, 255, 0.1)'
                  className='size-16 text-xs'
                />
              </div>

              {/* TVL Share */}
              <div
                className='bg-secondary/20 rounded-lg p-3 text-center border border-border/40 flex flex-col items-center space-y-2'
                title="This asset's percentage share of the total value locked in the protocol"
              >
                <div className='text-muted-foreground text-xs uppercase tracking-wider mb-1'>
                  TVL SHARE
                </div>
                <AnimatedCircularProgressBar
                  value={tvlPercentage > 0 ? tvlPercentage : 0}
                  max={100}
                  min={0}
                  gaugePrimaryColor={token.brandColor}
                  gaugeSecondaryColor='rgba(255, 255, 255, 0.1)'
                  className='size-16 text-xs'
                />
              </div>
            </div>
          </div>

          {/* Points Section */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-semibold text-foreground'>Earning Points</span>
              <div className='flex -space-x-2'>
                {(() => {
                  const protocolPoints = getProtocolPoints(token.symbol)
                  const protocolPointsIcon = getProtocolPointsIcon(token.symbol, theme)
                  const assetLower = token.symbol.toLowerCase()
                  const neutronMultiplier = assetLower === 'wbtc' ? '3x' : '2x'

                  const pointsData = []

                  // Protocol Points - Show first if they exist
                  if (protocolPoints.protocolPoint && protocolPointsIcon) {
                    pointsData.push({
                      icon: protocolPointsIcon,
                      alt: protocolPoints.protocolPoint,
                      tooltip: `${protocolPoints.protocolPoint} ${protocolPoints.multiplier}`,
                    })
                  }

                  // Neutron Rewards
                  pointsData.push({
                    icon: '/images/neutron/neutron.svg',
                    alt: 'Neutron',
                    tooltip: `Neutron ${neutronMultiplier}`,
                  })

                  // Mars Fragments
                  pointsData.push({
                    icon: '/points/mars-fragments.svg',
                    alt: 'Mars Fragments',
                    tooltip: 'Mars Fragments',
                  })

                  return pointsData.map((point) => (
                    <div key={point.alt} className='group/icon relative inline-block'>
                      <div className='relative inline-block size-8 rounded-full ring-2 ring-card group-hover/icon:ring-primary/20 bg-secondary border border-border group-hover/icon:border-primary/40 p-1.5 transition-all duration-200 group-hover/icon:z-10 cursor-pointer'>
                        <Image
                          src={point.icon}
                          alt={point.alt}
                          width={20}
                          height={20}
                          className='object-contain w-full h-full'
                          unoptimized={true}
                        />
                      </div>
                      <div className='opacity-0 group-hover/icon:opacity-100 invisible group-hover/icon:visible absolute z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-2 py-1.5 px-2.5 bg-popover text-popover-foreground text-xs rounded-lg border border-border shadow-lg transition-all duration-200 whitespace-nowrap pointer-events-none'>
                        {point.tooltip}
                      </div>
                    </div>
                  ))
                })()}
              </div>
            </div>
          </div>

          {/* Flexible spacer to push content to bottom */}
          <div className='flex-1' />

          <Separator />

          {/* Balances Section */}
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-semibold text-foreground'>Your Balances</span>
            </div>

            <div className='space-y-2'>
              {/* Deposited Balance */}
              <div className='space-y-1'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-foreground'>Deposited</span>
                  <TokenBalance coin={depositedCoin} size='sm' />
                </div>
              </div>

              {/* Available Balance */}
              <div className='space-y-1'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-foreground'>Available</span>
                  <TokenBalance coin={availableCoin} size='sm' />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </div>
      <CardFooter className='pt-4'>
        <div className='flex gap-2 w-full'>
          {/* Deposit Button */}
          <Button
            onClick={token.comingSoon ? undefined : handleDepositClick}
            className='flex-1'
            disabled={token.comingSoon}
          >
            {(() => {
              if (token.comingSoon) return 'Temporary Disabled'
              return metrics.deposited > 0 ? 'Modify' : 'Deposit'
            })()}
          </Button>

          {/* Withdraw Button */}
          {metrics.deposited > 0 && (
            <Button
              onClick={token.comingSoon ? undefined : handleWithdrawClick}
              variant='outline'
              size='icon'
              disabled={token.comingSoon}
            >
              <ArrowDownToLine className='w-4 h-4' />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
