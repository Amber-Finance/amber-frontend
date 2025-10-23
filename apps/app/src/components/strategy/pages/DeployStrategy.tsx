'use client'

import { useCallback, useState } from 'react'

import { BigNumber } from 'bignumber.js'
import { ArrowLeft } from 'lucide-react'

import { StrategyFormPanel } from '@/components/strategy/StrategyFormPanel'
import { StrategyHeader } from '@/components/strategy/StrategyHeader'
import { StrategyDisplayPanel } from '@/components/strategy/display/StrategyDisplayPanel'
import { useStrategyCommon, useStrategyDeployment } from '@/hooks/strategy'

interface DeployStrategyProps {
  strategy: Strategy
}

export function DeployStrategy({ strategy }: DeployStrategyProps) {
  const [isFetchingRoute, setIsFetchingRoute] = useState(false)
  const strategyCommon = useStrategyCommon({
    strategy,
    mode: 'deploy',
  })

  const {
    collateralAmount,
    setCollateralAmount,
    multiplier,
    setMultiplier,
    isProcessing,
    setIsProcessing,
    slippage,
    setSlippage,
    cachedSwapRouteInfo,
    currentAmount,
    marketData,
    walletData,
    positionCalcs,
    displayValues,
    riskStyles,
    strategyRiskStyles,
    collateralSupplyApy,
    debtBasedLimits,
    hasValidAmount,
    hasInsufficientBalance,
    hasInsufficientLiquidity,
    hasUserInteraction,
    isCalculatingPositions,
    getAvailableLiquidityDisplay,
    getEstimatedEarningsUsd,
    handleSwapRouteLoaded,
    handleSwapLoadingChange,
    isSwapLoading,
    computedHealthFactor,
    simulatedHealthFactor,
    isDataLoading,
    router,
    executeTransaction,
    connect,
  } = strategyCommon

  const { deployStrategy, fetchSwapRoute } = useStrategyDeployment({
    strategy,
    executeTransaction,
    isModifying: false,
    modifyingAccountId: null,
  })

  const handleDeploy = useCallback(async () => {
    // Validation checks
    if (!walletData.isWalletConnected) return
    if (!collateralAmount || currentAmount <= 0) return
    if (hasInsufficientBalance) return
    if (hasInsufficientLiquidity) return

    // Check if leverage exceeds strategy's maximum allowed leverage
    if (strategy.maxLeverage && multiplier > strategy.maxLeverage) {
      console.error(
        `Leverage ${multiplier.toFixed(2)}x exceeds maximum allowed leverage of ${strategy.maxLeverage.toFixed(2)}x for this strategy.`,
      )
      // Track the validation failure
      const { track } = await import('@/utils/common/analytics')
      track('strategy_failed', {
        strategyId: strategy.id,
        collateralSymbol: strategy.collateralAsset.symbol,
        debtSymbol: strategy.debtAsset.symbol,
        leverage: multiplier,
        maxLeverage: strategy.maxLeverage,
        reason: 'leverage_too_high',
      })
      return
    }

    // Check available liquidity for borrowing - max borrow should equal total supplied amount
    const borrowAmount = positionCalcs.borrowAmount
    if (marketData.debtMarket) {
      const totalSupplied = new BigNumber(
        marketData.debtMarket.metrics?.collateral_total_amount || '0',
      )

      // Convert borrow amount to the same units as total supplied (raw units)
      const borrowAmountRaw = new BigNumber(borrowAmount)
        .shiftedBy(strategy.debtAsset.decimals || 6)
        .integerValue()

      if (borrowAmountRaw.gt(totalSupplied)) {
        console.warn(
          `Insufficient liquidity. Trying to borrow ${borrowAmount.toFixed(2)} ${strategy.debtAsset.symbol}, but only ${totalSupplied.shiftedBy(-(strategy.debtAsset.decimals || 6)).toFixed(2)} ${strategy.debtAsset.symbol} is supplied to the pool.`,
        )
        return
      }
    }

    setIsProcessing(true)

    try {
      // Use cached swap route info if available, otherwise fetch it
      let swapRouteInfo = cachedSwapRouteInfo
      if (!swapRouteInfo) {
        setIsFetchingRoute(true)
        swapRouteInfo = await fetchSwapRoute(borrowAmount)
        setIsFetchingRoute(false)
      }

      const result = await deployStrategy({
        collateralAmount: currentAmount,
        multiplier,
        swapRouteInfo,
        slippage,
      })

      // Redirect to portfolio page on successful deployment
      if (result.success) {
        router.push('/portfolio')
      }
    } catch (error) {
      console.error(error)
      setIsFetchingRoute(false)
    } finally {
      setIsProcessing(false)
    }
  }, [
    walletData.isWalletConnected,
    collateralAmount,
    currentAmount,
    hasInsufficientBalance,
    hasInsufficientLiquidity,
    positionCalcs.borrowAmount,
    marketData.debtMarket,
    strategy.debtAsset.decimals,
    strategy.debtAsset.symbol,
    setIsProcessing,
    cachedSwapRouteInfo,
    fetchSwapRoute,
    deployStrategy,
    multiplier,
    slippage,
    router,
  ])

  return (
    <div className='w-full max-w-6xl mx-auto px-4 py-4 sm:py-6'>
      {/* Back button */}
      <button
        onClick={() => router.push('/strategies')}
        className='flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer mb-3'
      >
        <ArrowLeft className='w-4 h-4' />
        Back to Strategies
      </button>

      {/* Strategy Header */}
      <StrategyHeader
        strategy={strategy}
        mode='deploy'
        leveragedApy={positionCalcs.leveragedApy}
        isLoading={isDataLoading}
      />

      <div className='flex flex-col lg:flex-row gap-4 lg:gap-6'>
        {/* Left Column - Display Components */}
        <StrategyDisplayPanel
          strategy={strategy}
          mode='deploy'
          displayValues={displayValues}
          positionCalcs={positionCalcs}
          marketData={marketData}
          collateralSupplyApy={collateralSupplyApy}
          debtBorrowApy={positionCalcs.debtBorrowApy}
          getEstimatedEarningsUsd={getEstimatedEarningsUsd}
          healthFactor={computedHealthFactor || 0}
          currentAmount={currentAmount}
          multiplier={multiplier}
          isLoading={isDataLoading}
          swapRouteInfo={cachedSwapRouteInfo}
          slippage={slippage}
          isCalculatingPositions={isCalculatingPositions}
        />

        {/* Right Column - Form Panel */}
        <StrategyFormPanel
          strategy={strategy}
          mode='deploy'
          collateralAmount={collateralAmount}
          setCollateralAmount={setCollateralAmount}
          multiplier={multiplier}
          setMultiplier={setMultiplier}
          targetLeverage={multiplier} // Same as multiplier in deploy mode
          setTargetLeverage={setMultiplier}
          slippage={slippage}
          setSlippage={setSlippage}
          displayValues={displayValues}
          walletData={walletData}
          marketData={marketData}
          debtBasedLimits={debtBasedLimits}
          positionCalcs={positionCalcs}
          riskStyles={riskStyles}
          strategyRiskStyles={strategyRiskStyles}
          collateralSupplyApy={collateralSupplyApy}
          debtBorrowApy={positionCalcs.debtBorrowApy}
          healthFactor={simulatedHealthFactor || computedHealthFactor || 0}
          simulatedHealthFactor={simulatedHealthFactor}
          computedHealthFactor={computedHealthFactor}
          hasValidAmount={hasValidAmount}
          hasInsufficientBalance={hasInsufficientBalance}
          hasInsufficientLiquidity={hasInsufficientLiquidity}
          hasUserInteraction={hasUserInteraction}
          isCalculatingPositions={isCalculatingPositions}
          onSwapRouteLoaded={handleSwapRouteLoaded}
          onSwapLoadingChange={handleSwapLoadingChange}
          onDeploy={handleDeploy}
          getAvailableLiquidityDisplay={getAvailableLiquidityDisplay}
          isProcessing={isProcessing}
          isClosing={false}
          isFetchingRoute={isFetchingRoute || isSwapLoading}
          isDataLoading={isDataLoading}
          connect={connect}
        />
      </div>
    </div>
  )
}
