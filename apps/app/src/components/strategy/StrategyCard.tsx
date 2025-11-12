'use client'

import { useMemo } from 'react'

import Image from 'next/image'

import { useChain } from '@cosmos-kit/react'

import { EarningPointsRow } from '@/components/common/EarningPointsRow'
import FormattedValue from '@/components/common/FormattedValue'
import { NeutronRewardsBadge } from '@/components/common/NeutronRewardsBadge'
import TokenBalance from '@/components/common/TokenBalance'
import { Button } from '@/components/ui/Button'
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
import chainConfig from '@/config/chain'
import { MAXBTC_DENOM } from '@/constants/query'
import { useHealthComputer } from '@/hooks/common'
import { useActiveStrategies } from '@/hooks/portfolio'
import { useWalletBalances } from '@/hooks/wallet'
import { cn } from '@/lib/utils'
import { useStore } from '@/store/useStore'
import {
  calculateNetApy,
  formatLeverage,
  getGradientColors,
  getMaxAPY,
} from '@/utils/strategy/strategyCardHelpers'

interface StrategyCardProps {
  strategy: Strategy
}

export function StrategyCard({ strategy }: StrategyCardProps) {
  const { isWalletConnected, connect } = useChain(chainConfig.name)
  const { data: walletBalances } = useWalletBalances()
  const { markets } = useStore()
  const { isWasmReady } = useHealthComputer()
  const activeStrategies = useActiveStrategies()

  // Find active strategy for this collateral/debt pair
  const activeStrategy = activeStrategies?.find(
    (active: ActiveStrategy) =>
      active.collateralAsset.symbol === strategy.collateralAsset.symbol &&
      active.debtAsset.symbol === strategy.debtAsset.symbol,
  )

  const activeStrategiesLoading = !activeStrategies

  const maxAPY = useMemo(
    () => getMaxAPY(strategy, markets || [], isWasmReady),
    [strategy, markets, isWasmReady],
  )

  const netApy = useMemo(() => calculateNetApy(strategy), [strategy])
  const leverage = useMemo(
    () => formatLeverage(strategy, markets || [], isWasmReady),
    [strategy, markets, isWasmReady],
  )
  const { collateralColor, debtColor } = useMemo(() => getGradientColors(strategy), [strategy])

  // Check if user has maxBTC balance
  const hasMaxBtcBalance = useMemo(() => {
    if (!walletBalances || !isWalletConnected) return false
    const maxBtcBalance = walletBalances.find((b) => b.denom === strategy.collateralAsset.denom)
    return maxBtcBalance && parseFloat(maxBtcBalance.amount) > 0
  }, [walletBalances, isWalletConnected, strategy.collateralAsset.denom])

  // Create coin object for TokenBalance component
  const debtCoin = useMemo((): Coin => {
    const market = markets?.find((m) => m.asset.denom === strategy.debtAsset.denom)
    const rawAmount = market?.metrics?.collateral_total_amount || '0'

    return {
      denom: strategy.debtAsset.denom,
      amount: rawAmount,
    }
  }, [markets, strategy.debtAsset.denom])

  const cardStyle = {
    '--collateral-color': collateralColor,
    '--debt-color': debtColor,
  } as React.CSSProperties

  const isComingSoon = useMemo(() => strategy.debtAsset.comingSoon, [strategy.debtAsset.comingSoon])

  return (
    <Card
      className='group relative w-full h-full flex flex-col bg-card border border-border/20 backdrop-blur-xl hover:border-border/40 transition-all duration-500 hover:shadow-lg'
      style={cardStyle}
    >
      <FlickeringGrid
        className='absolute inset-0 z-0 rounded-lg overflow-hidden'
        color={debtColor}
        squareSize={8}
        gridGap={2}
        flickerChance={0.2}
        maxOpacity={0.2}
        gradientDirection='top-to-bottom'
        height={120}
      />

      {/* Enhanced gradient overlay for depth */}
      <div
        className='absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10'
        style={{
          background: `linear-gradient(135deg, ${debtColor}08 0%, transparent 50%, transparent 100%)`,
        }}
      />

      <CardHeader className='relative z-20 h-20 sm:h-24 flex-shrink-0'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 h-full'>
          <div className='flex items-center gap-4 h-full'>
            <div className='relative flex-shrink-0'>
              <div className='relative w-10 h-10 sm:w-12 sm:h-12'>
                <Image
                  src={strategy.collateralAsset.icon}
                  alt={strategy.collateralAsset.symbol}
                  fill
                  sizes='(max-width: 640px) 40px, 48px'
                  className='w-full h-full object-contain'
                />
              </div>
              <div className='absolute -bottom-0.5 -right-0.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full border shadow-sm p-0.5 bg-background'>
                <Image
                  src={strategy.debtAsset.icon}
                  alt={strategy.debtAsset.symbol}
                  fill
                  sizes='(max-width: 640px) 20px, 24px'
                  className=' w-full h-full'
                  unoptimized={true}
                />
              </div>
            </div>
            <div className='flex flex-col justify-center min-h-0 flex-1'>
              <CardTitle className='text-base sm:text-lg font-semibold leading-tight'>
                {strategy.collateralAsset.symbol}/{strategy.debtAsset.symbol}
              </CardTitle>
              <CardDescription
                className='text-xs sm:text-sm text-muted-foreground leading-tight h-8 overflow-hidden'
                style={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  textOverflow: 'ellipsis',
                }}
              >
                Supply {strategy.collateralAsset.symbol}, borrow {strategy.debtAsset.symbol}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <div className='relative w-full'>
        {isComingSoon && (
          <div className='absolute inset-0 flex flex-wrap gap-4 items-center content-center z-30'>
            <h2 className='text-lg md:text-2xl font-funnel text-center w-full'>
              Temporary Disabled
            </h2>
            <p className='text-sm text-muted-foreground text-center w-full px-4 md:px-8'>
              This strategy is temporarily disabled due to a bridge upgrade for{' '}
              {strategy.debtAsset.symbol}. Please check back soon.
            </p>
          </div>
        )}
        <CardContent
          className={cn('relative space-y-3 z-20 flex-1 flex flex-col', isComingSoon && 'blur-sm')}
        >
          {/* Main APY Display */}
          <div className='text-center'>
            <div className='text-4xl sm:text-5xl font-funnel font-bold text-foreground mb-1'>
              {netApy < 0 ? '-' : ''}
              {Math.abs(maxAPY * 100).toFixed(2)}
              <span
                className={`text-xl sm:text-2xl`}
                style={{ color: strategy.debtAsset?.brandColor || '#F97316' }}
              >
                %
              </span>
            </div>
            <p className='text-muted-foreground uppercase tracking-wider text-xs font-medium'>
              Max APY
            </p>
          </div>

          {/* Strategy Metrics */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
            <div className='bg-secondary/50 rounded-lg p-2.5 text-center border border-border/40'>
              <p className='text-muted-foreground text-xs uppercase tracking-wider mb-1'>
                Base APY
              </p>
              <p
                className={`font-semibold text-md ${netApy >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
              >
                {netApy >= 0 ? '+' : '-'}
                {Math.abs(netApy * 100).toFixed(2)}%
              </p>
            </div>
            <div className='bg-secondary/50 rounded-lg p-2.5 text-center border border-border/40'>
              <p className='text-muted-foreground text-xs uppercase tracking-wider mb-1'>
                Max Leverage
              </p>
              <p
                className='text-foreground font-semibold text-md
              '
              >
                {leverage}
              </p>
            </div>
          </div>

          {/* Additional Rewards Section */}
          <div className='pt-2 space-y-3 pb-3 border-b border-border/20'>
            <span className='text-sm font-semibold text-foreground'>Additional Rewards</span>

            {/* Points */}
            <EarningPointsRow
              assetSymbol={strategy.debtAsset.symbol}
              variant='full'
              type='strategy'
            />

            {/* Neutron Rewards APY */}
            <NeutronRewardsBadge
              symbol={`maxbtc-${strategy.debtAsset.symbol.toLowerCase()}`}
              variant='default'
            />
          </div>

          {/* Available Debt Section */}
          <div className='space-y-2 pt-2 '>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-semibold text-foreground'>Available Debt</span>
            </div>

            <div className='space-y-1'>
              <div className='flex justify-between  items-center'>
                <span className='text-xs text-muted-foreground flex justify-center items-center gap-2'>
                  <Image
                    src={strategy.debtAsset.icon}
                    alt={strategy.debtAsset.symbol}
                    width={24}
                    height={24}
                    unoptimized={true}
                  />
                  <span className='text-sm font-medium text-foreground'>
                    {strategy.debtAsset.symbol}
                  </span>
                </span>
                <TokenBalance
                  coin={debtCoin}
                  size='md'
                  align='right'
                  className='flex flex-col justify-end items-end'
                />
              </div>
            </div>
          </div>
          <Separator />

          {/* Conditional Section: Active Strategy or Balances */}
          {activeStrategy ? (
            /* Active Strategy Details */
            <div className='space-y-2 pt-2 flex-1'>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-semibold text-foreground'>Active Position</span>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4'>
                {/* Supply (Collateral-Borrowed) and in usd value */}
                <div className='bg-secondary/50 rounded-lg p-2.5 border border-border/40'>
                  <div className='flex flex-col items-center justify-between'>
                    <span className='text-xs font-medium text-muted-foreground'>EQUITY</span>
                    <div className='text-center'>
                      <div className='text-sm font-semibold text-foreground'>
                        <FormattedValue
                          value={activeStrategy.supply.usdValue}
                          isCurrency={true}
                          useCompactNotation={false}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Leverage */}
                <div className='bg-secondary/50 rounded-lg p-2.5 border border-border/40'>
                  <div className='flex flex-col   items-center justify-between'>
                    <span className='text-xs font-medium text-muted-foreground'>LEVERAGE</span>
                    <div className='text-center'>
                      <div className='text-sm font-semibold text-foreground'>
                        {activeStrategy.leverage.toFixed(2)}x
                      </div>
                    </div>
                  </div>
                </div>

                {/* Net APY */}
                <div className='bg-secondary/50 rounded-lg p-2.5 border border-border/40'>
                  <div className='flex flex-col items-center justify-between'>
                    <span className='text-xs font-medium text-muted-foreground'>APY</span>
                    <div className='text-center'>
                      <div
                        className={`text-sm font-semibold text-center ${
                          activeStrategy.isPositive
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {activeStrategy.netApy > 0 ? '+' : ''}
                        {activeStrategy.netApy.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Deposited Balance */}
              <div className='flex justify-between items-center'>
                <span className='text-sm text-foreground'>Total Collateral</span>
                <TokenBalance
                  coin={activeStrategy.collateralAsset}
                  size='md'
                  useCompactNotation={false}
                />
              </div>

              {/* Borrowed Balance */}
              <div className='flex justify-between items-center'>
                <span className='text-sm text-foreground'>Total Borrowed</span>
                <TokenBalance
                  coin={activeStrategy.debtAsset}
                  size='md'
                  useCompactNotation={false}
                />
              </div>
            </div>
          ) : (
            /* Balances Section */
            <div className='space-y-2 pt-2 flex-1 flex flex-col h-full'>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-semibold text-foreground'>Balance</span>
              </div>

              <div className='space-y-2'>
                {/* Available Balance */}
                <div className='space-y-1'>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm text-foreground'>Available</span>
                    <TokenBalance
                      coin={{
                        denom: strategy.collateralAsset.denom,
                        amount:
                          walletBalances?.find((b) => b.denom === strategy.collateralAsset.denom)
                            ?.amount || '0',
                      }}
                      size='md'
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Flexible spacer to push content to bottom */}
          <div className='flex-1' />
        </CardContent>
      </div>
      <CardFooter className='relative z-20 pt-2 h-full flex flex-col justify-end'>
        {!isWalletConnected && (
          <Button
            onClick={isComingSoon ? undefined : connect}
            variant='default'
            className='w-full'
            disabled={isComingSoon}
          >
            {isComingSoon ? 'Temporary Disabled' : 'Connect Wallet'}
          </Button>
        )}

        {isWalletConnected && (
          <Button
            onClick={() => {
              // If no active strategy and no maxBTC balance, go to swap
              if (!activeStrategy && !hasMaxBtcBalance) {
                window.location.href = `/swap?to=${encodeURIComponent(MAXBTC_DENOM)}`
              } else {
                // Otherwise go to strategy page
                window.location.href = `/strategies/${strategy.collateralAsset.symbol}-${strategy.debtAsset.symbol}`
              }
            }}
            variant='default'
            className='w-full'
            disabled={activeStrategiesLoading || isComingSoon}
          >
            {(() => {
              if (activeStrategiesLoading) return 'Loading...'
              if (isComingSoon) return 'Temporary Disabled'
              if (activeStrategy) return 'Modify'
              if (!hasMaxBtcBalance) return 'Get maxBTC'
              return 'Deploy'
            })()}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
