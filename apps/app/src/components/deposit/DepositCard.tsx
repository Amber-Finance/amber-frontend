import Image from 'next/image'
import { useRouter } from 'next/navigation'

import BigNumber from 'bignumber.js'
import { ArrowDownToLine } from 'lucide-react'

import { EarningPointsRow } from '@/components/common/EarningPointsRow'
import { NeutronRewardsBadge } from '@/components/common/NeutronRewardsBadge'
import TokenBalance from '@/components/common/TokenBalance'
import { getProtocolIcon } from '@/components/deposit/helpers'
import { useTheme } from '@/components/providers/ThemeProvider'
import { AnimatedCircularProgressBar } from '@/components/ui/AnimatedCircularProgress'
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
import { useUserDeposit } from '@/hooks/portfolio'
import useRedBankAssetsTvl from '@/hooks/redBank/useAssetsTvl'
import { useWalletBalances } from '@/hooks/wallet'
import { cn } from '@/lib/utils'

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
  address?: string
}

export default function DepositCard({ token, metrics, address }: DepositCardProps) {
  const router = useRouter()
  const { theme } = useTheme()
  const { data: redBankAssetsTvl } = useRedBankAssetsTvl()

  const { data: walletBalances } = useWalletBalances()
  const { amount: depositedAmount } = useUserDeposit(token.denom)

  const hasDeposited = metrics.deposited > 0

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
    <Card className='group relative w-full h-full flex flex-col bg-card border border-border/20 backdrop-blur-xl hover:border-border/40 transition-all duration-500 hover:shadow-lg @container'>
      {/* FlickeringGrid in header area only */}
      <div className='absolute inset-x-0 top-0 h-32 z-0 flex justify-center items-center self-center overflow-hidden rounded-t-lg'>
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
          className='absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10'
          style={{
            background: `linear-gradient(135deg, ${token.brandColor}08 0%, transparent 50%, transparent 100%)`,
          }}
        />
      </div>

      <CardHeader className='relative z-20'>
        <div className='flex flex-row items-center justify-between gap-4 mb-4'>
          <div className='flex items-center gap-4'>
            <div className='relative'>
              <div className='relative w-12 h-12 @[280px]:w-16 @[280px]:h-16'>
                <Image
                  src={token.icon}
                  alt={token.symbol}
                  fill
                  sizes='(min-width: 280px) 64px, 48px'
                  className='w-full h-full object-contain'
                />
              </div>

              {/* Protocol Icon Badge */}
              {protocolIcon && (
                <div className='absolute -bottom-0.5 -right-0.5 w-6 h-6 @[280px]:w-8 @[280px]:h-8 rounded-full border shadow-sm p-1 bg-background'>
                  <Image
                    src={protocolIcon}
                    alt={`${token.protocol} logo`}
                    fill
                    sizes='(min-width: 280px) 32px, 24px'
                    className=' w-full h-full p-1'
                    unoptimized={true}
                  />
                </div>
              )}
            </div>

            <div className='flex flex-col'>
              <CardTitle className='text-base @[280px]:text-lg font-semibold'>
                {token.symbol}
              </CardTitle>
              <CardDescription className='text-xs @[350px]:text-sm text-muted-foreground'>
                {token.protocol}
              </CardDescription>
            </div>
          </div>

          <div className='text-center @[280px]:text-right'>
            <div
              className='text-xl @[280px]:text-4xl font-funnel font-bold flex flex-row justify-center @[350px]:justify-end'
              style={{ color: token.brandColor }}
            >
              <CountingNumber value={metrics.totalApy} decimalPlaces={2} />%
            </div>
            <p className='text-muted-foreground uppercase tracking-wider text-xs font-medium mt-1'>
              APY
            </p>
          </div>
        </div>
      </CardHeader>

      <div className='relative w-full flex-1 flex flex-col'>
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
        <CardContent className={cn('flex-1 flex flex-col', token.comingSoon && 'blur-sm')}>
          {/* TVL and Metrics Section */}
          <div className='space-y-6 pt-5'>
            {/* Progress Bars Section */}
            <div className='grid grid-cols-2 gap-6'>
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

          {/* Additional Rewards Section */}
          <div className='space-y-3 pb-5'>
            <span className='text-sm font-semibold text-foreground'>Additional Rewards</span>

            {/* Points */}
            <EarningPointsRow
              assetSymbol={token.symbol}
              variant='full'
              type='deposit'
              address={address}
            />

            {/* Neutron Rewards APY */}
            <NeutronRewardsBadge symbol={token.symbol.toLowerCase()} variant='default' />
          </div>

          {/* Flexible spacer to push balances to bottom */}
          <div className='flex-1' />

          {/* Balances Section - Always at bottom */}
          <div className='space-y-3 pt-5 pb-5 border-t border-border/20'>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-semibold text-foreground'>Your Balances</span>
            </div>

            <div className='space-y-2'>
              {/* Deposited Balance */}
              <div className='space-y-1'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-foreground'>Deposited</span>
                  <TokenBalance coin={depositedCoin} size='md' />
                </div>
              </div>

              {/* Available Balance */}
              <div className='space-y-1'>
                <div className='flex justify-between items-center'>
                  <span className='text-sm text-foreground'>Available</span>
                  <TokenBalance coin={availableCoin} size='md' />
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
              return hasDeposited ? 'Modify' : 'Deposit'
            })()}
          </Button>

          {/* Withdraw Button */}
          {hasDeposited && (
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
