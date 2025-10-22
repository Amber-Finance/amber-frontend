'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import { useChain } from '@cosmos-kit/react'
import { BigNumber } from 'bignumber.js'

import {
  createDisplayValues,
  createRiskStyles,
  createStrategyRiskStyles,
} from '@/components/strategy/helpers/displayUtils'
import chainConfig from '@/config/chain'
import { useDebounceWithStatus, useHealthComputer } from '@/hooks/common'
import { useMaxBtcApy } from '@/hooks/market'
import { usePrices } from '@/hooks/market/usePrices'
import { useActiveStrategies } from '@/hooks/portfolio'
import { useMarketData, useWalletData } from '@/hooks/strategy'
import { usePositionCalculationsWithSimulatedApy } from '@/hooks/strategy/useStrategySimulatedApy'
import { useWalletBalances } from '@/hooks/wallet'
import { useStore } from '@/store/useStore'
import { useBroadcast } from '@/utils/blockchain/broadcast'

interface UseStrategyCommonProps {
  strategy: Strategy
  mode: 'deploy' | 'modify'
  accountId?: string
}

export function useStrategyCommon({ strategy, mode, accountId }: UseStrategyCommonProps) {
  const router = useRouter()

  // State
  const [collateralAmount, setCollateralAmount] = useState('')
  const [multiplier, setMultiplier] = useState(2)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [cachedSwapRouteInfo, setCachedSwapRouteInfo] = useState<SwapRouteInfo | null>(null)
  const [targetLeverage, setTargetLeverage] = useState(2)
  const [hasInitialized, setHasInitialized] = useState(false)
  const [slippage, setSlippage] = useState(0.5)
  const [isSwapLoading, setIsSwapLoading] = useState(false)

  // Hooks
  const { markets } = useStore()
  const { executeTransaction } = useBroadcast()
  const { apy: maxBtcApy, error: maxBtcError } = useMaxBtcApy()
  const { address, connect } = useChain(chainConfig.name)
  const { data: walletBalances, isLoading: isBalancesLoading } = useWalletBalances()
  const activeStrategies = useActiveStrategies()
  usePrices()

  // Derived state
  const effectiveMaxBtcApy = maxBtcError ? 0 : maxBtcApy || 0
  const isModifying = mode === 'modify'
  const currentAmount = parseFloat(collateralAmount || '0')
  const collateralSupplyApy = effectiveMaxBtcApy / 100

  // Custom hooks
  const marketData = useMarketData(strategy, markets)
  const walletData = useWalletData(strategy, walletBalances || [], address)

  // Calculate debt-based limits
  const debtBasedLimits = useMemo(() => {
    if (!marketData.debtMarket?.metrics?.collateral_total_amount) {
      return {
        maxLeverageFromDebt: marketData.dynamicMaxLeverage || 12,
        maxAmountFromDebt: Infinity,
        effectiveMaxLeverage: marketData.dynamicMaxLeverage || 12,
      }
    }

    const totalSuppliedDebt = new BigNumber(marketData.debtMarket.metrics.collateral_total_amount)
      .shiftedBy(-(strategy.debtAsset.decimals || 6))
      .toNumber()

    // For a given amount, max leverage = (totalSuppliedDebt / amount) + 1
    // Because borrowAmount = amount * (leverage - 1), and borrowAmount <= totalSuppliedDebt
    const maxLeverageFromDebt =
      currentAmount > 0
        ? Math.floor(totalSuppliedDebt / currentAmount + 1)
        : marketData.dynamicMaxLeverage || 12

    // For a given leverage, max amount = totalSuppliedDebt / (leverage - 1)
    const maxAmountFromDebt = multiplier > 1 ? totalSuppliedDebt / (multiplier - 1) : Infinity

    // The effective max leverage is the minimum of LTV-based and debt-based limits
    const effectiveMaxLeverage = Math.min(marketData.dynamicMaxLeverage || 12, maxLeverageFromDebt)

    return {
      maxLeverageFromDebt,
      maxAmountFromDebt,
      effectiveMaxLeverage,
      totalSuppliedDebt,
    }
  }, [
    marketData.debtMarket?.metrics?.collateral_total_amount,
    marketData.dynamicMaxLeverage,
    strategy.debtAsset.decimals,
    currentAmount,
    multiplier,
  ])

  // Find active strategy
  const activeStrategy = useMemo(() => {
    if (isModifying && accountId) {
      return activeStrategies.find((active: ActiveStrategy) => active.accountId === accountId)
    }
    return activeStrategies.find(
      (active: ActiveStrategy) =>
        active.collateralAsset.symbol === strategy.collateralAsset.symbol &&
        active.debtAsset.symbol === strategy.debtAsset.symbol,
    )
  }, [isModifying, accountId, activeStrategies, strategy])

  // Loading states
  const isDataLoading = isBalancesLoading || !markets || markets.length === 0 || maxBtcApy === null

  // Debounce values for position calculations and track calculating status
  const { debouncedValue: debouncedCollateralAmount, isDebouncing: isAmountDebouncing } =
    useDebounceWithStatus(collateralAmount, 2000)
  const { debouncedValue: debouncedMultiplier, isDebouncing: isMultiplierDebouncing } =
    useDebounceWithStatus(multiplier, 2000)
  const { debouncedValue: debouncedTargetLeverage, isDebouncing: isTargetLeverageDebouncing } =
    useDebounceWithStatus(targetLeverage, 2000)

  // Determine if any calculations are in progress
  const isCalculatingPositions =
    isAmountDebouncing || isMultiplierDebouncing || isTargetLeverageDebouncing

  // Check if user has made actual changes from current state first
  const hasUserInteraction = useMemo(() => {
    if (isModifying && activeStrategy) {
      const leverageChanged = Math.abs(targetLeverage - activeStrategy.leverage) > 0.01
      const amountChanged =
        Math.abs(currentAmount - activeStrategy.collateralAsset.amountFormatted) > 0.000001
      return leverageChanged || amountChanged
    } else {
      const leverageChanged = Math.abs(multiplier - 2.0) > 0.01
      const amountEntered = Boolean(collateralAmount) && currentAmount > 0
      return leverageChanged || amountEntered
    }
  }, [isModifying, activeStrategy, targetLeverage, currentAmount, multiplier, collateralAmount])

  // Get the appropriate leverage values based on mode
  const effectiveLeverage = useMemo(() => {
    if (isModifying) {
      return hasUserInteraction ? debouncedTargetLeverage : activeStrategy?.leverage || 2
    }
    return debouncedMultiplier
  }, [
    isModifying,
    hasUserInteraction,
    debouncedTargetLeverage,
    activeStrategy?.leverage,
    debouncedMultiplier,
  ])
  const effectiveAmount =
    isModifying && activeStrategy
      ? activeStrategy.collateralAsset.amountFormatted.toString()
      : debouncedCollateralAmount

  // Create positions for health computer using the specific account ID
  const updatedPositions = useMemo(
    () => ({
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
    }),
    [
      activeStrategy?.accountId,
      activeStrategy?.collateralAsset.denom,
      activeStrategy?.collateralAsset.amount,
      activeStrategy?.debtAsset.denom,
      activeStrategy?.debtAsset.amount,
    ],
  )

  // Use health computer hook for existing position
  const { healthFactor: computedHealthFactor } = useHealthComputer(updatedPositions)

  // Create simulated positions for new/updated position health factor
  const simulatedPositions = useMemo(() => {
    // Only create simulated positions if user has made changes
    if (!hasUserInteraction) return undefined

    const currentAmountValue =
      isModifying && activeStrategy
        ? activeStrategy.collateralAsset.amountFormatted
        : parseFloat(debouncedCollateralAmount || '0')

    const leverage = effectiveLeverage

    // Ensure we don't get negative borrow amounts
    if (leverage <= 1) return undefined

    const totalPosition = currentAmountValue * leverage
    const borrowAmount = totalPosition - currentAmountValue

    // Safety check for negative borrow amounts
    if (borrowAmount < 0) return undefined

    return {
      account_kind: 'default' as const,
      account_id: activeStrategy?.accountId || 'simulated',
      lends: [
        {
          denom: strategy.collateralAsset.denom,
          amount: new BigNumber(totalPosition)
            .shiftedBy(strategy.collateralAsset.decimals || 8)
            .integerValue()
            .toString(),
        },
      ],
      debts: [
        {
          denom: strategy.debtAsset.denom,
          amount: new BigNumber(borrowAmount)
            .shiftedBy(strategy.debtAsset.decimals || 6)
            .integerValue()
            .toString(),
          shares: '0',
        },
      ],
      deposits: [],
      staked_astro_lps: [],
      perps: [],
      vaults: [],
    }
  }, [
    hasUserInteraction,
    debouncedCollateralAmount,
    isModifying,
    activeStrategy,
    effectiveLeverage,
    strategy.collateralAsset.denom,
    strategy.collateralAsset.decimals,
    strategy.debtAsset.denom,
    strategy.debtAsset.decimals,
  ])

  // Use health computer hook for simulated position
  const { healthFactor: simulatedHealthFactor } = useHealthComputer(simulatedPositions)

  // Calculate positions using debounced values only
  const positionCalcs = usePositionCalculationsWithSimulatedApy(
    effectiveAmount,
    effectiveLeverage,
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

  // Display values
  const displayValues = createDisplayValues(
    isBalancesLoading,
    walletData.isWalletConnected,
    walletData.userBalance,
    strategy,
    marketData.currentPrice,
    effectiveMaxBtcApy,
    positionCalcs.debtBorrowApy,
  )

  // Risk styles
  const riskStyles = createRiskStyles(positionCalcs.yieldSpread)
  const strategyRiskStyles = createStrategyRiskStyles(strategy.isCorrelated)

  // Validation states
  const hasValidAmount = isModifying
    ? Boolean(activeStrategy)
    : Boolean(collateralAmount && currentAmount > 0)
  const hasInsufficientBalance = isModifying ? false : currentAmount > walletData.userBalance

  // Check available liquidity - max borrow should equal total supplied amount
  const hasInsufficientLiquidity = useMemo(() => {
    if (!marketData.debtMarket?.metrics || !hasValidAmount) return false

    const borrowAmount = positionCalcs.borrowAmount
    const totalSupplied = new BigNumber(
      marketData.debtMarket.metrics.collateral_total_amount || '0',
    )

    const borrowAmountRaw = new BigNumber(borrowAmount)
      .shiftedBy(strategy.debtAsset.decimals || 6)
      .integerValue()

    return borrowAmountRaw.gt(totalSupplied)
  }, [
    marketData.debtMarket,
    hasValidAmount,
    positionCalcs.borrowAmount,
    strategy.debtAsset.decimals,
  ])

  // Helper functions
  const getAvailableLiquidityDisplay = useCallback(() => {
    if (marketData.debtMarket?.metrics?.collateral_total_amount) {
      const totalSupplied = new BigNumber(marketData.debtMarket.metrics.collateral_total_amount)

      return totalSupplied.shiftedBy(-(strategy.debtAsset.decimals || 6)).toFixed(2)
    }
    return strategy.liquidityDisplay || 'N/A'
  }, [marketData.debtMarket?.metrics, strategy])

  const getEstimatedEarningsUsd = useCallback(() => {
    if (marketData.currentPrice > 0) {
      return `~$${(Math.abs(positionCalcs.estimatedYearlyEarnings) * marketData.currentPrice).toFixed(2)}`
    }
    return 'N/A'
  }, [marketData.currentPrice, positionCalcs.estimatedYearlyEarnings])

  const handleSwapRouteLoaded = useCallback((routeInfo: SwapRouteInfo | null) => {
    setCachedSwapRouteInfo(routeInfo)
  }, [])

  const handleSwapLoadingChange = useCallback((isLoading: boolean) => {
    setIsSwapLoading(isLoading)
  }, [])

  // Effects
  useEffect(() => {
    if (isModifying && activeStrategy && !hasInitialized) {
      setCollateralAmount(activeStrategy.collateralAsset.amountFormatted.toString())
      setMultiplier(activeStrategy.leverage)
      setTargetLeverage(activeStrategy.leverage)
      setHasInitialized(true)
    } else if (!isModifying && !hasInitialized) {
      setHasInitialized(true)
    }
  }, [isModifying, activeStrategy, hasInitialized])

  // Reset initialization flag when switching between strategies or accounts
  useEffect(() => {
    setHasInitialized(false)
  }, [accountId, strategy.collateralAsset.symbol, strategy.debtAsset.symbol])

  // Clear all data when wallet disconnects
  useEffect(() => {
    if (!address) {
      setCollateralAmount('')
      setMultiplier(2)
      setIsProcessing(false)
      setIsClosing(false)
      setCachedSwapRouteInfo(null)
      setTargetLeverage(2)
      setHasInitialized(false)
    }
  }, [address])

  // Auto-cap leverage when it exceeds limits
  useEffect(() => {
    if (
      multiplier > debtBasedLimits.effectiveMaxLeverage &&
      debtBasedLimits.effectiveMaxLeverage > 0
    ) {
      setMultiplier(Math.min(multiplier, debtBasedLimits.effectiveMaxLeverage))
    }
  }, [debtBasedLimits.effectiveMaxLeverage, multiplier, setMultiplier])

  // Auto-cap amount when it exceeds debt-based limits
  useEffect(() => {
    if (
      currentAmount > debtBasedLimits.maxAmountFromDebt &&
      isFinite(debtBasedLimits.maxAmountFromDebt)
    ) {
      const maxAmount = debtBasedLimits.maxAmountFromDebt
      setCollateralAmount(maxAmount.toFixed(8))
    }
  }, [currentAmount, debtBasedLimits.maxAmountFromDebt, setCollateralAmount])

  return {
    // State
    collateralAmount,
    setCollateralAmount,
    multiplier,
    setMultiplier,
    targetLeverage,
    setTargetLeverage,
    isProcessing,
    setIsProcessing,
    isClosing,
    setIsClosing,
    slippage,
    setSlippage,
    cachedSwapRouteInfo,

    // Derived data
    isModifying,
    currentAmount,
    effectiveLeverage,
    effectiveAmount,
    activeStrategy,
    isDataLoading,
    hasUserInteraction,

    // Calculated data
    marketData,
    walletData,
    positionCalcs,
    displayValues,
    riskStyles,
    strategyRiskStyles,
    collateralSupplyApy,
    debtBasedLimits,

    // Health factors
    computedHealthFactor,
    simulatedHealthFactor,

    // Validation
    hasValidAmount,
    hasInsufficientBalance,
    hasInsufficientLiquidity,

    // Calculation states
    isCalculatingPositions,
    isSwapLoading,

    // Helper functions
    getAvailableLiquidityDisplay,
    getEstimatedEarningsUsd,
    handleSwapRouteLoaded,
    handleSwapLoadingChange,

    // Connection
    address,
    connect,
    router,
    executeTransaction,
  }
}
