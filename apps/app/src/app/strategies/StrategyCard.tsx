'use client'

import { useMemo } from 'react'

import Image from 'next/image'

import { useChain } from '@cosmos-kit/react'

import { EarningPointsRow } from '@/components/common/EarningPointsRow'
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
import { useActiveStrategies } from '@/hooks/useActiveStrategies'
import useHealthComputer from '@/hooks/useHealthComputer'
import useWalletBalances from '@/hooks/useWalletBalances'
import { cn } from '@/lib/utils'
import { useStore } from '@/store/useStore'
import {
  calculateNetApy,
  formatLeverage,
  getGradientColors,
  getMaxAPY,
} from '@/utils/strategyCardHelpers'

interface StrategyCardProps {
  strategy: Strategy
}

export function StrategyCard({ strategy }: StrategyCardProps) {
  const { isWalletConnected, connect } = useChain(chainConfig.name)
  const { data: walletBalances } = useWalletBalances()
  const { markets } = useStore()
  const { isWasmReady } = useHealthComputer()
  const { activeStrategies, isLoading: activeStrategiesLoading } = useActiveStrategies()

  // Find active strategy for this collateral/debt pair
  const activeStrategy = activeStrategies.find(
    (active) =>
      active.collateralAsset.symbol === strategy.collateralAsset.symbol &&
      active.debtAsset.symbol === strategy.debtAsset.symbol,
  )

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

      <CardHeader className='relative z-20'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4'>
          <div className='flex items-center gap-4'>
            <div className='relative'>
              <div className='relative w-12 h-12 sm:w-16 sm:h-16'>
                <Image
                  src={strategy.collateralAsset.icon}
                  alt={strategy.collateralAsset.symbol}
                  fill
                  sizes='(max-width: 640px) 48px, 64px'
                  className='w-full h-full object-contain'
                />
              </div>
              <div className='absolute -bottom-0.5 -right-0.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full border shadow-sm p-1 bg-background'>
                <Image
                  src={strategy.debtAsset.icon}
                  alt={strategy.debtAsset.symbol}
                  fill
                  sizes='(max-width: 640px) 24px, 32px'
                  className=' w-full h-full'
                  unoptimized={true}
                />
              </div>
            </div>
            <div className='flex flex-col'>
              <CardTitle className='text-base sm:text-lg font-semibold'>
                {strategy.collateralAsset.symbol}/{strategy.debtAsset.symbol}
              </CardTitle>
              <CardDescription className='text-xs sm:text-sm text-muted-foreground'>
                Supply {strategy.collateralAsset.symbol}, borrow {strategy.debtAsset.symbol}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <div className='relative w-full'>
        {isComingSoon && (
          <div className='absolute inset-0 flex flex-wrap gap-4 items-center content-center z-10'>
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
          className={cn('relative space-y-4 z-20 flex-1 flex flex-col', isComingSoon && 'blur-sm')}
        >
          {/* Main APY Display */}
          <div className='text-center'>
            <div className='text-6xl font-funnel font-bold text-foreground mb-2'>
              {netApy < 0 ? '-' : ''}
              {Math.abs(maxAPY * 100).toFixed(2)}
              <span
                className={`text-2xl`}
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
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6'>
            <div className='bg-secondary/50 rounded-lg p-3 text-center border border-border/40'>
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
            <div className='bg-secondary/50 rounded-lg p-3 text-center border border-border/40'>
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

          {/* Earning Points Section */}
          <div className='pt-3'>
            <EarningPointsRow
              assetSymbol={strategy.debtAsset.symbol}
              variant='full'
              type='strategy'
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
                    width={32}
                    height={32}
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

              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6'>
                {/* Supply (Collateral-Borrowed) and in usd value */}
                <div className='bg-secondary/50 rounded-lg p-3 border border-border/40'>
                  <div className='flex flex-col items-center justify-between'>
                    <span className='text-xs font-medium text-muted-foreground'>SUPPLY</span>
                    <div className='text-center'>
                      <div className='text-sm font-semibold text-foreground'>
                        ${activeStrategy.supply.usdValue.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Leverage */}
                <div className='bg-secondary/50 rounded-lg p-3 border border-border/40'>
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
                <div className='bg-secondary/50 rounded-lg p-3 border border-border/40'>
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
                <TokenBalance coin={activeStrategy.collateralAsset} size='md' />
              </div>

              {/* Borrowed Balance */}
              <div className='flex justify-between items-center'>
                <span className='text-sm text-foreground'>Total Borrowed</span>
                <TokenBalance coin={activeStrategy.debtAsset} size='md' />
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
      <CardFooter className='relative z-20 pt-3 h-full flex flex-col justify-end'>
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
