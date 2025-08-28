'use client'

import { useEffect, useMemo, useState } from 'react'

import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'

import { useChain } from '@cosmos-kit/react'
import { BigNumber } from 'bignumber.js'
import { ArrowLeft, ArrowRight, Info, RotateCcw, Target, TrendingUp, Wallet } from 'lucide-react'

import { StrategyFlow } from '@/app/strategies/deploy/StrategyFlow'
import { AmountInput } from '@/components/ui/AmountInput'
import { Button } from '@/components/ui/Button'
import { CountingNumber } from '@/components/ui/CountingNumber'
import { FlickeringGrid } from '@/components/ui/FlickeringGrid'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import chainConfig from '@/config/chain'
import { useActiveStrategies } from '@/hooks/useActiveStrategies'
import useHealthComputer from '@/hooks/useHealthComputer'
import { usePrices } from '@/hooks/usePrices'
import useWalletBalances from '@/hooks/useWalletBalances'
import { useStore } from '@/store/useStore'
import { type StrategyParams, useBroadcast } from '@/utils/broadcast'
import { formatCurrency } from '@/utils/format'
import { getMaxLeverageForStrategy } from '@/utils/maxLeverageCalculator'

interface StrategyDeployClientProps {
  strategy: Strategy
}

export default function StrategyDeployClient({ strategy }: StrategyDeployClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [collateralAmount, setCollateralAmount] = useState('')
  const [multiplier, setMultiplier] = useState(1.5)
  const [isProcessing, setIsProcessing] = useState(false)

  const { isWasmReady } = useHealthComputer()
  const { markets } = useStore()
  const { executeTransaction } = useBroadcast()

  // Wallet and balance data
  const { address } = useChain(chainConfig.name)
  const { data: walletBalances, isLoading: isBalancesLoading } = useWalletBalances()
  const { activeStrategies } = useActiveStrategies()
  usePrices() // Initialize price fetching

  // Check if we're modifying an existing position
  const isModifying = searchParams.get('modify') === 'true'
  const modifyingAccountId = searchParams.get('accountId')

  const activeStrategy = activeStrategies.find(
    (active) =>
      active.collateralAsset.symbol === strategy.collateralAsset.symbol &&
      active.debtAsset.symbol === strategy.debtAsset.symbol,
  )

  // If modifying, pre-fill with current position data
  useEffect(() => {
    if (isModifying && activeStrategy) {
      // Set current leverage as starting point for modification
      setMultiplier(activeStrategy.leverage)
    }
  }, [isModifying, activeStrategy])

  // Use health computer to calculate dynamic max leverage

  // Find active strategy for this collateral/debt pair

  // Strategy deployment function
  const deployStrategy = async (params: {
    collateralAmount: number
    collateralDenom: string
    collateralDecimals: number
    borrowAmount: number
    borrowDenom: string
    borrowDecimals: number
    swapRoute: any
    swapDestDenom: string
    multiplier: number
    strategy: Strategy
    accountId?: string
  }) => {
    const { BigNumber } = await import('bignumber.js')

    // Format amounts for the blockchain
    const formattedCollateralAmount = new BigNumber(params.collateralAmount)
      .shiftedBy(params.collateralDecimals)
      .integerValue(BigNumber.ROUND_DOWN)
      .toString()

    const formattedBorrowAmount = new BigNumber(params.borrowAmount)
      .shiftedBy(params.borrowDecimals)
      .integerValue(BigNumber.ROUND_DOWN)
      .toString()

    // Prepare the actions for the credit manager
    const actions = [
      // 1. Deposit collateral
      {
        deposit: {
          denom: params.collateralDenom,
          amount: formattedCollateralAmount,
        },
      },
      // 2. Borrow debt asset
      {
        borrow: {
          denom: params.borrowDenom,
          amount: formattedBorrowAmount,
        },
      },
      // 3. Execute swap route
      {
        swap_exact_in: {
          coin_in: {
            denom: params.borrowDenom,
            amount: formattedBorrowAmount,
          },
          denom_out: params.swapDestDenom, // wBTC.eureka collateral
          slippage: params.swapRoute.slippage || '0.5',
          route: params.swapRoute,
        },
      },
    ]

    // Create strategy deployment or modification transaction
    const strategyParams: StrategyParams = {
      type: 'strategy',
      strategyType: params.accountId ? 'update' : 'create',
      accountKind: 'default',
      accountId: params.accountId,
      actions,
      collateralAmount: params.collateralAmount.toString(),
      multiplier: params.multiplier,
    }

    // Execute the transaction
    const actionType = params.accountId ? 'Modifying' : 'Deploying'
    const successType = params.accountId ? 'modified' : 'deployed'

    return await executeTransaction(strategyParams, {
      pending: `${actionType} ${params.strategy.collateralAsset.symbol}/${params.strategy.debtAsset.symbol} strategy...`,
      success: `Strategy ${successType} successfully at ${params.multiplier.toFixed(2)}x leverage!`,
      error: `Strategy ${params.accountId ? 'modification' : 'deployment'} failed`,
    })
  }

  // Use the utility function to get max leverage for this strategy (memoized)
  const dynamicMaxLeverage = useMemo(
    () => getMaxLeverageForStrategy(strategy, markets || [], isWasmReady),
    [strategy, markets, isWasmReady],
  )

  // Parse current amount early so it can be used in useEffect dependencies
  const currentAmount = parseFloat(collateralAmount || '0')

  // Get market data for collateral and debt assets
  const collateralMarket = markets?.find((m) => m.asset.denom === strategy.collateralAsset.denom)
  const debtMarket = markets?.find((m) => m.asset.denom === strategy.debtAsset.denom)

  // Get user wallet balance for collateral asset
  const userWalletBalance = walletBalances?.find(
    (balance) => balance.denom === strategy.collateralAsset.denom,
  )
  const userBalance = userWalletBalance
    ? new BigNumber(userWalletBalance.amount)
        .shiftedBy(-(strategy.collateralAsset.decimals || 6))
        .toNumber()
    : 0

  // Get current asset price (for display)
  const currentPrice = collateralMarket?.price?.price
    ? new BigNumber(collateralMarket.price.price).toNumber()
    : 0

  // Get dynamic APY rates from market data
  const collateralSupplyApy = collateralMarket?.metrics?.liquidity_rate
    ? new BigNumber(collateralMarket.metrics.liquidity_rate).toNumber()
    : strategy.supplyApy || 0

  const debtBorrowApy = debtMarket?.metrics?.borrow_rate
    ? new BigNumber(debtMarket.metrics.borrow_rate).toNumber()
    : strategy.borrowApy || 0

  // Validation states
  const isWalletConnected = !!address
  const hasValidAmount = collateralAmount && currentAmount > 0
  const hasInsufficientBalance = currentAmount > userBalance

  // Helper functions for display
  const getWalletBalanceDisplay = () => {
    if (isBalancesLoading) return 'Loading...'
    if (!isWalletConnected) return 'N/A - Connect Wallet'
    if (userBalance > 0) return `${formatBalance(userBalance)} ${strategy.collateralAsset.symbol}`
    return `0.000000 ${strategy.collateralAsset.symbol}`
  }

  const getUsdValue = (amount: number) => {
    return currentPrice > 0 ? formatUsd(amount * currentPrice) : 'N/A'
  }

  const getCurrentPriceDisplay = () => {
    return currentPrice > 0 ? `$${currentPrice.toLocaleString()}` : 'N/A'
  }

  const getSupplyApyDisplay = () => {
    return collateralSupplyApy > 0 ? `${(collateralSupplyApy * 100).toFixed(2)}%` : 'N/A'
  }

  const getBorrowApyDisplay = () => {
    return debtBorrowApy > 0 ? `${(debtBorrowApy * 100).toFixed(2)}%` : 'N/A'
  }

  const getAvailableLiquidityDisplay = () => {
    if (debtMarket?.metrics?.collateral_total_amount) {
      return new BigNumber(debtMarket.metrics.collateral_total_amount)
        .shiftedBy(-(strategy.debtAsset.decimals || 6))
        .toFixed(2)
    }
    return strategy.liquidityDisplay || 'N/A'
  }

  const getEstimatedEarningsUsd = () => {
    if (currentPrice > 0) {
      return `~${isRisky ? '-' : ''}${formatUsd(Math.abs(estimatedYearlyEarnings) * currentPrice)}`
    }
    return 'N/A'
  }

  const getButtonContent = () => {
    if (isProcessing) {
      return (
        <>
          <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2' />
          {isModifying ? 'Modifying Position...' : 'Opening Position...'}
        </>
      )
    }
    if (!isWalletConnected) return <>Connect Wallet</>
    if (isBalancesLoading) return <>Loading Balance...</>
    if (hasInsufficientBalance) return <>Insufficient Balance</>
    // TODO: Re-enable risk warnings in production
    // if (isRisky) return <>⚠️ Negative Yield Spread</>
    if (!hasValidAmount) return <>Enter Amount</>
    return (
      <>
        {isModifying ? 'Modify Position' : 'Open Position'}
        <ArrowRight className='w-4 h-4 ml-2' />
      </>
    )
  }

  const getRiskColorClasses = () => {
    // TODO: Re-enable risk-based styling in production
    // if (isRisky) {
    //   return 'bg-red-500/10 border-red-500/30 dark:bg-red-900/20 dark:border-red-700/40'
    // }
    // if (yieldSpread > 0.02) {
    //   return 'bg-emerald-500/10 border-emerald-500/30 dark:bg-emerald-900/20 dark:border-emerald-700/40'
    // }
    // return 'bg-amber-500/10 border-amber-500/30 dark:bg-amber-900/20 dark:border-amber-700/30'
    return 'bg-emerald-500/10 border-emerald-500/30 dark:bg-emerald-900/20 dark:border-emerald-700/40'
  }

  const getRiskTextColor = () => {
    // TODO: Re-enable risk-based styling in production
    // if (isRisky) return 'text-red-600 dark:text-red-400'
    // if (yieldSpread > 0.02) return 'text-emerald-600 dark:text-emerald-400'
    // return 'text-amber-600 dark:text-amber-400'
    return 'text-emerald-600 dark:text-emerald-400'
  }

  const getRiskSubtextColor = () => {
    // TODO: Re-enable risk-based styling in production
    // if (isRisky) return 'text-red-700/80 dark:text-red-400/80'
    // if (yieldSpread > 0.02) return 'text-emerald-700/80 dark:text-emerald-400/80'
    // return 'text-amber-700/80 dark:text-amber-400/80'
    return 'text-emerald-700/80 dark:text-emerald-400/80'
  }

  const getRiskDescription = () => {
    // TODO: Re-enable risk-based descriptions in production
    // if (isRisky) return "Negative spread - You're paying more than earning"
    // if (yieldSpread > 0.02) return 'Healthy positive spread'
    // return 'Low but positive spread'
    return 'Healthy positive spread'
  }

  const getStrategyRiskColorClasses = () => {
    return isCorrelatedStrategy
      ? 'bg-blue-500/10 border-blue-500/20 dark:bg-blue-900/20 dark:border-blue-700/30'
      : 'bg-amber-500/10 border-amber-500/20 dark:bg-amber-900/20 dark:border-amber-700/30'
  }

  const getStrategyRiskTextColor = () => {
    return isCorrelatedStrategy
      ? 'text-blue-700 dark:text-blue-400'
      : 'text-amber-700 dark:text-amber-400'
  }

  const getStrategyRiskSubtextColor = () => {
    return isCorrelatedStrategy
      ? 'text-blue-700/80 dark:text-blue-400/80'
      : 'text-amber-700/80 dark:text-amber-400/80'
  }

  // Ensure multiplier doesn't exceed max leverage and recalculate when amount changes
  useEffect(() => {
    if (multiplier > dynamicMaxLeverage) {
      setMultiplier(Math.min(multiplier, dynamicMaxLeverage))
    }
  }, [dynamicMaxLeverage, multiplier, currentAmount, isWasmReady])

  const formatBalance = (balance: number) => {
    if (balance <= 0) return '0.000000'
    return balance.toFixed(6)
  }

  const formatUsd = (usd: number) => formatCurrency(usd, 2)

  const handleDeploy = async () => {
    if (!collateralAmount || currentAmount <= 0) return

    if (isModifying) {
      console.log(
        `Modifying strategy: ${collateralAmount} ${strategy.collateralAsset.symbol} at ${multiplier}x leverage`,
      )
    } else {
      console.log(
        `Deploying strategy: ${collateralAmount} ${strategy.collateralAsset.symbol} at ${multiplier}x leverage`,
      )
    }
    setIsProcessing(true)

    try {
      // Import route function
      const { route } = await import('@skip-go/client')
      const { BigNumber } = await import('bignumber.js')

      // Calculate borrow amount
      const borrowAmount = currentAmount * (multiplier - 1)
      const formattedBorrowAmount = new BigNumber(borrowAmount)
        .shiftedBy(strategy.debtAsset.decimals || 6)
        .integerValue(BigNumber.ROUND_DOWN)
        .toString()

      // Fetch swap route from debt asset back to wBTC.eureka (Eureka bridge has better liquidity)
      const routeResult = await route({
        amount_in: formattedBorrowAmount,
        source_asset_denom: strategy.debtAsset.denom,
        source_asset_chain_id: chainConfig.id,
        dest_asset_denom: strategy.collateralAsset.denom, // wBTC.eureka
        dest_asset_chain_id: chainConfig.id,
        smart_relay: true,
        experimental_features: ['hyperlane', 'stargate', 'eureka', 'layer_zero'],
        allow_multi_tx: true,
        allow_unsafe: true,
        smart_swap_options: {
          split_routes: true,
          evm_swaps: true,
        },
        go_fast: false,
        cumulative_affiliate_fee_bps: '0',
      } as any)

      if (!routeResult) {
        throw new Error('Could not find swap route for strategy')
      }

      // Deploy or modify the strategy
      const result = await deployStrategy({
        collateralAmount: currentAmount,
        collateralDenom: strategy.collateralAsset.denom,
        collateralDecimals: strategy.collateralAsset.decimals || 6,
        borrowAmount,
        borrowDenom: strategy.debtAsset.denom,
        borrowDecimals: strategy.debtAsset.decimals || 6,
        swapRoute: routeResult,
        swapDestDenom: strategy.collateralAsset.denom, // wBTC.eureka
        multiplier,
        strategy,
        accountId: isModifying ? modifyingAccountId || undefined : undefined,
      })

      if (result.success) {
        console.log('Strategy deployed successfully!')
        // Optionally redirect to positions page or strategy details
        // router.push('/positions')
      }
    } catch (error) {
      console.error('Strategy deployment failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleMultiplierChange = (value: number[]) => {
    const newMultiplier = value[0]
    // Ensure the new value is within bounds
    if (newMultiplier >= 1 && newMultiplier <= dynamicMaxLeverage) {
      setMultiplier(newMultiplier)
    }
  }

  const borrowAmount = currentAmount * (multiplier - 1)
  const totalPosition = currentAmount * multiplier

  // Dynamic APY calculation based on multiplier (using real market data)

  // Leverage multiplier calculations
  // - borrowAmount: How much we borrow (multiplier - 1) * collateral
  // - totalPosition: Total exposure (multiplier * collateral)
  // - leveragedApy: Net APY after accounting for leverage costs
  const leveragedApy = multiplier * collateralSupplyApy - (multiplier - 1) * debtBorrowApy

  // Calculate yield spread (key risk metric for correlated assets)
  const yieldSpread = collateralSupplyApy - debtBorrowApy
  // TODO: Re-enable risk warnings in production
  // const isRisky = yieldSpread < 0 // Risk when borrow rate > collateral APY
  const isRisky = false // Temporarily disabled for testing

  // Calculate estimated annual earnings properly (convert from decimal to amount)
  const estimatedYearlyEarnings = currentAmount * leveragedApy

  // Add debugging info
  console.log('Strategy leverage info:', {
    ltv: strategy.ltv,
    liquidationThreshold: strategy.liquidationThreshold,
    strategyMaxLeverage: strategy.maxLeverage,
    calculatedMaxLeverage: dynamicMaxLeverage,
    currentMultiplier: multiplier,
  })

  // For correlated LSTs (same price source), liquidation occurs when borrow rate > supply rate
  // This chips away at collateral over time, increasing effective leverage
  // If already at max leverage, partial liquidation occurs
  const isCorrelatedStrategy = strategy.isCorrelated
  const liquidationThreshold = strategy.liquidationThreshold || 0.85

  // Liquidation mechanism for correlated assets:
  // - No price-based liquidation since assets move together
  // - Liquidation happens when yield spread is negative (borrow > supply)
  // - Negative spread erodes collateral, increasing leverage ratio
  // - At max leverage, partial liquidation occurs to maintain position
  const liquidationPrice = null // Not applicable for correlated assets

  return (
    <div className='w-full max-w-7xl mx-auto px-4 py-4'>
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className='flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer mb-3'
      >
        <ArrowLeft className='w-4 h-4' />
        Back to Strategies
      </button>

      {/* Header with FlickeringGrid */}
      <div className='relative mb-4'>
        <div className='absolute inset-0 z-10 w-full overflow-hidden rounded-lg'>
          <FlickeringGrid
            className='w-full h-full'
            color={strategy.debtAsset.brandColor}
            squareSize={8}
            gridGap={2}
            flickerChance={0.2}
            maxOpacity={0.2}
            gradientDirection='top-to-bottom'
            height={80}
          />
        </div>

        <div className='relative z-20 p-3 rounded-lg border border-border/50 bg-card/80 backdrop-blur-sm'>
          <div className='flex justify-between items-start'>
            <div className='flex items-center gap-3'>
              {/* Token Icons */}
              <div className='relative'>
                <div className='w-10 h-10 rounded-full overflow-hidden bg-secondary/80 border border-border/60 p-1'>
                  <Image
                    src={strategy.collateralAsset.icon}
                    alt={strategy.collateralAsset.symbol}
                    fill
                    className='object-contain'
                  />
                </div>
                <div className='absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-background border-2 border-border/80 p-1'>
                  <Image
                    src={strategy.debtAsset.icon}
                    alt={strategy.debtAsset.symbol}
                    width={12}
                    height={12}
                    className='object-contain'
                  />
                </div>
              </div>

              <div>
                <h1 className='text-lg font-semibold text-foreground'>
                  {isModifying ? 'Modify' : 'Deploy'} {strategy.collateralAsset.symbol}/
                  {strategy.debtAsset.symbol} Strategy
                </h1>
                <p className='text-xs text-muted-foreground'>
                  {isModifying
                    ? `Modify your existing position - increase/decrease leverage or collateral`
                    : `Supply ${strategy.collateralAsset.symbol}, borrow ${strategy.debtAsset.symbol}, leverage your position`}
                </p>
              </div>
            </div>

            <div className='text-right'>
              <div className='text-lg font-semibold text-accent-foreground'>
                <CountingNumber value={leveragedApy * 100} decimalPlaces={2} />%
              </div>
              <div className='text-xs text-muted-foreground'>Current APY</div>
            </div>
          </div>

          {/* Strategy Type */}
          <div className='mt-2'>
            <div className='flex items-center gap-2 text-xs font-medium text-muted-foreground'>
              <Target className='w-3 h-3 text-accent-foreground' />
              Multiply Strategy
            </div>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
        {/* Left Column - Strategy Input */}
        <div className='lg:col-span-2 space-y-4'>
          {/* Margin Collateral Card */}
          <Card>
            <CardHeader className='pb-1'>
              <CardTitle className='flex items-center gap-2 text-sm font-semibold'>
                <Wallet className='w-4 h-4 text-accent-foreground' />
                Margin Collateral
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <div className='flex justify-between items-center text-xs'>
                <span className='text-muted-foreground'>Wallet balance</span>
                <span className='font-medium text-foreground'>{getWalletBalanceDisplay()}</span>
              </div>

              <AmountInput
                value={collateralAmount}
                onChange={(e) => setCollateralAmount(e.target.value)}
                token={{
                  symbol: strategy.collateralAsset.symbol,
                  brandColor: strategy.collateralAsset.brandColor || '#F7931A',
                }}
                usdValue={getUsdValue(currentAmount || 0)}
                balance={userBalance.toString()}
              />

              <Separator />

              <div className='space-y-2'>
                <div className='flex justify-between items-center'>
                  <span className='text-xs font-medium text-foreground'>Multiplier</span>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-semibold text-accent-foreground'>
                      {multiplier.toFixed(2)}x
                    </span>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className='w-3 h-3 text-muted-foreground hover:text-foreground transition-colors' />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className='text-xs max-w-xs'>
                          Leverage multiplier: {multiplier}x means you'll have {multiplier}x
                          exposure to {strategy.collateralAsset.symbol}. You supply{' '}
                          {currentAmount.toFixed(6)} and borrow{' '}
                          {(currentAmount * (multiplier - 1)).toFixed(6)}{' '}
                          {strategy.debtAsset.symbol}.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                <Slider
                  value={[multiplier]}
                  onValueChange={handleMultiplierChange}
                  max={dynamicMaxLeverage}
                  min={1}
                  step={0.01}
                  className='w-full'
                  brandColor={strategy.collateralAsset.brandColor || '#F7931A'}
                />

                <div className='flex justify-between text-xs text-muted-foreground'>
                  <span>1.0x</span>
                  <span>Max {dynamicMaxLeverage.toFixed(1)}x</span>
                </div>

                {/* Leverage Breakdown */}
                <div className='p-2 rounded-lg bg-muted/20 border border-border/50'>
                  <div className='text-xs space-y-1'>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Your collateral:</span>
                      <span className='font-medium'>
                        {currentAmount.toFixed(6)} {strategy.collateralAsset.symbol}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Borrow amount:</span>
                      <span className='font-medium'>
                        {borrowAmount.toFixed(6)} {strategy.debtAsset.symbol}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Total exposure:</span>
                      <span className='font-medium'>
                        {totalPosition.toFixed(6)} {strategy.collateralAsset.symbol}
                      </span>
                    </div>
                    <Separator />
                    <div className='flex justify-between items-center'>
                      <span className='text-muted-foreground'>Leverage ratio:</span>
                      <span className='font-medium'>
                        {currentAmount > 0 ? (totalPosition / currentAmount).toFixed(2) : '0.00'}x
                      </span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-muted-foreground'>Borrow ratio:</span>
                      <span className='font-medium'>
                        {currentAmount > 0 ? (borrowAmount / currentAmount).toFixed(2) : '0.00'}x
                      </span>
                    </div>
                    <Separator />
                    <div className='flex justify-between items-center'>
                      <span className='text-muted-foreground'>Max leverage:</span>
                      <span className='font-medium text-accent-foreground'>
                        {dynamicMaxLeverage.toFixed(2)}x
                      </span>
                    </div>
                    <div className='text-xs text-muted-foreground/80'>
                      Based on liquidation threshold:{' '}
                      {(strategy.liquidationThreshold || 0.85) * 100}%
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Position Overview Card */}
          <Card>
            <CardHeader className='pb-1'>
              <CardTitle className='flex items-center gap-2 text-sm font-semibold'>
                <Target className='w-4 h-4 text-accent-foreground' />
                Position Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                <div className='space-y-2'>
                  <div className='space-y-1'>
                    <div className='flex justify-between items-center text-xs'>
                      <span className='text-muted-foreground'>Current price</span>
                      <span className='font-medium text-foreground'>
                        {getCurrentPriceDisplay()}
                      </span>
                    </div>
                    <div className='flex justify-between items-center text-xs'>
                      <span className='text-muted-foreground'>Liquidation mechanism</span>
                      <div className='flex items-center gap-1'>
                        <span className='font-medium text-orange-600 dark:text-orange-400'>
                          Yield-based
                        </span>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className='w-3 h-3 text-muted-foreground hover:text-foreground transition-colors' />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className='text-xs max-w-xs'>
                              Liquidation occurs when borrow rate &gt; supply rate. Negative yield
                              spread erodes collateral over time, increasing leverage. At max
                              leverage, partial liquidation occurs.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className='space-y-1'>
                    <div className='flex justify-between items-center text-xs'>
                      <span className='text-muted-foreground'>Long exposure</span>
                      <div className='text-right'>
                        <div className='font-medium text-foreground'>
                          {totalPosition.toFixed(6)} {strategy.collateralAsset.symbol}
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          ~{getUsdValue(totalPosition)}
                        </div>
                      </div>
                    </div>

                    <div className='flex justify-between items-center text-xs'>
                      <span className='text-muted-foreground'>Short exposure</span>
                      <div className='text-right'>
                        <div className='font-medium text-foreground'>
                          {borrowAmount.toFixed(6)} {strategy.debtAsset.symbol}
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          ~{getUsdValue(borrowAmount)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='space-y-2'>
                  {/* Risk Warning for Negative Yield Spread */}
                  {/* TODO: Re-enable risk warnings in production */}
                  {/* {isRisky && (
                    <div className='p-2 rounded-lg bg-red-500/10 border border-red-500/30 dark:bg-red-900/20 dark:border-red-700/40'>
                      <div className='text-xs text-red-700 dark:text-red-400 font-medium mb-1'>
                        High Risk Position
                      </div>
                      <div className='text-xs text-red-700/80 dark:text-red-400/80'>
                        Borrow rate ({(debtBorrowApy * 100).toFixed(2)}%) exceeds supply APY (
                        {(collateralSupplyApy * 100).toFixed(2)}%). You'll lose money over time.
                      </div>
                    </div>
                  )} */}

                  <div
                    className={`p-2 rounded-lg border ${
                      // TODO: Re-enable risk-based styling in production
                      // isRisky
                      //   ? 'bg-red-500/10 border-red-500/20 dark:bg-red-900/20 dark:border-red-700/30'
                      //   : 'bg-emerald-500/10 border-emerald-500/20 dark:bg-emerald-900/20 dark:border-emerald-700/30'
                      'bg-emerald-500/10 border-emerald-500/20 dark:bg-emerald-900/20 dark:border-emerald-700/30'
                    }`}
                  >
                    <div
                      className={`text-xs font-medium mb-1 ${
                        // TODO: Re-enable risk-based styling in production
                        // isRisky
                        //   ? 'text-red-700 dark:text-red-400'
                        //   : 'text-emerald-700 dark:text-emerald-400'
                        'text-emerald-700 dark:text-emerald-400'
                      }`}
                    >
                      Est. Annual Earnings
                    </div>
                    <div
                      className={`font-semibold text-sm ${
                        // TODO: Re-enable risk-based styling in production
                        // isRisky
                        //   ? 'text-red-600 dark:text-red-300'
                        //   : 'text-emerald-600 dark:text-emerald-300'
                        'text-emerald-600 dark:text-emerald-300'
                      }`}
                    >
                      {Math.abs(estimatedYearlyEarnings).toFixed(6)}{' '}
                      {strategy.collateralAsset.symbol}
                    </div>
                    <div
                      className={`text-xs ${
                        // TODO: Re-enable risk-based styling in production
                        // isRisky
                        //   ? 'text-red-600/80 dark:text-red-400/80'
                        //   : 'text-emerald-600/80 dark:text-red-400/80'
                        'text-emerald-600/80 dark:text-emerald-400/80'
                      }`}
                    >
                      {getEstimatedEarningsUsd()}
                    </div>
                  </div>

                  <div className='space-y-1 text-xs'>
                    <div className='flex justify-between items-center'>
                      <span className='text-muted-foreground'>ROE</span>
                      <Tooltip>
                        <TooltipTrigger>
                          <span className='font-medium text-foreground cursor-help'>0.00%</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className='text-xs'>Current return on equity based on price change</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    <div className='flex justify-between items-center'>
                      <span className='text-muted-foreground'>Your LTV (LLTV)</span>
                      <span className='font-medium text-foreground'>∞ (-%)</span>
                    </div>

                    <div className='flex justify-between items-center'>
                      <span className='text-muted-foreground'>Your health</span>
                      <span className='font-medium text-foreground'>-</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strategy Flow Card */}
          <Card>
            <CardHeader className='pb-1'>
              <CardTitle className='flex items-center gap-2 text-sm font-semibold'>
                <RotateCcw className='w-4 h-4 text-muted-foreground' />
                Strategy Flow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <StrategyFlow />

                {/* Flow Explanations */}
                <div className='grid grid-cols-1 md:grid-cols-4 gap-2 text-xs'>
                  <div className='text-center space-y-1'>
                    <div className='flex items-center justify-center'>
                      <Wallet className='w-3 h-3 text-accent-foreground' />
                    </div>
                    <div className='font-medium text-foreground'>1. Deposit</div>
                    <div className='text-muted-foreground text-xs'>
                      Supply {strategy.collateralAsset.symbol} as collateral to the protocol
                    </div>
                  </div>

                  <div className='text-center space-y-1'>
                    <div className='flex items-center justify-center'>
                      <ArrowRight className='w-3 h-3 text-accent-foreground' />
                    </div>
                    <div className='font-medium text-foreground'>2. Borrow</div>
                    <div className='text-muted-foreground text-xs'>
                      Borrow {strategy.debtAsset.symbol} against your{' '}
                      {strategy.collateralAsset.symbol} collateral
                    </div>
                  </div>

                  <div className='text-center space-y-1'>
                    <div className='flex items-center justify-center'>
                      <RotateCcw className='w-3 h-3 text-accent-foreground' />
                    </div>
                    <div className='font-medium text-foreground'>3. Swap</div>
                    <div className='text-muted-foreground text-xs'>
                      Swap borrowed {strategy.debtAsset.symbol} for more{' '}
                      {strategy.collateralAsset.symbol}
                    </div>
                  </div>

                  <div className='text-center space-y-1'>
                    <div className='flex items-center justify-center'>
                      <TrendingUp className='w-3 h-3 text-accent-foreground' />
                    </div>
                    <div className='font-medium text-foreground'>4. Re-deposit</div>
                    <div className='text-muted-foreground text-xs'>
                      Supply new {strategy.collateralAsset.symbol} to multiply your position
                    </div>
                  </div>
                </div>

                {/* Active Strategy Display */}
                {activeStrategy && (
                  <div className='p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'>
                    <div className='flex items-center gap-2 mb-3'>
                      <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse' />
                      <h3 className='text-sm font-semibold text-green-700 dark:text-green-400'>
                        Active Position
                      </h3>
                    </div>

                    <div className='grid grid-cols-2 gap-4 text-xs'>
                      <div>
                        <div className='text-muted-foreground'>Collateral Supplied</div>
                        <div className='font-semibold'>
                          {activeStrategy.collateralAsset.amountFormatted.toFixed(6)}{' '}
                          {activeStrategy.collateralAsset.symbol}
                        </div>
                        <div className='text-muted-foreground'>
                          ${activeStrategy.collateralAsset.usdValue.toFixed(2)}
                        </div>
                      </div>

                      <div>
                        <div className='text-muted-foreground'>Debt Borrowed</div>
                        <div className='font-semibold'>
                          {activeStrategy.debtAsset.amountFormatted.toFixed(6)}{' '}
                          {activeStrategy.debtAsset.symbol}
                        </div>
                        <div className='text-muted-foreground'>
                          ${activeStrategy.debtAsset.usdValue.toFixed(2)}
                        </div>
                      </div>

                      <div>
                        <div className='text-muted-foreground'>Current Leverage</div>
                        <div className='font-semibold text-lg'>
                          {activeStrategy.leverage.toFixed(2)}x
                        </div>
                      </div>

                      <div>
                        <div className='text-muted-foreground'>Current APY</div>
                        <div
                          className={`font-semibold text-lg ${
                            activeStrategy.isPositive
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        >
                          {activeStrategy.netApy > 0 ? '+' : ''}
                          {(activeStrategy.netApy * 100).toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    <div className='mt-3 pt-3 border-t border-green-200 dark:border-green-800'>
                      <div className='text-xs text-green-700 dark:text-green-400'>
                        💡 <strong>Tip:</strong> You can modify this position by adjusting the
                        leverage above and deploying again, or close it completely using the
                        strategy card.
                      </div>
                    </div>
                  </div>
                )}

                {/* Strategy Summary */}
                <div className='p-2 rounded-lg bg-muted/20 border border-border/50'>
                  <div className='text-xs text-muted-foreground'>
                    <strong className='text-foreground'>How it works:</strong> This strategy
                    leverages your {strategy.collateralAsset.symbol} position by borrowing{' '}
                    {strategy.debtAsset.symbol} and swapping it for more{' '}
                    {strategy.collateralAsset.symbol}. The cycle repeats until you reach your target
                    leverage multiplier.
                    {isCorrelatedStrategy && (
                      <span className='text-blue-600 dark:text-blue-400'>
                        {' '}
                        Since all assets track the same BTC price, your profit depends on
                        maintaining a positive yield spread (collateral APY &gt; borrow rate).
                        Negative spreads erode collateral and increase leverage over time.
                      </span>
                    )}
                  </div>

                  {/* Leverage Math Summary */}
                  <div className='mt-2 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 dark:bg-blue-900/20 dark:border-blue-700/30'>
                    <div className='text-xs text-blue-700 dark:text-blue-400 font-medium mb-1'>
                      Leverage Math
                    </div>
                    <div className='text-xs text-blue-700/80 dark:text-blue-400/80 space-y-1'>
                      <div>
                        • Supply: {currentAmount.toFixed(6)} {strategy.collateralAsset.symbol}
                      </div>
                      <div>
                        • Borrow: {(currentAmount * (multiplier - 1)).toFixed(6)}{' '}
                        {strategy.debtAsset.symbol}
                      </div>
                      <div>
                        • Total: {totalPosition.toFixed(6)} {strategy.collateralAsset.symbol} (
                        {multiplier.toFixed(2)}x exposure)
                      </div>
                      <div>
                        • Net APY: {(leveragedApy * 100).toFixed(2)}% (
                        {(collateralSupplyApy * 100).toFixed(2)}% × {multiplier.toFixed(2)}x -{' '}
                        {(debtBorrowApy * (multiplier - 1) * 100).toFixed(2)}%)
                      </div>
                      <Separator />
                      <div className='text-xs text-blue-600/80 dark:text-blue-400/80'>
                        Max leverage: {dynamicMaxLeverage.toFixed(2)}x (based on liquidation
                        threshold)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Market Details */}
        <div className='space-y-4'>
          {/* Market Info Card */}
          <Card>
            <CardHeader className='pb-1'>
              <CardTitle className='text-sm font-semibold'>Market</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <Image
                    src={strategy.collateralAsset.icon}
                    alt={strategy.collateralAsset.symbol}
                    width={16}
                    height={16}
                  />
                  <span className='font-medium text-foreground text-sm'>
                    {strategy.collateralAsset.symbol}
                  </span>
                </div>

                <div className='space-y-1 text-xs'>
                  <div className='flex justify-between items-center'>
                    <span className='text-muted-foreground'>Supply APY</span>
                    <span className='font-medium text-accent-foreground'>
                      {getSupplyApyDisplay()}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <Image
                    src={strategy.debtAsset.icon}
                    alt={strategy.debtAsset.symbol}
                    width={16}
                    height={16}
                  />
                  <span className='font-medium text-foreground text-sm'>
                    {strategy.debtAsset.symbol}
                  </span>
                </div>

                <div className='space-y-1 text-xs'>
                  <div className='flex justify-between items-center'>
                    <span className='text-muted-foreground'>Borrow APY</span>
                    <span className='font-medium text-orange-600 dark:text-orange-400'>
                      {getBorrowApyDisplay()}
                    </span>
                  </div>

                  <div className='flex justify-between items-center'>
                    <span className='text-muted-foreground'>Available</span>
                    <span className='font-medium text-foreground'>
                      {getAvailableLiquidityDisplay()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Metrics Card */}
          <Card>
            <CardHeader className='pb-1'>
              <CardTitle className='text-sm font-semibold flex items-center gap-2'>
                <Info className='w-4 h-4 text-muted-foreground' />
                Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 text-xs'>
              {/* Yield Spread - Primary Risk Metric */}
              <div className={`p-3 rounded-lg border ${getRiskColorClasses()}`}>
                <div className='flex justify-between items-center mb-2'>
                  <span className='font-medium text-foreground'>Yield Spread</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className='w-3 h-3 text-muted-foreground hover:text-foreground transition-colors' />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className='text-xs max-w-xs'>
                        Difference between collateral APY and borrow rate. Negative spread means you
                        pay more to borrow than you earn from collateral.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className={`text-lg font-bold ${getRiskTextColor()}`}>
                  {yieldSpread >= 0 ? '+' : ''}
                  {(yieldSpread * 100).toFixed(2)}%
                </div>
                <div className={`text-xs mt-1 ${getRiskSubtextColor()}`}>
                  {getRiskDescription()}
                </div>
              </div>

              {/* Risk Breakdown */}
              <div className='space-y-2'>
                <div className='flex justify-between items-center'>
                  <span className='text-muted-foreground'>Supply APY</span>
                  <span className='font-medium text-emerald-600 dark:text-emerald-400'>
                    {(collateralSupplyApy * 100).toFixed(2)}%
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-muted-foreground'>Borrow Rate</span>
                  <span className='font-medium text-orange-600 dark:text-orange-400'>
                    {(debtBorrowApy * 100).toFixed(2)}%
                  </span>
                </div>

                {/* Leverage Increase Warning */}
                {/* TODO: Re-enable leverage warnings in production */}
                {/* {isRisky && (
                  <div className='p-2 rounded-lg bg-orange-500/10 border border-orange-500/20 dark:bg-orange-900/20 dark:border-red-700/30'>
                    <div className='text-xs text-orange-700 dark:text-orange-400 font-medium mb-1'>
                      Leverage Increasing
                    </div>
                    <div className='text-xs text-orange-700/80 dark:text-orange-400/80'>
                      Negative yield spread will erode your collateral over time, effectively
                      increasing your leverage ratio.
                    </div>
                  </div>
                )} */}
              </div>

              <Separator />

              <div className='space-y-1'>
                <div className='flex justify-between items-center'>
                  <span className='text-muted-foreground'>Max LTV</span>
                  <span className='font-medium text-foreground'>
                    {strategy.ltv ? `${(strategy.ltv * 100).toFixed(0)}%` : '80%'}
                  </span>
                </div>

                <div className='flex justify-between items-center'>
                  <span className='text-muted-foreground'>Liquidation Threshold</span>
                  <span className='font-medium text-foreground'>
                    {strategy.liquidationThreshold
                      ? `${(strategy.liquidationThreshold * 100).toFixed(0)}%`
                      : '85%'}
                  </span>
                </div>

                <div className='flex justify-between items-center'>
                  <span className='text-muted-foreground'>Max Leverage</span>
                  <span className='font-medium text-foreground'>
                    {(strategy.maxLeverage || 5).toFixed(1)}x
                  </span>
                </div>
              </div>

              <Separator />

              {/* Strategy Risk Info */}
              <div className={`p-2 rounded-lg border ${getStrategyRiskColorClasses()}`}>
                <div className={`font-medium text-xs mb-1 ${getStrategyRiskTextColor()}`}>
                  {isCorrelatedStrategy ? 'Correlated Asset Strategy' : 'Risk Warning'}
                </div>
                <div className={`text-xs ${getStrategyRiskSubtextColor()}`}>
                  {isCorrelatedStrategy
                    ? 'Liquidation occurs when borrow rate > supply rate. Negative yield spread erodes collateral over time, increasing leverage. At max leverage, partial liquidation occurs.'
                    : 'Leveraged positions amplify both gains and losses. Monitor your position carefully.'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Open Position Button */}
          <Button
            onClick={handleDeploy}
            disabled={
              isProcessing ||
              // !isWalletConnected ||
              // !hasValidAmount ||
              // hasInsufficientBalance ||
              // TODO: Re-enable risk-based deployment restrictions in production
              // isRisky ||
              // isBalancesLoading
              false
            }
            variant='default'
            className='w-full'
          >
            {getButtonContent()}
          </Button>
        </div>
      </div>
    </div>
  )
}
