'use client'

import Image from 'next/image'

import { useChain } from '@cosmos-kit/react'
import { BigNumber } from 'bignumber.js'

import { Button } from '@/components/ui/Button'
import { CountingNumber } from '@/components/ui/CountingNumber'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
import { Card, CardContent } from '@/components/ui/card'
import chainConfig from '@/config/chain'
import useWalletBalances from '@/hooks/useWalletBalances'
import { useStore } from '@/store/useStore'
import { formatApy, formatTokenAmount } from '@/utils/format'
import {
  calculateNetApy,
  formatBorrowTokenAmount,
  formatBorrowableUsd,
  formatCollateralAvailable,
  formatCollateralTokenAmount,
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
  const { isWalletConnected } = useChain(chainConfig.name)
  const { data: walletBalances, isLoading: walletBalancesLoading } = useWalletBalances()
  const { markets } = useStore()

  // Helper function calls
  const maxAPY = getMaxAPY(strategy)
  const userBalanceUsd = getUserBalanceUsd(
    isWalletConnected,
    walletBalancesLoading,
    walletBalances,
    strategy.collateralAsset.denom,
  )
  const netApy = calculateNetApy(strategy)
  const leverage = formatLeverage(strategy)
  const collateralAvailable = formatCollateralAvailable()
  const borrowableUsd = formatBorrowableUsd(strategy)
  const { collateralColor, debtColor } = getGradientColors(strategy)
  const collateralTokenAmount = formatCollateralTokenAmount()
  const borrowTokenAmount = formatBorrowTokenAmount(
    markets || [],
    strategy.debtAsset.denom,
    strategy.debtAsset.symbol,
  )
  const userTokenAmount = formatUserTokenAmount(
    isWalletConnected,
    walletBalancesLoading,
    walletBalances,
    strategy.collateralAsset.denom,
    strategy.collateralAsset.symbol,
  )

  return (
    <Card className='group relative w-[380px] h-auto min-h-[400px] flex flex-col transition-all duration-300 hover:shadow-xl bg-card backdrop-blur-sm border'>
      <CardContent className='p-0 flex flex-col h-full relative flex-1'>
        <div className='px-5 pb-2 flex items-start gap-2'>
          <div className='relative'>
            <div
              className='relative w-12 h-12 rounded-full overflow-hidden bg-secondary/80 border-2 p-1 shadow-sm'
              style={{ borderColor: `${collateralColor}40` }}
            >
              <Image
                src={strategy.collateralAsset.icon}
                alt={strategy.collateralAsset.symbol}
                width={32}
                height={32}
                className='w-8 h-8 object-contain'
              />
            </div>

            <div className='absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-background border-2 border-border/80 p-1 shadow-md ring-1 ring-black/5'>
              <Image
                src={strategy.debtAsset.icon}
                alt={strategy.debtAsset.symbol}
                width={16}
                height={16}
                className='w-4 h-4 object-contain'
              />
            </div>
          </div>

          <div className='flex-1'>
            <h3 className='text-xl font-funnel text-foreground mb-1'>
              {strategy.collateralAsset.symbol}/{strategy.debtAsset.symbol}
            </h3>
            <p className='text-sm text-muted-foreground/90 font-medium leading-tight'>
              Supply {strategy.collateralAsset.symbol}, borrow {strategy.debtAsset.symbol}.
            </p>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className='text-right cursor-help'>
                <div
                  className='text-2xl font-bold leading-tight'
                  style={{ color: collateralColor }}
                >
                  <CountingNumber value={maxAPY} decimalPlaces={2} />%
                </div>
                <div className='text-sm font-bold text-muted-foreground/70 leading-tight whitespace-nowrap uppercase tracking-wider'>
                  Max APY
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className='space-y-2 text-xs'>
                <div className='font-semibold'>Looping Strategy at {leverage} leverage:</div>
                <div className='space-y-1'>
                  <div>
                    • Position: {(strategy.maxLeverage || strategy.multiplier || 1 + 1).toFixed(1)}{' '}
                    {strategy.collateralAsset.symbol} supplied
                  </div>
                  <div>
                    • Borrowed: {(strategy.maxLeverage || strategy.multiplier || 1).toFixed(1)}{' '}
                    {strategy.debtAsset.symbol}
                  </div>
                  <div>
                    • Formula: {(strategy.maxLeverage || strategy.multiplier || 1 + 1).toFixed(1)} ×{' '}
                    {strategy.collateralAsset.symbol} APY -{' '}
                    {(strategy.maxLeverage || strategy.multiplier || 1).toFixed(1)} ×{' '}
                    {strategy.debtAsset.symbol} borrow rate
                  </div>
                </div>
                <div className='border-t pt-1'>
                  <div className='font-semibold'>Result: {formatApy(maxAPY)}</div>
                </div>
                {strategy.hasStakingData && (
                  <div className='border-t pt-1 text-muted-foreground text-xs'>
                    Includes staking rewards where available
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </div>

        <div className='px-5 space-y-4 flex-1'>
          <div className='grid grid-cols-2 gap-4'>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className='bg-secondary/60 rounded-lg p-3 flex flex-col items-center cursor-help border border-border/40'>
                  <div className='text-sm font-bold text-muted-foreground/70 leading-tight whitespace-nowrap uppercase tracking-wider mb-1'>
                    Base APY
                  </div>
                  <div className='text-base font-bold leading-tight text-green-500'>
                    {formatApy(netApy)}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className='space-y-2 text-xs'>
                  <div className='font-semibold'>Base APY Breakdown (1x leverage):</div>
                  <div className='space-y-1'>
                    <div>
                      • {strategy.collateralAsset.symbol} Supply:{' '}
                      {((strategy.supplyApy || 0) * 100).toFixed(2)}%
                    </div>
                    {strategy.collateralStakingApy && strategy.collateralStakingApy > 0 && (
                      <div>
                        • {strategy.collateralAsset.symbol} Staking:{' '}
                        {(strategy.collateralStakingApy * 100).toFixed(2)}%
                      </div>
                    )}
                    <div>
                      • {strategy.debtAsset.symbol} Borrow: -
                      {((strategy.borrowApy || 0) * 100).toFixed(2)}%
                    </div>
                    {strategy.hasStakingData &&
                      strategy.debtStakingApy &&
                      strategy.debtStakingApy > 0 && (
                        <div>
                          • {strategy.debtAsset.symbol} Staking: +
                          {(strategy.debtStakingApy * 100).toFixed(2)}%
                        </div>
                      )}
                  </div>
                  <div className='border-t pt-1'>
                    <div className='font-semibold'>
                      Net APY: {formatApy(calculateNetApy(strategy))}
                    </div>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className='bg-secondary/60 rounded-lg p-3 flex flex-col items-center cursor-help border border-border/40'>
                  <div className='text-sm font-bold text-muted-foreground/70 leading-tight whitespace-nowrap uppercase tracking-wider mb-1'>
                    Max Leverage
                  </div>
                  <div className='text-base font-bold leading-tight text-foreground'>
                    {leverage}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                Max leverage calculated based on your wallet balance, asset LTV, and available
                liquidity
              </TooltipContent>
            </Tooltip>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <Image
                  src={strategy.collateralAsset.icon}
                  alt={strategy.collateralAsset.symbol}
                  width={16}
                  height={16}
                  className='w-4 h-4 object-contain'
                />
                <span
                  className='text-sm font-bold tracking-wider uppercase'
                  style={{ color: collateralColor }}
                >
                  {strategy.collateralAsset.symbol}
                </span>
              </div>

              <div className='space-y-1'>
                <div className='flex justify-between items-center'>
                  <div className='text-sm text-foreground'>Available</div>
                  <div className='text-sm font-bold text-foreground'>{collateralAvailable}</div>
                </div>
                <div className='flex justify-end'>
                  <div className='text-xs text-muted-foreground'>
                    {formatTokenAmount(collateralTokenAmount, strategy.collateralAsset.symbol)}
                  </div>
                </div>
              </div>
            </div>

            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <Image
                  src={strategy.debtAsset.icon}
                  alt={strategy.debtAsset.symbol}
                  width={16}
                  height={16}
                  className='w-4 h-4 object-contain'
                />
                <span
                  className='text-sm font-bold tracking-wider uppercase'
                  style={{ color: debtColor }}
                >
                  {strategy.debtAsset.symbol}
                </span>
              </div>

              <div className='space-y-1'>
                <div className='flex justify-between items-center'>
                  <div className='text-sm text-foreground'>Borrowable</div>
                  <div className='text-sm font-bold text-foreground'>{borrowableUsd}</div>
                </div>
                <div className='flex justify-end'>
                  <div className='text-xs text-muted-foreground'>{borrowTokenAmount}</div>
                </div>
              </div>
            </div>
          </div>

          <div className='border-t border-border/30'></div>

          {/* Flexible spacer to push content to bottom */}
          <div className='flex-1' />

          <div className='space-y-2'>
            <div className='flex justify-between items-center'>
              <span className='text-sm '>Wallet Balance:</span>
              <div className='text-right'>
                <div className='text-sm font-bold text-foreground'>
                  {userBalanceUsd.gt(0) ? `$${userBalanceUsd.toFormat(2)}` : '$0.00'}
                </div>
                <div className='text-xs text-muted-foreground'>{userTokenAmount}</div>
              </div>
            </div>
          </div>
        </div>

        <div className='px-5 pt-1'>
          <Button
            onClick={() =>
              (window.location.href = `/strategies/deploy?strategy=${strategy.collateralAsset.symbol}-${strategy.debtAsset.symbol}`)
            }
            variant='default'
            className='w-full font-semibold'
          >
            Deploy
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
