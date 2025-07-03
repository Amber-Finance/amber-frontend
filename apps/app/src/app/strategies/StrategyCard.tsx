'use client'

import Image from 'next/image'

import { useChain } from '@cosmos-kit/react'
import { BigNumber } from 'bignumber.js'

import { Button } from '@/components/ui/Button'
import { CountingNumber } from '@/components/ui/CountingNumber'
import { Meteors } from '@/components/ui/Meteors'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
import { Card, CardContent } from '@/components/ui/card'
import chainConfig from '@/config/chain'
import useWalletBalances from '@/hooks/useWalletBalances'
import { useStore } from '@/store/useStore'
import { calculateUsdValue, formatApy, formatTokenAmount } from '@/utils/format'

interface StrategyCardProps {
  strategy: Strategy
}

export function StrategyCard({ strategy }: StrategyCardProps) {
  const { isWalletConnected } = useChain(chainConfig.name)
  const { data: walletBalances, isLoading: walletBalancesLoading } = useWalletBalances()
  const { markets } = useStore()

  const getMaxAPY = () => {
    const maxLeverage = calculateMaxLeverage()
    const collateralTotalApy = strategy.collateralTotalApy || strategy.supplyApy || 0
    const debtBorrowRate = strategy.borrowApy || 0
    const leveragedApy = (maxLeverage + 1) * collateralTotalApy - maxLeverage * debtBorrowRate
    return leveragedApy
  }

  const getUserBalance = () => {
    if (!isWalletConnected || walletBalancesLoading || !walletBalances) {
      return new BigNumber(0)
    }
    const collateralDenom = strategy.collateralAsset.denom
    const balance = walletBalances.find((b) => b.denom === collateralDenom)
    if (!balance) {
      return new BigNumber(0)
    }
    return new BigNumber(balance.amount)
  }

  const getAvailableDepositCapacity = () => {
    return new BigNumber('100000000000') // 1000 MAXBTC available capacity
  }

  const calculateMaxLeverage = () => {
    if (strategy.maxLeverage && strategy.maxLeverage > 1) {
      return strategy.maxLeverage
    }
    if (strategy.multiplier && strategy.multiplier > 1) {
      return strategy.multiplier
    }
    return 1
  }

  const getUserBalanceUsd = () => {
    const userBalance = getUserBalance()
    const maxBtcPrice = '95000'
    const usdValue = calculateUsdValue(userBalance.toString(), maxBtcPrice, 8)
    return new BigNumber(usdValue)
  }

  const calculateNetApy = () => {
    return strategy.netApy || 0
  }

  const formatLeverage = () => {
    return calculateMaxLeverage().toFixed(2) + 'x'
  }

  const formatCollateralAvailable = () => {
    const availableDepositCapacity = getAvailableDepositCapacity()
    const maxBtcPrice = '95000'
    const usdValue = calculateUsdValue(availableDepositCapacity.toString(), maxBtcPrice, 8)

    if (usdValue >= 1_000_000_000) {
      return `$${(usdValue / 1_000_000_000).toFixed(2)}B`
    } else if (usdValue >= 1_000_000) {
      return `$${(usdValue / 1_000_000).toFixed(2)}M`
    } else if (usdValue >= 1_000) {
      return `$${(usdValue / 1_000).toFixed(2)}K`
    }
    return `$${usdValue.toFixed(2)}`
  }

  const getAvailableBorrowCapacity = () => {
    if (!markets) return new BigNumber(0)
    const debtMarket = markets.find((m) => m.asset.denom === strategy.debtAsset.denom)
    if (!debtMarket) return new BigNumber(0)
    const totalCollateral = new BigNumber(debtMarket.metrics.collateral_total_amount || '0')
    const totalDebt = new BigNumber(debtMarket.metrics.debt_total_amount || '0')
    return BigNumber.max(0, totalCollateral.minus(totalDebt))
  }

  const formatBorrowableUsd = () => {
    return strategy.liquidityDisplay || '$0'
  }

  const getGradientColors = () => {
    const collateralColor = strategy.collateralAsset.brandColor || '#F7931A'
    const debtColor = strategy.debtAsset.brandColor || '#6B7280'
    return { collateralColor, debtColor }
  }

  const { collateralColor, debtColor } = getGradientColors()

  return (
    <Card className='group relative w-[400px] transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 backdrop-blur-sm border border-border/50 overflow-hidden text-card-foreground hover:border-border'>
      <div className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 overflow-hidden'>
        <Meteors number={15} />
      </div>

      <div
        className='absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-700 z-10 bg-gradient-to-r animate-pulse'
        style={{
          background: `linear-gradient(45deg, transparent 0%, ${collateralColor}05 25%, ${debtColor}05 75%, transparent 100%)`,
          backgroundSize: '200% 200%',
          animation: 'gradient-shift 3s ease infinite',
        }}
      />

      <CardContent className='p-0 flex flex-col h-full relative z-20'>
        <div className='px-5 pb-3 flex items-start gap-3'>
          <div className='relative group/icons'>
            <div className='relative transform group-hover/icons:scale-110 group-hover/icons:rotate-3 transition-all duration-500 ease-out'>
              <div
                className='absolute inset-0 rounded-full blur-md scale-110 opacity-0 group-hover:opacity-60 transition-all duration-500'
                style={{ backgroundColor: `${collateralColor}40` }}
              />
              <div
                className='absolute inset-0 rounded-full blur-xl scale-150 opacity-0 group-hover:opacity-30 transition-all duration-700 delay-100'
                style={{ backgroundColor: `${collateralColor}30` }}
              />
              <div
                className='relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-secondary/90 to-secondary/70 border-2 flex items-center justify-center shadow-lg backdrop-blur-sm group-hover/icons:shadow-xl transition-all duration-500'
                style={{
                  borderColor: `${collateralColor}60`,
                  boxShadow: `0 4px 20px ${collateralColor}20`,
                }}
              >
                <Image
                  src={strategy.collateralAsset.icon}
                  alt={strategy.collateralAsset.symbol}
                  width={32}
                  height={32}
                  className='w-8 h-8 object-contain group-hover/icons:scale-110 transition-transform duration-300'
                />
              </div>
            </div>

            <div className='absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-background to-background/90 border-2 border-border/80 p-1 shadow-lg ring-1 ring-black/5 transform group-hover/icons:scale-110 group-hover/icons:-rotate-6 transition-all duration-500 ease-out backdrop-blur-sm'>
              <Image
                src={strategy.debtAsset.icon}
                alt={strategy.debtAsset.symbol}
                width={16}
                height={16}
                className='w-4 h-4 object-contain group-hover/icons:scale-110 transition-transform duration-300'
              />
            </div>

            <div
              className='absolute top-1/2 left-1/2 w-0 h-0.5 opacity-0 group-hover:opacity-100 group-hover:w-8 transition-all duration-700 ease-out transform -translate-x-1/2 -translate-y-1/2'
              style={{ backgroundColor: `${debtColor}60` }}
            />
          </div>

          <div className='flex-1'>
            <h3 className='text-xl font-bold text-foreground mb-1'>
              {strategy.collateralAsset.symbol}/{strategy.debtAsset.symbol}
            </h3>
            <p className='text-sm text-muted-foreground/90 font-medium leading-tight'>
              Supply {strategy.collateralAsset.symbol}, borrow {strategy.debtAsset.symbol}.
            </p>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className='text-right group/apy cursor-help'>
                <div className='relative'>
                  <div
                    className='absolute inset-0 rounded-lg blur-lg opacity-0 group-hover:opacity-50 transition-all duration-500 scale-110'
                    style={{
                      background: `linear-gradient(135deg, ${collateralColor}20, ${debtColor}20)`,
                    }}
                  />
                  <div
                    className='text-2xl font-bold leading-tight'
                    style={{ color: collateralColor }}
                  >
                    <CountingNumber value={getMaxAPY()} decimalPlaces={2} />%
                  </div>
                </div>
                <div className='text-sm text-muted-foreground/70 font-semibold leading-tight whitespace-nowrap uppercase tracking-wide group-hover/apy:text-muted-foreground transition-colors duration-300'>
                  Max APY
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className='space-y-2 text-xs'>
                <div className='font-semibold'>
                  Looping Strategy at {formatLeverage()} leverage:
                </div>
                <div className='space-y-1'>
                  <div>
                    • Position: {(calculateMaxLeverage() + 1).toFixed(1)}{' '}
                    {strategy.collateralAsset.symbol} supplied
                  </div>
                  <div>
                    • Borrowed: {calculateMaxLeverage().toFixed(1)} {strategy.debtAsset.symbol}
                  </div>
                  <div>
                    • Formula: {(calculateMaxLeverage() + 1).toFixed(1)} ×{' '}
                    {strategy.collateralAsset.symbol} APY - {calculateMaxLeverage().toFixed(1)} ×{' '}
                    {strategy.debtAsset.symbol} borrow rate
                  </div>
                </div>
                <div className='border-t pt-1'>
                  <div className='font-semibold'>Result: {formatApy(getMaxAPY())}</div>
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

        <div className='px-5 space-y-5 flex-1'>
          <div className='grid grid-cols-2 gap-4'>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className='group/stat bg-gradient-to-br from-secondary/60 to-secondary/40 rounded-lg p-3 flex flex-col items-center cursor-help border border-border/40 transition-all duration-300 hover:bg-secondary/70 hover:border-border/60 hover:shadow-md hover:-translate-y-0.5 backdrop-blur-sm'>
                  <div className='text-sm text-muted-foreground/70 font-semibold leading-tight whitespace-nowrap uppercase tracking-wide mb-1 group-hover/stat:text-muted-foreground transition-colors duration-300'>
                    Base APY
                  </div>
                  <div className='text-base font-bold leading-tight transition-all duration-300 group-hover/stat:scale-105 text-green-500'>
                    {formatApy(calculateNetApy())}
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
                    <div className='font-semibold'>Net APY: {formatApy(calculateNetApy())}</div>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className='group/stat bg-gradient-to-br from-secondary/60 to-secondary/40 rounded-lg p-3 flex flex-col items-center cursor-help border border-border/40 transition-all duration-300 hover:bg-secondary/70 hover:border-border/60 hover:shadow-md hover:-translate-y-0.5 backdrop-blur-sm'>
                  <div className='text-sm text-muted-foreground/70 font-semibold leading-tight whitespace-nowrap uppercase tracking-wide mb-1 group-hover/stat:text-muted-foreground transition-colors duration-300'>
                    Max Leverage
                  </div>
                  <div className='text-base font-bold leading-tight text-foreground transition-all duration-300 group-hover/stat:scale-105'>
                    {formatLeverage()}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                Max leverage calculated based on your wallet balance, asset LTV, and available
                liquidity
              </TooltipContent>
            </Tooltip>
          </div>

          <div className='grid grid-cols-2 gap-5'>
            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <Image
                  src={strategy.collateralAsset.icon}
                  alt={strategy.collateralAsset.symbol}
                  width={16}
                  height={16}
                  className='w-4 h-4 object-contain'
                />
                <span
                  className='text-sm font-bold tracking-wide'
                  style={{ color: collateralColor }}
                >
                  {strategy.collateralAsset.symbol}
                </span>
              </div>

              <div className='space-y-2'>
                <div className='flex justify-between items-center'>
                  <div className='text-sm text-foreground'>Available</div>
                  <div className='text-sm font-bold text-foreground'>
                    {formatCollateralAvailable()}
                  </div>
                </div>
                <div className='flex justify-end'>
                  <div className='text-xs text-muted-foreground'>
                    {(() => {
                      const availableDepositCapacity = getAvailableDepositCapacity()
                      const formatted = availableDepositCapacity
                        .dividedBy(new BigNumber(10).pow(8))
                        .toNumber()

                      return formatTokenAmount(formatted, strategy.collateralAsset.symbol)
                    })()}
                  </div>
                </div>
              </div>
            </div>

            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <Image
                  src={strategy.debtAsset.icon}
                  alt={strategy.debtAsset.symbol}
                  width={16}
                  height={16}
                  className='w-4 h-4 object-contain'
                />
                <span className='text-sm font-bold tracking-wide' style={{ color: debtColor }}>
                  {strategy.debtAsset.symbol}
                </span>
              </div>

              <div className='space-y-2'>
                <div className='flex justify-between items-center'>
                  <div className='text-sm text-foreground'>Borrowable</div>
                  <div className='text-sm font-bold text-foreground'>{formatBorrowableUsd()}</div>
                </div>
                <div className='flex justify-end'>
                  <div className='text-xs text-muted-foreground'>
                    {(() => {
                      const availableBorrowCapacity = getAvailableBorrowCapacity()

                      if (!markets) return formatTokenAmount(0, strategy.debtAsset.symbol)

                      const debtMarket = markets.find(
                        (m) => m.asset.denom === strategy.debtAsset.denom,
                      )

                      if (!debtMarket) return formatTokenAmount(0, strategy.debtAsset.symbol)

                      const formatted = availableBorrowCapacity
                        .dividedBy(new BigNumber(10).pow(debtMarket.asset.decimals || 6))
                        .toNumber()

                      return formatTokenAmount(formatted, strategy.debtAsset.symbol)
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='border-t border-border/30'></div>

          <div className='space-y-3'>
            <div className='flex justify-between items-center'>
              <span className='text-sm '>Wallet Balance:</span>
              <div className='text-right'>
                <div className='text-sm font-bold text-foreground'>
                  {(() => {
                    const userBalanceUsd = getUserBalanceUsd()
                    return userBalanceUsd.gt(0) ? `$${userBalanceUsd.toFormat(2)}` : '$0.00'
                  })()}
                </div>
                <div className='text-xs text-muted-foreground'>
                  {(() => {
                    const userBalance = getUserBalance()
                    const tokenAmount = userBalance.dividedBy(new BigNumber(10).pow(8)).toNumber()

                    return formatTokenAmount(tokenAmount, strategy.collateralAsset.symbol)
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='px-5 pt-3'>
          <div className='relative group/button'>
            <div
              className='absolute inset-0 rounded-lg blur-md opacity-0 group-hover/button:opacity-50 transition-all duration-500 scale-105'
              style={{
                background: `linear-gradient(135deg, ${collateralColor}, ${debtColor})`,
              }}
            />
            <div
              className='relative p-[2px] rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 ease-out group/btn-wrapper'
              style={{
                background: `linear-gradient(135deg, ${collateralColor}, ${debtColor})`,
              }}
            >
              <Button
                onClick={() =>
                  (window.location.href = `/strategies/deploy?strategy=${strategy.collateralAsset.symbol}-${strategy.debtAsset.symbol}`)
                }
                variant='outline'
                className='relative w-full font-semibold text-foreground border-0 bg-card hover:bg-background/90 transition-all duration-300 ease-out overflow-hidden group/btn rounded-md'
              >
                <div
                  className='absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-700'
                  style={{
                    background: `linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)`,
                    transform: 'translateX(-100%)',
                  }}
                />
                <span className='relative z-10'>Deploy</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
