'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import { useChain } from '@cosmos-kit/react'
import { BigNumber } from 'bignumber.js'
import { ArrowLeft } from 'lucide-react'

import { StrategyDisplayPanel } from '@/components/strategy/StrategyDisplayPanel'
import { StrategyFormPanel } from '@/components/strategy/StrategyFormPanel'
import { StrategyHeader } from '@/components/strategy/StrategyHeader'
import chainConfig from '@/config/chain'
import { useActiveStrategies } from '@/hooks/useActiveStrategies'
import { useDebounceWithStatus } from '@/hooks/useDebounce'
import useHealthComputer from '@/hooks/useHealthComputer'
import { useMaxBtcApy } from '@/hooks/useMaxBtcApy'
import { useMarketData, useWalletData } from '@/hooks/useStrategyCalculations'
import { useStrategyLeverageModification } from '@/hooks/useStrategyLeverageModification'
import { useStrategyWithdrawal } from '@/hooks/useStrategyWithdrawal'
import { useStore } from '@/store/useStore'
import {
  createDisplayValues,
  createRiskStyles,
  createStrategyRiskStyles,
} from '@/utils/strategyDisplayUtils'

interface ModifyStrategyProps {
  strategy: Strategy
}

export function ModifyStrategy({ strategy }: ModifyStrategyProps) {
  // Use existing active strategies data
  const { activeStrategies, isLoading: isActiveStrategiesLoading } = useActiveStrategies()

  // State management
  const [targetLeverage, setTargetLeverage] = useState(0) // Initialize to 0 to indicate not yet initialized
  const [isProcessing, setIsProcessing] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [slippage, setSlippage] = useState(0.5)
  const [hasInitialized, setHasInitialized] = useState(false)
  const [wasWalletConnected, setWasWalletConnected] = useState(false)

  const router = useRouter()
  const { address, connect } = useChain(chainConfig.name)
  const { markets } = useStore()
  const { apy: maxBtcApy, error: maxBtcError } = useMaxBtcApy()

  // Find active strategy for this collateral/debt pair
  const activeStrategy = useMemo(() => {
    return activeStrategies.find(
      (active) =>
        active.collateralAsset.symbol === strategy.collateralAsset.symbol &&
        active.debtAsset.symbol === strategy.debtAsset.symbol,
    )
  }, [activeStrategies, strategy])

  // Calculate the values you requested from raw data
  const strategyAccountData = useMemo(() => {
    if (!activeStrategy) return null

    // Your formulas:
    // supplies = collateral - borrows (this is what user actually deposited)
    const suppliesAmount =
      activeStrategy.collateralAsset.amountFormatted - activeStrategy.debtAsset.amountFormatted
    // leverage = collateral / supplies = collateral / (collateral - borrows)
    const leverage =
      suppliesAmount > 0 ? activeStrategy.collateralAsset.amountFormatted / suppliesAmount : 1

    return {
      accountId: activeStrategy.accountId,
      collateralAmount: activeStrategy.collateralAsset.amount,
      collateralAmountFormatted: activeStrategy.collateralAsset.amountFormatted,
      debtAmount: activeStrategy.debtAsset.amount,
      debtAmountFormatted: activeStrategy.debtAsset.amountFormatted,
      suppliesAmount, // collateral - borrows
      leverage, // collateral / (collateral - borrows)
    }
  }, [activeStrategy])

  // Derived values
  const effectiveMaxBtcApy = maxBtcError ? 0 : maxBtcApy || 0
  const collateralSupplyApy = effectiveMaxBtcApy / 100
  const isDataLoading =
    isActiveStrategiesLoading || !markets || markets.length === 0 || maxBtcApy === null

  // Initialize target leverage from current position
  useEffect(() => {
    if (strategyAccountData && !hasInitialized && strategyAccountData.leverage > 0) {
      setTargetLeverage(strategyAccountData.leverage)
      setHasInitialized(true)
    }
  }, [strategyAccountData, hasInitialized])

  // Track wallet connection status and redirect if disconnected
  useEffect(() => {
    if (address && !wasWalletConnected) {
      setWasWalletConnected(true)
    } else if (!address && wasWalletConnected) {
      // Wallet was disconnected, redirect to deploy mode
      router.push(
        `/strategies/deploy/${strategy.collateralAsset.symbol}-${strategy.debtAsset.symbol}`,
      )
    }
  }, [address, wasWalletConnected, router, strategy])

  // Check if user has made changes
  const hasUserInteraction = useMemo(() => {
    if (!strategyAccountData) return false
    // Don't consider it user interaction if targetLeverage is 0 (not yet initialized)
    if (targetLeverage === 0) return false
    return Math.abs(targetLeverage - strategyAccountData.leverage) > 0.01
  }, [strategyAccountData, targetLeverage])

  // Market data
  const marketData = useMarketData(strategy, markets)
  const walletData = useWalletData(strategy, [], address)

  // Debounce the target leverage with 2 second delay to track calculation state
  const { debouncedValue: debouncedTargetLeverage, isDebouncing: isCalculatingPositions } =
    useDebounceWithStatus(targetLeverage, 2000)

  // Position calculations using debounced values
  const effectiveLeverage = hasUserInteraction
    ? debouncedTargetLeverage
    : strategyAccountData?.leverage || targetLeverage || 2

  // Custom position calculations for modify mode
  const positionCalcs = useMemo(() => {
    if (!strategyAccountData) {
      return {
        borrowAmount: 0,
        totalPosition: 0,
        leveragedApy: 0,
        netApy: 0,
        estimatedYearlyEarnings: 0,
        collateralSupplyApy,
        debtBorrowApy: marketData.debtBorrowApy,
        yieldSpread: collateralSupplyApy - marketData.debtBorrowApy,
      }
    }

    const suppliesAmount = strategyAccountData.suppliesAmount || 0
    const currentCollateral = strategyAccountData.collateralAmountFormatted
    const currentBorrows = strategyAccountData.debtAmountFormatted

    // Calculate target position
    const targetTotalCollateral = suppliesAmount * effectiveLeverage
    const targetBorrows = targetTotalCollateral - suppliesAmount

    // For modify mode, borrowAmount represents the CHANGE needed:
    // - Positive: additional amount to borrow (leverage increase)
    // - Negative: amount to repay by swapping collateral (leverage decrease)
    const borrowAmountChange = targetBorrows - currentBorrows

    // Calculate APY based on target position
    const leveragedApy =
      effectiveLeverage * collateralSupplyApy - (effectiveLeverage - 1) * marketData.debtBorrowApy
    const estimatedYearlyEarnings = suppliesAmount * leveragedApy

    return {
      borrowAmount: Math.abs(borrowAmountChange), // Always positive for swap calculations
      totalPosition: targetTotalCollateral,
      leveragedApy,
      netApy: leveragedApy,
      estimatedYearlyEarnings,
      collateralSupplyApy,
      debtBorrowApy: marketData.debtBorrowApy,
      yieldSpread: collateralSupplyApy - marketData.debtBorrowApy,
      // Additional fields for modify mode
      currentCollateral,
      currentBorrows,
      targetBorrows,
      borrowAmountChange, // Signed value indicating direction
      isLeverageIncrease: borrowAmountChange > 0,
      // For NewPositionTable compatibility - use total target amounts
      totalBorrows: targetBorrows, // Total target borrows (not the change)
      supplies: suppliesAmount, // User's actual supply amount (for ExistingPositionOverviewCard)
    }
  }, [strategyAccountData, effectiveLeverage, collateralSupplyApy, marketData.debtBorrowApy])

  // Display values
  const displayValues = createDisplayValues(
    false, // Not loading balances for modify mode
    Boolean(address),
    0, // No user balance needed for modify
    strategy,
    marketData.currentPrice,
    effectiveMaxBtcApy,
    positionCalcs.debtBorrowApy,
  )

  // Risk styles
  const riskStyles = createRiskStyles(positionCalcs.yieldSpread)
  const strategyRiskStyles = createStrategyRiskStyles(strategy.isCorrelated)

  // Create positions for health computer using the existing account data
  const updatedPositions = useMemo(() => {
    const positions = {
      account_kind: 'default' as const,
      account_id: activeStrategy?.accountId || '',
      lends: [
        {
          denom: strategy.collateralAsset.denom,
          amount: activeStrategy?.collateralAsset.amount || '',
        },
      ],
      debts: [
        {
          denom: strategy.debtAsset.denom,
          amount: activeStrategy?.debtAsset.amount || '',
          shares: '0',
        },
      ],
      deposits: [],
      staked_astro_lps: [],
      perps: [],
      vaults: [],
    }

    return positions
  }, [
    activeStrategy?.accountId,
    activeStrategy?.collateralAsset.amount,
    activeStrategy?.debtAsset.amount,
    activeStrategy?.collateralAsset.amountFormatted,
    activeStrategy?.debtAsset.amountFormatted,
    strategy.collateralAsset.denom,
    strategy.debtAsset.denom,
    strategyAccountData?.leverage,
    strategyAccountData?.suppliesAmount,
  ])

  // Use health computer hook for existing position
  const { healthFactor: computedHealthFactor } = useHealthComputer(updatedPositions)

  // Add withdrawal hook for position closing
  const { withdrawFullStrategy, isProcessing: isWithdrawing } = useStrategyWithdrawal()

  // Helper functions
  const getEstimatedEarningsUsd = useCallback(() => {
    if (marketData.currentPrice > 0) {
      return `~$${(Math.abs(positionCalcs.estimatedYearlyEarnings) * marketData.currentPrice).toFixed(2)}`
    }
    return 'N/A'
  }, [marketData.currentPrice, positionCalcs.estimatedYearlyEarnings])

  const getAvailableLiquidityDisplay = useCallback(() => {
    if (marketData.debtMarket?.metrics?.collateral_total_amount) {
      const totalSupplied = new BigNumber(marketData.debtMarket.metrics.collateral_total_amount)

      return totalSupplied.shiftedBy(-(strategy.debtAsset.decimals || 6)).toFixed(2)
    }
    return strategy.liquidityDisplay || 'N/A'
  }, [marketData.debtMarket?.metrics, strategy])

  const handleSwapRouteLoaded = useCallback(() => {
    // Not needed for modify mode swap handling
  }, [])

  // Add leverage modification hook for modify mode
  const leverageModification = useStrategyLeverageModification({
    strategy,
    accountId: strategyAccountData?.accountId || '',
    activeStrategy: activeStrategy!,
    slippage,
  })

  // Create simulated positions for health calculation using effective (debounced) leverage
  const simulatedPositions = useMemo(() => {
    if (!activeStrategy || !strategyAccountData) return updatedPositions

    // Calculate new collateral and debt amounts based on effective leverage (debounced)
    const suppliesAmount = strategyAccountData.suppliesAmount || 0
    const targetTotalCollateral = suppliesAmount * effectiveLeverage
    const targetDebtAmount = targetTotalCollateral - suppliesAmount

    // Ensure debt amount is not negative
    const safeTargetDebtAmount = Math.max(0, targetDebtAmount)

    // Convert to raw amounts for health calculation (must be integers)
    const collateralRawAmount = new BigNumber(targetTotalCollateral)
      .shiftedBy(strategy.collateralAsset.decimals || 8)
      .integerValue()
      .toString()

    const debtRawAmount = new BigNumber(safeTargetDebtAmount)
      .shiftedBy(strategy.debtAsset.decimals || 6)
      .integerValue()
      .toString()

    const simulatedPositions = {
      account_kind: 'default' as const,
      account_id: activeStrategy.accountId,
      lends: [
        {
          denom: strategy.collateralAsset.denom,
          amount: collateralRawAmount,
        },
      ],
      debts: [
        {
          denom: strategy.debtAsset.denom,
          amount: debtRawAmount,
          shares: '0',
        },
      ],
      deposits: [],
      staked_astro_lps: [],
      perps: [],
      vaults: [],
    }

    return simulatedPositions
  }, [
    activeStrategy,
    strategyAccountData,
    effectiveLeverage,
    targetLeverage,
    strategy.collateralAsset.denom,
    strategy.collateralAsset.decimals,
    strategy.debtAsset.denom,
    strategy.debtAsset.decimals,
    updatedPositions,
  ])

  // Use health computer hook for simulated position
  const { healthFactor: simulatedHealthFactor } = useHealthComputer(simulatedPositions)

  const handleLeverageModification = useCallback(async () => {
    if (!activeStrategy || !leverageModification) return

    setIsProcessing(true)
    try {
      const result = await leverageModification.modifyLeverage(effectiveLeverage)
      if (result.success) {
        router.push('/portfolio')
      }
    } catch (error) {
      console.error('Leverage modification failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [activeStrategy, leverageModification, effectiveLeverage, router])

  const handleClosePosition = useCallback(async () => {
    if (!activeStrategy) return

    setIsClosing(true)
    const withdrawParams = {
      accountId: activeStrategy.accountId,
      collateralDenom: activeStrategy.collateralAsset.denom,
      collateralAmount: new BigNumber(activeStrategy.collateralAsset.amount)
        .shiftedBy(-(activeStrategy.collateralAsset.decimals || 8))
        .toString(),
      collateralDecimals: activeStrategy.collateralAsset.decimals || 8,
      debtDenom: activeStrategy.debtAsset.denom,
      debtAmount: new BigNumber(activeStrategy.debtAsset.amount)
        .shiftedBy(-(activeStrategy.debtAsset.decimals || 6))
        .toString(),
      debtDecimals: activeStrategy.debtAsset.decimals || 6,
    }

    try {
      const result = await withdrawFullStrategy(withdrawParams)
      if (result.success) {
        router.push('/strategies')
      }
    } catch (error) {
      console.error('❌ Strategy close failed:', error)
    } finally {
      setIsClosing(false)
    }
  }, [activeStrategy, withdrawFullStrategy, router])

  // If no strategy account found, show error
  if (!isDataLoading && !activeStrategy) {
    return (
      <div className='w-full max-w-6xl mx-auto px-4 py-4 sm:py-6'>
        <button
          onClick={() => router.back()}
          className='flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer mb-3'
        >
          <ArrowLeft className='w-4 h-4' />
          Back to Strategies
        </button>

        <div className='bg-card rounded-lg p-6 text-center'>
          <h2 className='text-xl font-bold text-foreground mb-2'>Position Not Found</h2>
          <p className='text-muted-foreground'>
            The strategy position you're trying to modify could not be found.
          </p>
        </div>
      </div>
    )
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

      {/* Strategy Header */}
      <StrategyHeader
        strategy={strategy}
        mode='modify'
        activeStrategy={activeStrategy}
        leveragedApy={positionCalcs.leveragedApy}
        currentLeverage={strategyAccountData?.leverage}
        targetLeverage={hasUserInteraction ? targetLeverage : strategyAccountData?.leverage}
        isLoading={isDataLoading}
      />

      <div className='flex flex-col lg:flex-row gap-4 lg:gap-6'>
        {/* Left Column - Display Components */}
        <StrategyDisplayPanel
          strategy={strategy}
          mode='modify'
          activeStrategy={activeStrategy}
          displayValues={displayValues}
          positionCalcs={positionCalcs}
          marketData={marketData}
          collateralSupplyApy={collateralSupplyApy}
          debtBorrowApy={positionCalcs.debtBorrowApy}
          getEstimatedEarningsUsd={getEstimatedEarningsUsd}
          healthFactor={simulatedHealthFactor || computedHealthFactor || 0}
          existingHealthFactor={computedHealthFactor}
          currentAmount={strategyAccountData?.suppliesAmount || 0}
          multiplier={effectiveLeverage}
          isLoading={isDataLoading}
        />

        {/* Right Column - Form Panel */}
        <StrategyFormPanel
          strategy={strategy}
          mode='modify'
          collateralAmount={strategyAccountData?.suppliesAmount?.toString() || ''}
          setCollateralAmount={() => {}} // Not used in modify mode
          multiplier={effectiveLeverage} // Not used in modify mode
          setMultiplier={() => {}} // Not used in modify mode
          targetLeverage={targetLeverage}
          setTargetLeverage={setTargetLeverage}
          slippage={slippage}
          setSlippage={setSlippage}
          activeStrategy={activeStrategy}
          displayValues={displayValues}
          walletData={walletData}
          marketData={marketData}
          debtBasedLimits={undefined}
          positionCalcs={positionCalcs}
          riskStyles={riskStyles}
          strategyRiskStyles={strategyRiskStyles}
          collateralSupplyApy={collateralSupplyApy}
          debtBorrowApy={positionCalcs.debtBorrowApy}
          healthFactor={simulatedHealthFactor || computedHealthFactor || 0}
          simulatedHealthFactor={simulatedHealthFactor}
          computedHealthFactor={computedHealthFactor}
          hasValidAmount={Boolean(activeStrategy)}
          hasInsufficientBalance={false}
          hasInsufficientLiquidity={false}
          hasUserInteraction={hasUserInteraction}
          isCalculatingPositions={isCalculatingPositions}
          onSwapRouteLoaded={handleSwapRouteLoaded}
          onModifyLeverage={handleLeverageModification}
          onClosePosition={handleClosePosition}
          getAvailableLiquidityDisplay={getAvailableLiquidityDisplay}
          isProcessing={isProcessing}
          isClosing={isClosing}
          isWithdrawing={isWithdrawing}
          isDataLoading={isDataLoading}
          connect={connect}
        />
      </div>
    </div>
  )
}
