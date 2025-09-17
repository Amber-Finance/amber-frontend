'use client'

import { useEffect, useMemo, useState } from 'react'

import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'

import { useChain } from '@cosmos-kit/react'
import { BigNumber } from 'bignumber.js'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'react-toastify'

import { StrategyChart } from '@/components/strategies/StrategyChart'
import { MarginCollateralCard } from '@/components/strategy/MarginCollateralCard'
import { MarketInfoCard } from '@/components/strategy/MarketInfoCard'
import { PositionOverviewCard } from '@/components/strategy/PositionOverviewCard'
import { RiskAssessmentCard } from '@/components/strategy/RiskAssessmentCard'
import { StrategyFlowCard } from '@/components/strategy/StrategyFlowCard'
import { Button } from '@/components/ui/Button'
import { CountingNumber } from '@/components/ui/CountingNumber'
import { FlickeringGrid } from '@/components/ui/FlickeringGrid'
import chainConfig from '@/config/chain'
import { useActiveStrategies } from '@/hooks/useActiveStrategies'
import useHealthComputer from '@/hooks/useHealthComputer'
import { useMaxBtcApy } from '@/hooks/useMaxBtcApy'
import { usePrices } from '@/hooks/usePrices'
import { useMarketData, useWalletData } from '@/hooks/useStrategyCalculations'
import { useStrategyDeployment } from '@/hooks/useStrategyDeployment'
import { usePositionCalculationsWithSimulatedApy } from '@/hooks/useStrategySimulatedApy'
import { useStrategyWithdrawal } from '@/hooks/useStrategyWithdrawal'
import useWalletBalances from '@/hooks/useWalletBalances'
import { useStore } from '@/store/useStore'
import { useBroadcast } from '@/utils/broadcast'
import { formatCurrency } from '@/utils/format'
import {
  CreateButtonContent,
  createDisplayValues,
  createRiskStyles,
  createStrategyRiskStyles,
} from '@/utils/strategyDisplayUtils'

interface StrategyDeployClientProps {
  strategy: Strategy
}

export default function StrategyDeployClient({ strategy }: StrategyDeployClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [collateralAmount, setCollateralAmount] = useState('')
  const [multiplier, setMultiplier] = useState(1.5)
  const [isProcessing, setIsProcessing] = useState(false)

  // Hooks
  const { isWasmReady } = useHealthComputer()
  const { markets } = useStore()
  const { executeTransaction } = useBroadcast()
  const { apy: maxBtcApy, error: maxBtcError } = useMaxBtcApy()
  const { address } = useChain(chainConfig.name)
  const { data: walletBalances, isLoading: isBalancesLoading } = useWalletBalances()
  const { activeStrategies } = useActiveStrategies()
  usePrices()

  // Derived state
  const effectiveMaxBtcApy = maxBtcError ? 6.5 : maxBtcApy || 6.5
  const isModifying = searchParams.get('modify') === 'true'
  const modifyingAccountId = searchParams.get('accountId')
  const currentAmount = parseFloat(collateralAmount || '0')
  const collateralSupplyApy = effectiveMaxBtcApy / 100

  // Custom hooks
  const marketData = useMarketData(strategy, markets)
  const walletData = useWalletData(strategy, walletBalances || [], address)
  // Find active strategy - for modify mode, find by accountId
  const activeStrategy =
    isModifying && modifyingAccountId
      ? activeStrategies.find((active) => active.accountId === modifyingAccountId)
      : activeStrategies.find(
          (active) =>
            active.collateralAsset.symbol === strategy.collateralAsset.symbol &&
            active.debtAsset.symbol === strategy.debtAsset.symbol,
        )

  // Use simulated APY calculations that update based on user input
  // For modify mode, use existing position data
  const positionCalcs = usePositionCalculationsWithSimulatedApy(
    isModifying && activeStrategy
      ? activeStrategy.collateralAsset.amountFormatted.toString()
      : collateralAmount,
    isModifying && activeStrategy ? activeStrategy.leverage : multiplier,
    marketData.collateralMarket?.metrics || null,
    marketData.debtMarket?.metrics || null,
    {
      collateralSupplyApy,
      debtBorrowApy: marketData.debtBorrowApy,
    },
    {
      collateral: strategy.collateralAsset.decimals || 8,
      debt: strategy.debtAsset.decimals || 6,
    },
  )

  const { deployStrategy, fetchSwapRoute } = useStrategyDeployment({
    strategy,
    executeTransaction,
    isModifying,
    modifyingAccountId,
  })

  // Add withdrawal hook for position closing
  const { withdrawFullStrategy, isProcessing: isWithdrawing } = useStrategyWithdrawal()

  // Display values
  const displayValues = createDisplayValues(
    isBalancesLoading,
    walletData.isWalletConnected,
    walletData.userBalance,
    strategy,
    marketData.currentPrice,
    effectiveMaxBtcApy, // Keep static supply APY
    positionCalcs.debtBorrowApy, // Use dynamic borrow APY
  )

  // Risk styles
  const riskStyles = createRiskStyles(positionCalcs.yieldSpread)
  const strategyRiskStyles = createStrategyRiskStyles(strategy.isCorrelated)

  // Validation states
  const hasValidAmount = isModifying
    ? Boolean(activeStrategy)
    : Boolean(collateralAmount && currentAmount > 0)
  const hasInsufficientBalance = isModifying ? false : currentAmount > walletData.userBalance

  // Check available liquidity
  const hasInsufficientLiquidity = useMemo(() => {
    if (!marketData.debtMarket?.metrics || !hasValidAmount) return false

    const borrowAmount = positionCalcs.borrowAmount
    const totalCollateral = new BigNumber(
      marketData.debtMarket.metrics.collateral_total_amount || '0',
    )
    const totalDebt = new BigNumber(marketData.debtMarket.metrics.debt_total_amount || '0')
    const availableLiquidity = totalCollateral.minus(totalDebt)

    const borrowAmountRaw = new BigNumber(borrowAmount)
      .shiftedBy(strategy.debtAsset.decimals || 6)
      .integerValue()

    return borrowAmountRaw.gt(availableLiquidity)
  }, [
    marketData.debtMarket,
    hasValidAmount,
    positionCalcs.borrowAmount,
    strategy.debtAsset.decimals,
  ])

  // Button content
  const buttonContent = isModifying
    ? isProcessing
      ? 'Closing Position...'
      : 'Close Position'
    : CreateButtonContent(
        isProcessing,
        isModifying,
        walletData.isWalletConnected,
        isBalancesLoading,
        hasInsufficientBalance,
        hasValidAmount,
        hasInsufficientLiquidity,
      )

  // Effects
  useEffect(() => {
    if (isModifying && activeStrategy) {
      // Pre-fill data from existing position
      setCollateralAmount(activeStrategy.collateralAsset.amountFormatted.toString())
      setMultiplier(activeStrategy.leverage)
    }
  }, [isModifying, activeStrategy])

  useEffect(() => {
    if (multiplier > marketData.dynamicMaxLeverage) {
      setMultiplier(Math.min(multiplier, marketData.dynamicMaxLeverage))
    }
  }, [marketData.dynamicMaxLeverage, multiplier, currentAmount, isWasmReady])

  // Handlers
  const handleMultiplierChange = (value: number[]) => {
    const newMultiplier = value[0]
    if (newMultiplier >= 1 && newMultiplier <= marketData.dynamicMaxLeverage) {
      setMultiplier(newMultiplier)
    }
  }

  const handleDeploy = async () => {
    // Validation checks
    if (!walletData.isWalletConnected) return
    if (isBalancesLoading) return

    // For position closing, use different logic
    if (isModifying && activeStrategy) {
      setIsProcessing(true)

      try {
        const withdrawParams = {
          accountId: activeStrategy.accountId,
          collateralDenom: activeStrategy.collateralAsset.denom,
          collateralAmount: activeStrategy.collateralAsset.amountFormatted.toString(),
          collateralDecimals: activeStrategy.collateralAsset.decimals || 8,
          debtDenom: activeStrategy.debtAsset.denom,
          debtAmount: activeStrategy.debtAsset.amountFormatted.toString(),
          debtDecimals: activeStrategy.debtAsset.decimals || 6,
        }

        await withdrawFullStrategy(withdrawParams)

        // Success handling is done by the withdrawal hook
        // Navigate back to strategies page after successful closure
        router.push('/strategies')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Position closure failed')
        console.error(error)
      } finally {
        setIsProcessing(false)
      }
      return
    }

    // Original deployment logic for creating/modifying positions
    if (!collateralAmount || currentAmount <= 0) return
    if (hasInsufficientBalance) return
    if (hasInsufficientLiquidity) return

    // Check available liquidity for borrowing
    const borrowAmount = positionCalcs.borrowAmount
    if (marketData.debtMarket) {
      const totalCollateral = new BigNumber(
        marketData.debtMarket.metrics?.collateral_total_amount || '0',
      )
      const totalDebt = new BigNumber(marketData.debtMarket.metrics?.debt_total_amount || '0')
      const availableLiquidity = totalCollateral.minus(totalDebt)

      // Convert borrow amount to the same units as available liquidity (raw units)
      const borrowAmountRaw = new BigNumber(borrowAmount)
        .shiftedBy(strategy.debtAsset.decimals || 6)
        .integerValue()

      if (borrowAmountRaw.gt(availableLiquidity)) {
        const availableLiquidityFormatted = availableLiquidity
          .shiftedBy(-(strategy.debtAsset.decimals || 6))
          .toFixed(2)

        toast.error(
          `Insufficient liquidity. You're trying to borrow ${borrowAmount.toFixed(2)} ${strategy.debtAsset.symbol}, but only ${availableLiquidityFormatted} ${strategy.debtAsset.symbol} is available.`,
        )
        return
      }
    }

    setIsProcessing(true)

    try {
      const swapRouteInfo = await fetchSwapRoute(borrowAmount)

      await deployStrategy({
        collateralAmount: currentAmount,
        multiplier,
        swapRouteInfo,
      })

      // All success/error handling is done by the broadcast system via toast notifications
      // No need for custom console.logs or manual error handling
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unknown error')
      console.error(error)

      // Error handling is managed by the broadcast system
      // The error will be shown as a toast notification automatically
    } finally {
      setIsProcessing(false)
    }
  }

  const getAvailableLiquidityDisplay = () => {
    if (
      marketData.debtMarket?.metrics?.collateral_total_amount &&
      marketData.debtMarket?.metrics?.debt_total_amount
    ) {
      const totalCollateral = new BigNumber(marketData.debtMarket.metrics.collateral_total_amount)
      const totalDebt = new BigNumber(marketData.debtMarket.metrics.debt_total_amount)
      const availableLiquidity = totalCollateral.minus(totalDebt)

      return availableLiquidity.shiftedBy(-(strategy.debtAsset.decimals || 6)).toFixed(2)
    }
    return strategy.liquidityDisplay || 'N/A'
  }

  const getEstimatedEarningsUsd = () => {
    if (marketData.currentPrice > 0) {
      return `~${formatCurrency()(Math.abs(positionCalcs.estimatedYearlyEarnings) * marketData.currentPrice)}`
    }
    return 'N/A'
  }

  return (
    <div className='w-full max-w-6xl mx-auto px-4 py-4 sm:py-6'>
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className='flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer mb-3'
      >
        <ArrowLeft className='w-4 h-4' />
        Back to Strategies
      </button>

      {/* Header with FlickeringGrid */}
      <div className='relative mb-4 sm:mb-6'>
        <div className='absolute inset-0 z-10 w-full overflow-hidden'>
          <FlickeringGrid
            className='w-full h-full'
            color={strategy.debtAsset.brandColor}
            squareSize={8}
            gridGap={2}
            flickerChance={0.2}
            maxOpacity={0.3}
            gradientDirection='top-to-bottom'
            height={140}
          />
        </div>

        <div className='relative z-20'>
          <div className='flex justify-between p-4'>
            <div className='flex items-center justify-start gap-3'>
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
                <h2 className='text-lg sm:text-xl font-bold text-foreground'>
                  {isModifying ? 'Close' : 'Deploy'} {strategy.collateralAsset.symbol}/
                  {strategy.debtAsset.symbol} Strategy
                </h2>
                <p className='text-xs sm:text-sm text-muted-foreground'>
                  {isModifying
                    ? `Close your existing position and withdraw all collateral`
                    : `Supply ${strategy.collateralAsset.symbol}, borrow ${strategy.debtAsset.symbol}, leverage your position`}
                </p>
              </div>
            </div>

            <div className='text-right'>
              <div
                className='text-4xl font-bold'
                style={{ color: strategy.collateralAsset.brandColor }}
              >
                <CountingNumber
                  value={
                    isModifying && activeStrategy
                      ? isNaN(activeStrategy.netApy)
                        ? 0
                        : activeStrategy.netApy * 100
                      : isNaN(positionCalcs.leveragedApy)
                        ? 0
                        : positionCalcs.leveragedApy * 100
                  }
                  decimalPlaces={2}
                />
                %
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='flex flex-col lg:flex-row gap-4 lg:gap-8'>
        <div className='flex-1 space-y-4 order-2 lg:order-1'>
          <PositionOverviewCard
            strategy={strategy}
            displayValues={displayValues}
            positionCalcs={positionCalcs}
            getEstimatedEarningsUsd={getEstimatedEarningsUsd}
          />
          <StrategyChart
            denom={strategy.debtAsset.denom}
            symbol={strategy.debtAsset.symbol}
            brandColor={strategy.debtAsset.brandColor}
            supplyApy={strategy.supplyApy}
            className='w-full h-full'
          />
          <StrategyFlowCard
            strategy={strategy}
            activeStrategy={activeStrategy}
            currentAmount={currentAmount}
            multiplier={multiplier}
            positionCalcs={positionCalcs}
            marketData={marketData}
            collateralSupplyApy={collateralSupplyApy}
            debtBorrowApy={positionCalcs.debtBorrowApy}
          />
        </div>

        {/* Right Column - Input Form */}
        <div className='flex-1 order-1 lg:order-2 space-y-4'>
          {/* Only show input form for deploy mode, not modify mode */}
          {!isModifying && (
            <MarginCollateralCard
              strategy={strategy}
              collateralAmount={collateralAmount}
              setCollateralAmount={setCollateralAmount}
              multiplier={multiplier}
              handleMultiplierChange={handleMultiplierChange}
              dynamicMaxLeverage={marketData.dynamicMaxLeverage}
              displayValues={displayValues}
              userBalance={walletData.userBalance}
              currentAmount={currentAmount}
              positionCalcs={positionCalcs}
            />
          )}

          {/* Show current position summary for modify mode */}
          {isModifying && activeStrategy && (
            <div className='bg-card/20 backdrop-blur-sm border rounded-lg p-3 sm:p-4'>
              <h3 className='text-sm font-bold text-foreground mb-3'>Current Position</h3>
              <div className='space-y-3'>
                <div className='grid grid-cols-2 gap-4 text-xs'>
                  <div>
                    <div className='text-muted-foreground'>Collateral</div>
                    <div className='font-semibold'>
                      {activeStrategy.collateralAsset.amountFormatted.toFixed(
                        Math.min(activeStrategy.collateralAsset.decimals || 8, 6),
                      )}{' '}
                      {activeStrategy.collateralAsset.symbol}
                    </div>
                    <div className='text-muted-foreground'>
                      ${activeStrategy.collateralAsset.usdValue.toFixed(2)}
                    </div>
                  </div>

                  <div>
                    <div className='text-muted-foreground'>Debt</div>
                    <div className='font-semibold'>
                      {activeStrategy.debtAsset.amountFormatted.toFixed(
                        Math.min(activeStrategy.debtAsset.decimals || 6, 6),
                      )}{' '}
                      {activeStrategy.debtAsset.symbol}
                    </div>
                    <div className='text-muted-foreground'>
                      ${activeStrategy.debtAsset.usdValue.toFixed(2)}
                    </div>
                  </div>

                  <div>
                    <div className='text-muted-foreground'>Leverage</div>
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
              </div>
            </div>
          )}

          <MarketInfoCard
            strategy={strategy}
            displayValues={displayValues}
            getAvailableLiquidityDisplay={getAvailableLiquidityDisplay}
          />

          <RiskAssessmentCard
            strategy={strategy}
            positionCalcs={positionCalcs}
            collateralSupplyApy={collateralSupplyApy}
            debtBorrowApy={positionCalcs.debtBorrowApy}
            riskStyles={riskStyles}
            strategyRiskStyles={strategyRiskStyles}
          />

          {/* Action Button */}
          <Button
            onClick={handleDeploy}
            disabled={
              isProcessing ||
              isWithdrawing ||
              !walletData.isWalletConnected ||
              isBalancesLoading ||
              !hasValidAmount ||
              hasInsufficientBalance ||
              hasInsufficientLiquidity
            }
            variant='default'
            className={`w-full ${isModifying ? 'bg-red-600 hover:bg-red-700 text-white' : ''}`}
          >
            {buttonContent}
          </Button>
        </div>
      </div>
    </div>
  )
}
