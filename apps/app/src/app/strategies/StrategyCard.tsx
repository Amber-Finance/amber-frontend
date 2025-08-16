'use client'

import Image from 'next/image'

import { useChain } from '@cosmos-kit/react'
import { BigNumber } from 'bignumber.js'

import { Button } from '@/components/ui/Button'
import { CountingNumber } from '@/components/ui/CountingNumber'
import { FlickeringGrid } from '@/components/ui/FlickeringGrid'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
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

  const cardStyle = {
    '--collateral-color': collateralColor,
    '--debt-color': debtColor,
  } as React.CSSProperties

  return (
    <Card
      className='group relative w-full min-w-[320px] h-auto min-h-[400px] flex flex-col transition-all duration-300 hover:shadow-xl bg-card backdrop-blur-sm border'
      style={cardStyle}
    >
      <FlickeringGrid
        className='absolute inset-0 z-0 rounded-lg overflow-hidden'
        color={collateralColor}
        squareSize={8}
        gridGap={2}
        flickerChance={0.2}
        maxOpacity={0.3}
        gradientDirection='top-to-bottom'
        width={400}
        height={120}
      />

      {/* Enhanced gradient overlay for depth */}
      <div
        className='absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10'
        style={{
          background: `linear-gradient(135deg, ${collateralColor}08 0%, transparent 50%, transparent 100%)`,
        }}
      />

      <CardHeader className='pb-2 z-20 space-y-2'>
        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            <div className='relative'>
              {/* Gradient around token icon */}
              <div
                className='absolute inset-0 rounded-full blur-md scale-110 opacity-0 group-hover:opacity-100 transition-all duration-300'
                style={{
                  backgroundColor: `${collateralColor}50`,
                }}
              />
              <div
                className='relative w-10 h-10 rounded-full overflow-hidden bg-secondary/80 border-2 p-1 shadow-sm'
                style={{ borderColor: `${collateralColor}40` }}
              >
                <Image
                  src={strategy.collateralAsset.icon}
                  alt={strategy.collateralAsset.symbol}
                  fill
                  className='object-contain'
                  sizes='40px'
                />
              </div>

              {/* Debt Asset Badge */}
              <div className='absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-background border-2 border-border/80 p-1 shadow-md ring-1 ring-black/5'>
                <Image
                  src={strategy.debtAsset.icon}
                  alt={strategy.debtAsset.symbol}
                  width={16}
                  height={16}
                  className='object-contain w-full h-full'
                />
              </div>
            </div>

            <div className='flex flex-col'>
              <h3 className='text-xl font-funnel text-foreground'>
                {strategy.collateralAsset.symbol}/{strategy.debtAsset.symbol}
              </h3>
              <p className='text-sm text-foreground/80 font-medium leading-tight tracking-wider'>
                Supply {strategy.collateralAsset.symbol}, borrow {strategy.debtAsset.symbol}
              </p>
            </div>
          </div>

          {/* Max APY - New line for better layout */}
          <div className='flex justify-center'>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className='cursor-help text-center'>
                  <div
                    className='text-4xl font-bold leading-tight'
                    style={{ color: collateralColor }}
                  >
                    <CountingNumber value={maxAPY} decimalPlaces={2} />%
                  </div>
                  <div className='text-sm font-bold text-foreground/80 leading-tight tracking-wider'>
                    Max APY
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className='space-y-2 text-xs'>
                  <div className='font-semibold'>Looping Strategy at {leverage} leverage:</div>
                  <div className='space-y-1'>
                    <div>
                      • Position:{' '}
                      {(strategy.maxLeverage || strategy.multiplier || 1 + 1).toFixed(1)}{' '}
                      {strategy.collateralAsset.symbol} supplied
                    </div>
                    <div>
                      • Borrowed: {(strategy.maxLeverage || strategy.multiplier || 1).toFixed(1)}{' '}
                      {strategy.debtAsset.symbol}
                    </div>
                    <div>
                      • Formula: {(strategy.maxLeverage || strategy.multiplier || 1 + 1).toFixed(1)}{' '}
                      × {strategy.collateralAsset.symbol} APY -{' '}
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
        </div>
      </CardHeader>

      <CardContent className='relative space-y-6 z-20 flex-1 flex flex-col'>
        {/* Strategy Metrics Section */}
        <div className='space-y-3'>
          <div className='space-y-3'>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className='bg-secondary/60 rounded-lg p-3 flex justify-between items-center cursor-help border border-border/40'>
                  <div className='text-sm font-bold text-muted-foreground/70 tracking-wider'>
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
                <div className='bg-secondary/60 rounded-lg p-3 flex justify-between items-center cursor-help border border-border/40'>
                  <div className='text-sm font-bold text-muted-foreground/70 tracking-wider'>
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
        </div>

        {/* Available Collateral Section */}
        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            <span className='text-base font-bold tracking-wider text-foreground'>
              Available Collateral
            </span>
          </div>

          <div className='space-y-2'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-foreground/90'>{strategy.collateralAsset.symbol}</span>
              <div className='text-base text-foreground'>{collateralAvailable}</div>
            </div>
            <div className='flex justify-end'>
              <div className='text-xs text-muted-foreground'>
                {formatTokenAmount(collateralTokenAmount, strategy.collateralAsset.symbol)}
              </div>
            </div>
          </div>
        </div>

        {/* Available Debt Section */}
        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            <span className='text-base font-bold tracking-wider text-foreground'>
              Available Debt
            </span>
          </div>

          <div className='space-y-2'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-foreground/90'>{strategy.debtAsset.symbol}</span>
              <div className='text-base text-foreground'>{borrowableUsd}</div>
            </div>
            <div className='flex justify-end'>
              <div className='text-xs text-muted-foreground'>{borrowTokenAmount}</div>
            </div>
          </div>
        </div>

        {/* Flexible spacer to push content to bottom */}
        <div className='flex-1' />

        <Separator className='bg-border/60' />

        {/* Balances Section */}
        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            <span className='text-base font-bold tracking-wider text-foreground'>Balances</span>
          </div>

          <div className='space-y-2'>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-foreground/90'>Available Balance</span>
              <div className='text-base text-foreground'>
                {userBalanceUsd.gt(0) ? `$${userBalanceUsd.toFormat(2)}` : '$0.00'}
              </div>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-sm text-foreground/90'>Wallet Balance</span>
              <div className='text-xs text-foreground/80'>{userTokenAmount}</div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className='relative z-20 pt-1'>
        <Button
          onClick={() =>
            (window.location.href = `/strategies/deploy?strategy=${strategy.collateralAsset.symbol}-${strategy.debtAsset.symbol}`)
          }
          variant='default'
          className='w-full font-semibold'
        >
          Deploy
        </Button>
      </CardFooter>
    </Card>
  )
}
