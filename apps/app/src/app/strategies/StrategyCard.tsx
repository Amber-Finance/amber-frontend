'use client'

import { useMemo } from 'react'

import Image from 'next/image'

import { useChain } from '@cosmos-kit/react'

import { Button } from '@/components/ui/Button'
import { FlickeringGrid } from '@/components/ui/FlickeringGrid'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import chainConfig from '@/config/chain'
import { useActiveStrategies } from '@/hooks/useActiveStrategies'
import useHealthComputer from '@/hooks/useHealthComputer'
import { useStrategyWithdrawal } from '@/hooks/useStrategyWithdrawal'
import useWalletBalances from '@/hooks/useWalletBalances'
import { cn } from '@/lib/utils'
import { useStore } from '@/store/useStore'
import {
  calculateNetApy,
  formatBorrowTokenAmount,
  formatBorrowableUsd,
  formatLeverage,
  formatUserTokenAmount,
  getGradientColors,
  getMaxAPY,
  getUserBalanceUsd,
} from '@/utils/strategyCardHelpers'

interface StrategyCardProps {
  strategy: Strategy
}

export function StrategyCard({ strategy }: StrategyCardProps) {
  const { isWalletConnected, connect } = useChain(chainConfig.name)
  const { data: walletBalances, isLoading: walletBalancesLoading } = useWalletBalances()
  const { markets } = useStore()
  const { isWasmReady } = useHealthComputer()
  const { activeStrategies, isLoading: activeStrategiesLoading } = useActiveStrategies()
  const { withdrawFullStrategy, isProcessing: isWithdrawing } = useStrategyWithdrawal()

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

  const userBalanceUsd = useMemo(
    () =>
      getUserBalanceUsd(
        isWalletConnected,
        walletBalancesLoading,
        walletBalances,
        strategy.collateralAsset.denom,
        markets,
      ),
    [
      isWalletConnected,
      walletBalancesLoading,
      walletBalances,
      strategy.collateralAsset.denom,
      markets,
    ],
  )
  const netApy = useMemo(() => calculateNetApy(strategy), [strategy])
  const leverage = useMemo(
    () => formatLeverage(strategy, markets || [], isWasmReady),
    [strategy, markets, isWasmReady],
  )
  const borrowableUsd = useMemo(() => formatBorrowableUsd(strategy), [strategy])
  const { collateralColor, debtColor } = useMemo(() => getGradientColors(strategy), [strategy])
  const borrowTokenAmount = useMemo(
    () =>
      formatBorrowTokenAmount(markets || [], strategy.debtAsset.denom, strategy.debtAsset.symbol),
    [markets, strategy.debtAsset.denom, strategy.debtAsset.symbol],
  )
  const userTokenAmount = useMemo(
    () =>
      formatUserTokenAmount(
        isWalletConnected,
        walletBalancesLoading,
        walletBalances,
        strategy.collateralAsset.denom,
        strategy.collateralAsset.symbol,
        strategy.collateralAsset.decimals || 8, // Use actual decimals from strategy
      ),
    [
      isWalletConnected,
      walletBalancesLoading,
      walletBalances,
      strategy.collateralAsset.denom,
      strategy.collateralAsset.symbol,
      strategy.collateralAsset.decimals,
    ],
  )

  const cardStyle = {
    '--collateral-color': collateralColor,
    '--debt-color': debtColor,
  } as React.CSSProperties

  const isComingSoon = useMemo(() => strategy.debtAsset.comingSoon, [strategy.debtAsset.comingSoon])

  return (
    <Card
      className='group relative w-full h-full flex flex-col bg-card/20 border border-border/20 backdrop-blur-xl hover:border-border/40 transition-all duration-500 hover:shadow-lg'
      style={cardStyle}
    >
      <FlickeringGrid
        className='absolute inset-0 z-0 rounded-lg overflow-hidden'
        color={debtColor}
        squareSize={8}
        gridGap={2}
        flickerChance={0.2}
        maxOpacity={0.3}
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
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-4'>
            <div className='relative'>
              <div className='w-12 h-12 rounded-2xl overflow-hidden bg-background border border-border/20 p-2'>
                <Image
                  src={strategy.collateralAsset.icon}
                  alt={strategy.collateralAsset.symbol}
                  width={32}
                  height={32}
                  className='w-full h-full object-contain'
                />
              </div>
              <div className='absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-background/90 backdrop-blur-sm border border-border/30 p-1'>
                <Image
                  src={strategy.debtAsset.icon}
                  alt={strategy.debtAsset.symbol}
                  width={20}
                  height={20}
                  className='w-full h-full object-contain'
                />
              </div>
            </div>
            <div>
              <h3 className='font-funnel font-semibold text-foreground text-lg mb-1'>
                {strategy.collateralAsset.symbol}/{strategy.debtAsset.symbol}
              </h3>
              <p className='text-muted-foreground text-sm font-medium'>
                Supply {strategy.collateralAsset.symbol}, borrow {strategy.debtAsset.symbol}
              </p>
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
              {Math.abs(maxAPY * 100).toFixed(2)}
              <span className={`text-2xl ${netApy >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                %
              </span>
            </div>
            <p className='text-muted-foreground uppercase tracking-wider text-xs font-medium'>
              Max APY
            </p>
          </div>

          {/* Strategy Metrics */}
          <div className='grid grid-cols-2 gap-4 pt-3'>
            <div className='bg-secondary/20 rounded-lg p-3 text-center border border-border/40'>
              <p className='text-muted-foreground text-xs uppercase tracking-wider mb-1'>
                Base APY
              </p>
              <p
                className={`font-semibold text-sm ${netApy >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
              >
                {netApy >= 0 ? '+' : '-'}
                {Math.abs(netApy * 100).toFixed(2)}%
              </p>
            </div>
            <div className='bg-secondary/20 rounded-lg p-3 text-center border border-border/40'>
              <p className='text-muted-foreground text-xs uppercase tracking-wider mb-1'>
                Max Leverage
              </p>
              <p className='text-foreground font-semibold text-sm'>{leverage}</p>
            </div>
          </div>

          {/* Available Debt Section */}
          <div className='space-y-2 pt-2 '>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-semibold text-foreground'>Available Debt</span>
            </div>

            <div className='space-y-1'>
              <div className='flex justify-between items-center'>
                <span className='text-xs text-muted-foreground flex items-center gap-2'>
                  <Image
                    src={strategy.debtAsset.icon}
                    alt={strategy.debtAsset.symbol}
                    width={14}
                    height={14}
                    className='w-3.5 h-3.5'
                  />
                  {strategy.debtAsset.symbol}
                </span>
                <div className='text-sm font-medium text-foreground'>{borrowableUsd}</div>
              </div>
              <div className='flex justify-end'>
                <div className='text-xs text-muted-foreground'>{borrowTokenAmount}</div>
              </div>
            </div>
          </div>
          <Separator />

          {/* Balances Section */}
          <div className='space-y-2 pt-2'>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-semibold text-foreground'>Balances</span>
            </div>

            <div className='space-y-2'>
              {/* Deposited Balance */}
              <div className='space-y-1'>
                <div className='flex justify-between items-center'>
                  <span className='text-xs text-muted-foreground'>Deposited</span>
                  <span className='text-sm font-medium text-foreground'>
                    {activeStrategy
                      ? `$${activeStrategy.collateralAsset.usdValue.toFixed(2)}`
                      : '$0.00'}
                  </span>
                </div>
                <div className='flex justify-end'>
                  <span className='text-xs text-muted-foreground'>
                    {activeStrategy
                      ? `${activeStrategy.collateralAsset.amountFormatted.toFixed(
                          Math.min(activeStrategy.collateralAsset.decimals || 8, 6),
                        )} ${strategy.collateralAsset.symbol}`
                      : `0.${'0'.repeat(strategy.collateralAsset.decimals || 8)} ${strategy.collateralAsset.symbol}`}
                  </span>
                </div>
              </div>
              {/* Available Balance */}
              <div className='space-y-1'>
                <div className='flex justify-between items-center'>
                  <span className='text-xs text-muted-foreground'>Available</span>
                  <span className='text-sm font-medium text-foreground'>
                    {userBalanceUsd.gt(0) ? `$${userBalanceUsd.toFormat(2)}` : '$0.00'}
                  </span>
                </div>
                <div className='flex justify-end'>
                  <span className='text-xs text-muted-foreground'>{userTokenAmount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Active Strategy Details */}
          {activeStrategy && (
            <>
              <Separator />
              <div className='space-y-2 pt-2'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-semibold text-foreground'>Active Position</span>
                  <div className='px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full'>
                    Live
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-3'>
                  <div className='space-y-1'>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-muted-foreground'>Borrowed</span>
                      <span className='text-sm font-medium text-foreground'>
                        ${activeStrategy.debtAsset.usdValue.toFixed(2)}
                      </span>
                    </div>
                    <div className='flex justify-end'>
                      <span className='text-xs text-muted-foreground'>
                        {activeStrategy.debtAsset.amountFormatted.toFixed(6)}{' '}
                        {activeStrategy.debtAsset.symbol}
                      </span>
                    </div>
                  </div>

                  <div className='space-y-1'>
                    <div className='flex justify-between items-center'>
                      <span className='text-xs text-muted-foreground'>Leverage</span>
                      <span className='text-sm font-medium text-foreground'>
                        {activeStrategy.leverage.toFixed(2)}x
                      </span>
                    </div>
                    <div className='flex justify-end'>
                      <span
                        className={`text-xs font-medium ${
                          activeStrategy.isPositive
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {activeStrategy.netApy > 0 ? '+' : '-'}
                        {(activeStrategy.netApy * 100).toFixed(2)}% APY
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Flexible spacer to push content to bottom */}
          <div className='flex-1' />
        </CardContent>
      </div>
      <CardFooter className='relative z-20 pt-3'>
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

        {isWalletConnected && activeStrategy && (
          <Button
            onClick={() =>
              (window.location.href = `/strategies/deploy?strategy=${strategy.collateralAsset.symbol}-${strategy.debtAsset.symbol}&modify=true&accountId=${activeStrategy.accountId}`)
            }
            variant='outline'
            className='w-full'
            disabled={isComingSoon}
          >
            {isComingSoon ? 'Temporary Disabled' : 'Close Position'}
          </Button>
        )}

        {isWalletConnected && !activeStrategy && (
          <Button
            onClick={() =>
              (window.location.href = `/strategies/deploy?strategy=${strategy.collateralAsset.symbol}-${strategy.debtAsset.symbol}`)
            }
            variant='default'
            className='w-full'
            disabled={activeStrategiesLoading || isComingSoon}
          >
            {activeStrategiesLoading
              ? 'Loading...'
              : isComingSoon
                ? 'Temporary Disabled'
                : 'Deploy'}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
