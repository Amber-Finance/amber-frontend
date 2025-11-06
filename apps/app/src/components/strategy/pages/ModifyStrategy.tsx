'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import { useChain } from '@cosmos-kit/react'
import { BigNumber } from 'bignumber.js'
import { ArrowLeft } from 'lucide-react'

import { StrategyFormPanel } from '@/components/strategy/StrategyFormPanel'
import { ModifyTab, StrategyHeader } from '@/components/strategy/StrategyHeader'
import { StrategyDisplayPanel } from '@/components/strategy/display/StrategyDisplayPanel'
import {
  createDisplayValues,
  createRiskStyles,
  createStrategyRiskStyles,
} from '@/components/strategy/helpers/displayUtils'
import chainConfig from '@/config/chain'
import { useDebounceWithStatus, useHealthComputer } from '@/hooks/common'
import { useMaxBtcApy, useSimulatedApy } from '@/hooks/market'
import { useActiveStrategies } from '@/hooks/portfolio'
import {
  useMarketData,
  useStrategyAccountDepositWithdraw,
  useStrategyLeverageModification,
  useStrategyWithdrawal,
  useWalletData,
} from '@/hooks/strategy'
import { useWalletBalances } from '@/hooks/wallet'
import { useStore } from '@/store/useStore'
import { convertAprToApy } from '@/utils/data/finance'
import { convertLeverageChangeToTokenAmounts } from '@/utils/strategy/leverageCalculations'

interface ModifyStrategyProps {
  strategy: Strategy
}

export function ModifyStrategy({ strategy }: ModifyStrategyProps) {
  // Use existing active strategies data
  const activeStrategies = useActiveStrategies()

  // State management
  const [targetLeverage, setTargetLeverage] = useState(0) // Initialize to 0 to indicate not yet initialized
  const [isProcessing, setIsProcessing] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [slippage, setSlippage] = useState(0.5)
  const [hasInitialized, setHasInitialized] = useState(false)
  const [wasWalletConnected, setWasWalletConnected] = useState(false)
  const [isSwapLoading, setIsSwapLoading] = useState(false)
  // Keep cached swap route for consistency with DeployStrategy - may be used in future optimizations
  const [cachedSwapRouteInfo, setCachedSwapRouteInfo] = useState<SwapRouteInfo | null>(null)
  // Deposit/Withdraw state
  const [depositWithdrawAmount, setDepositWithdrawAmount] = useState('')
  const [depositWithdrawMode, setDepositWithdrawMode] = useState<'deposit' | 'withdraw'>('deposit')
  // Tab state for header
  const [activeTab, setActiveTab] = useState<ModifyTab>('modify')

  const router = useRouter()
  const { address, connect } = useChain(chainConfig.name)
  const { markets } = useStore()
  const { apy: maxBtcApy, error: maxBtcError } = useMaxBtcApy()
  const { data: walletBalances } = useWalletBalances()

  // Find active strategy for this collateral/debt pair
  const activeStrategy = useMemo(() => {
    return activeStrategies.find(
      (active: ActiveStrategy) =>
        active.collateralAsset.symbol === strategy.collateralAsset.symbol &&
        active.debtAsset.symbol === strategy.debtAsset.symbol,
    )
  }, [activeStrategies, strategy])

  // Calculate the values you requested from raw data
  const strategyAccountData = useMemo(() => {
    if (!activeStrategy) return null

    // Your formulas:
    // equity = collateral - borrows (this is what user actually deposited)
    const equityAmount =
      activeStrategy.collateralAsset.amountFormatted - activeStrategy.debtAsset.amountFormatted
    // leverage = collateral / equity = collateral / (collateral - borrows)
    const leverage =
      equityAmount > 0 ? activeStrategy.collateralAsset.amountFormatted / equityAmount : 1

    return {
      accountId: activeStrategy.accountId,
      collateralAmount: activeStrategy.collateralAsset.amount,
      collateralAmountFormatted: activeStrategy.collateralAsset.amountFormatted,
      debtAmount: activeStrategy.debtAsset.amount,
      debtAmountFormatted: activeStrategy.debtAsset.amountFormatted,
      equityAmount: equityAmount, // collateral - borrows
      leverage, // collateral / (collateral - borrows)
    }
  }, [activeStrategy])

  // Derived values
  const effectiveMaxBtcApy = maxBtcError ? 0 : maxBtcApy || 0
  const collateralSupplyApy = effectiveMaxBtcApy / 100
  const isDataLoading = !markets || markets.length === 0 || maxBtcApy === null

  // Check if user has entered a deposit/withdraw amount
  const hasDepositWithdrawAmount = useMemo(() => {
    const amount = Number.parseFloat(depositWithdrawAmount || '0')
    return amount > 0
  }, [depositWithdrawAmount])

  // Initialize target leverage from current position
  useEffect(() => {
    if (strategyAccountData && !hasInitialized && strategyAccountData.leverage > 0) {
      setTargetLeverage(strategyAccountData.leverage)
      setHasInitialized(true)
    }
  }, [strategyAccountData, hasInitialized])

  // Reset target leverage to current when deposit/withdraw amount is entered
  useEffect(() => {
    if (hasDepositWithdrawAmount && strategyAccountData) {
      setTargetLeverage(strategyAccountData.leverage)
    }
  }, [hasDepositWithdrawAmount, strategyAccountData])

  // Clear state when switching tabs (only when tab actually changes)
  useEffect(() => {
    // Clear deposit/withdraw amount
    setDepositWithdrawAmount('')
    // Reset target leverage to current when switching tabs
    if (strategyAccountData) {
      setTargetLeverage(strategyAccountData.leverage)
    }
    // Update depositWithdrawMode based on activeTab
    if (activeTab === 'deposit') {
      setDepositWithdrawMode('deposit')
    } else if (activeTab === 'withdraw') {
      setDepositWithdrawMode('withdraw')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

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

  // Check if user has made leverage changes (excluding deposit/withdraw mode)
  const hasLeverageChange = useMemo(() => {
    if (!strategyAccountData) return false
    if (targetLeverage === 0) return false
    return Math.abs(targetLeverage - strategyAccountData.leverage) > 0.01
  }, [strategyAccountData, targetLeverage])

  // Check if user has made changes (either leverage or deposit/withdraw)
  const hasUserInteraction = useMemo(() => {
    // In deposit/withdraw mode, only count that as interaction
    if (hasDepositWithdrawAmount) return true
    // Otherwise check for leverage changes
    return hasLeverageChange
  }, [hasDepositWithdrawAmount, hasLeverageChange])

  // Market data
  const marketData = useMarketData(strategy, markets)
  const walletData = useWalletData(strategy, walletBalances || [], address)

  // Debounce the target leverage AND deposit/withdraw amount with 2 second delay
  const { debouncedValue: debouncedTargetLeverage, isDebouncing: isLeverageDebouncing } =
    useDebounceWithStatus(targetLeverage, 2000)
  const { debouncedValue: debouncedDepositWithdrawAmount, isDebouncing: isAmountDebouncing } =
    useDebounceWithStatus(depositWithdrawAmount, 2000)

  const isCalculatingPositions = isLeverageDebouncing || isAmountDebouncing

  // Calculate effective leverage based on whether user is depositing/withdrawing or adjusting leverage
  const effectiveLeverage = useMemo(() => {
    if (!strategyAccountData) return targetLeverage || 2

    // If user has entered deposit/withdraw amount, calculate leverage based on updated position
    if (hasDepositWithdrawAmount) {
      const dwAmount = Number.parseFloat(debouncedDepositWithdrawAmount || '0')
      const currentCollateral = strategyAccountData.collateralAmountFormatted
      const currentDebt = strategyAccountData.debtAmountFormatted

      const newCollateral =
        depositWithdrawMode === 'deposit'
          ? currentCollateral + dwAmount
          : currentCollateral - dwAmount

      // Calculate new leverage: collateral / (collateral - debt)
      const newEquity = newCollateral - currentDebt
      if (newEquity <= 0) return 1
      return newCollateral / newEquity
    }

    // Otherwise use target leverage if changed
    return hasUserInteraction ? debouncedTargetLeverage : strategyAccountData.leverage
  }, [
    strategyAccountData,
    hasDepositWithdrawAmount,
    debouncedDepositWithdrawAmount,
    depositWithdrawMode,
    hasUserInteraction,
    debouncedTargetLeverage,
    targetLeverage,
  ])

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

    let equityAmount = strategyAccountData.equityAmount || 0
    const currentCollateral = strategyAccountData.collateralAmountFormatted
    const currentBorrows = strategyAccountData.debtAmountFormatted

    // Adjust equity if depositing/withdrawing
    if (hasDepositWithdrawAmount) {
      const dwAmount = Number.parseFloat(debouncedDepositWithdrawAmount || '0')
      equityAmount =
        depositWithdrawMode === 'deposit' ? equityAmount + dwAmount : equityAmount - dwAmount
    }

    // Calculate target position
    const targetTotalCollateral = equityAmount * effectiveLeverage
    const targetBorrows = targetTotalCollateral - equityAmount

    // For modify mode, borrowAmount represents the CHANGE needed:
    // - Positive: additional amount to borrow (leverage increase)
    // - Negative: amount to repay by swapping collateral (leverage decrease)
    // When depositing/withdrawing, no swaps happen, so borrowAmount should be 0
    const borrowAmountChange = hasDepositWithdrawAmount ? 0 : targetBorrows - currentBorrows

    // Calculate APY based on target position
    const leveragedApy =
      effectiveLeverage * collateralSupplyApy - (effectiveLeverage - 1) * marketData.debtBorrowApy
    const estimatedYearlyEarnings = equityAmount * leveragedApy

    return {
      borrowAmount: Math.abs(borrowAmountChange), // Always positive for swap calculations
      totalPosition: targetTotalCollateral,
      leveragedApy,
      netApy: leveragedApy,
      estimatedYearlyEarnings,
      collateralSupplyApy,
      debtBorrowApy: marketData.debtBorrowApy,
      yieldSpread: collateralSupplyApy - marketData.debtBorrowApy,
      currentCollateral,
      currentBorrows,
      targetBorrows,
      borrowAmountChange, // Signed value indicating direction
      isLeverageIncrease: borrowAmountChange > 0,
      totalBorrows: targetBorrows, // Total target borrows (not the change)
      supplies: equityAmount, // User's actual equity amount (for ExistingPositionOverviewCard)
    }
  }, [
    strategyAccountData,
    effectiveLeverage,
    collateralSupplyApy,
    marketData.debtBorrowApy,
    hasDepositWithdrawAmount,
    debouncedDepositWithdrawAmount,
    depositWithdrawMode,
  ])

  // Calculate simulated APYs based on user actions using proper leverage calculations
  const simulatedCollateralAmount = useMemo(() => {
    if (!strategyAccountData || !activeStrategy) return '0'

    // For deposit/withdraw: the change is the deposit/withdraw amount
    if (hasDepositWithdrawAmount) {
      const dwAmount = Number.parseFloat(debouncedDepositWithdrawAmount || '0')
      return dwAmount.toString()
    }

    // For leverage modification: calculate actual token amounts using leverage utilities
    if (hasLeverageChange && marketData.collateralMarket && marketData.debtMarket) {
      try {
        // Use the same calculation as the actual leverage modification hook
        const tokenAmounts = convertLeverageChangeToTokenAmounts(
          activeStrategy.collateralAsset.amount,
          activeStrategy.debtAsset.amount,
          marketData.collateralMarket.price?.price || '0',
          marketData.debtMarket.price?.price || '0',
          effectiveLeverage,
          activeStrategy.collateralAsset.decimals || 8,
          activeStrategy.debtAsset.decimals || 6,
        )

        if (tokenAmounts.isIncreasing && tokenAmounts.additionalBorrowAmount) {
          // Increasing leverage: the collateral increase equals the borrowed amount swapped to collateral
          // Convert from raw units to formatted units
          const additionalBorrowFormatted = new BigNumber(tokenAmounts.additionalBorrowAmount)
            .shiftedBy(-(activeStrategy.debtAsset.decimals || 6))
            .toString()

          // For APY simulation, we need the collateral amount that would be added
          // This is approximately equal to the borrow amount (assuming similar USD values)
          return additionalBorrowFormatted
        } else if (!tokenAmounts.isIncreasing && tokenAmounts.collateralToWithdraw) {
          // Decreasing leverage: withdraw collateral to swap for debt repayment
          const collateralToWithdrawFormatted = new BigNumber(tokenAmounts.collateralToWithdraw)
            .shiftedBy(-(activeStrategy.collateralAsset.decimals || 8))
            .toString()

          return collateralToWithdrawFormatted
        }
      } catch (error) {
        console.warn('Error calculating collateral simulation amount:', error)
        return '0'
      }
    }

    return '0'
  }, [
    strategyAccountData,
    activeStrategy,
    marketData.collateralMarket,
    marketData.debtMarket,
    hasDepositWithdrawAmount,
    debouncedDepositWithdrawAmount,
    hasLeverageChange,
    effectiveLeverage,
  ])

  const simulatedDebtAmount = useMemo(() => {
    if (!strategyAccountData || !activeStrategy) return '0'

    // For deposit/withdraw: no debt change (debt stays the same)
    if (hasDepositWithdrawAmount) {
      return '0'
    }

    // For leverage modification: use the same token amount calculations
    if (hasLeverageChange && marketData.collateralMarket && marketData.debtMarket) {
      try {
        // Use the same calculation as the actual leverage modification hook
        const tokenAmounts = convertLeverageChangeToTokenAmounts(
          activeStrategy.collateralAsset.amount,
          activeStrategy.debtAsset.amount,
          marketData.collateralMarket.price?.price || '0',
          marketData.debtMarket.price?.price || '0',
          effectiveLeverage,
          activeStrategy.collateralAsset.decimals || 8,
          activeStrategy.debtAsset.decimals || 6,
        )

        if (tokenAmounts.isIncreasing && tokenAmounts.additionalBorrowAmount) {
          // Increasing leverage: additional borrow amount
          const additionalBorrowFormatted = new BigNumber(tokenAmounts.additionalBorrowAmount)
            .shiftedBy(-(activeStrategy.debtAsset.decimals || 6))
            .toString()

          return additionalBorrowFormatted
        } else if (!tokenAmounts.isIncreasing && tokenAmounts.debtToRepay) {
          // Decreasing leverage: debt to repay
          const debtToRepayFormatted = new BigNumber(tokenAmounts.debtToRepay)
            .shiftedBy(-(activeStrategy.debtAsset.decimals || 6))
            .toString()

          return debtToRepayFormatted
        }
      } catch (error) {
        console.warn('Error calculating debt simulation amount:', error)
        return '0'
      }
    }

    return '0'
  }, [
    strategyAccountData,
    activeStrategy,
    marketData.collateralMarket,
    marketData.debtMarket,
    hasDepositWithdrawAmount,
    hasLeverageChange,
    effectiveLeverage,
  ])

  // Determine the action type for simulation
  const collateralAction: 'deposit' | 'withdraw' = useMemo(() => {
    if (hasDepositWithdrawAmount) {
      return depositWithdrawMode
    }
    // For leverage modification, determine the collateral action
    if (hasLeverageChange && strategyAccountData) {
      const currentLeverage = strategyAccountData.leverage

      if (effectiveLeverage > currentLeverage) {
        // Increasing leverage: we add collateral (from swapping borrowed debt tokens)
        return 'deposit'
      } else {
        // Decreasing leverage: we remove collateral (to swap for debt tokens to repay)
        return 'withdraw'
      }
    }
    return 'deposit'
  }, [
    hasDepositWithdrawAmount,
    depositWithdrawMode,
    hasLeverageChange,
    strategyAccountData,
    effectiveLeverage,
  ])

  const debtAction: 'borrow' | 'withdraw' = useMemo(() => {
    if (!hasUserInteraction || !strategyAccountData) return 'borrow'

    // For deposit/withdraw: no debt action needed (debt amount doesn't change)
    if (hasDepositWithdrawAmount) {
      return 'borrow' // Default, but amount will be 0 anyway
    }

    // For leverage modification: determine if we're increasing or decreasing leverage
    if (hasLeverageChange) {
      const currentLeverage = strategyAccountData.leverage

      if (effectiveLeverage > currentLeverage) {
        // Increasing leverage: borrow more debt tokens to swap for collateral
        return 'borrow'
      } else {
        // Decreasing leverage: repay debt (which is like withdrawing from debt market)
        return 'withdraw'
      }
    }

    return 'borrow'
  }, [
    hasUserInteraction,
    hasDepositWithdrawAmount,
    hasLeverageChange,
    strategyAccountData,
    effectiveLeverage,
  ])

  // Current APYs as fallback
  const currentCollateralApy = useMemo(() => {
    return marketData.collateralMarket?.metrics?.liquidity_rate
      ? convertAprToApy(marketData.collateralMarket.metrics.liquidity_rate)
      : (effectiveMaxBtcApy / 100).toString()
  }, [marketData.collateralMarket?.metrics?.liquidity_rate, effectiveMaxBtcApy])

  const currentDebtApy = useMemo(() => {
    return marketData.debtMarket?.metrics?.borrow_rate
      ? convertAprToApy(marketData.debtMarket.metrics.borrow_rate)
      : marketData.debtBorrowApy.toString()
  }, [marketData.debtMarket?.metrics?.borrow_rate, marketData.debtBorrowApy])

  // Calculate simulated collateral supply APY
  const simulatedCollateralApys = useSimulatedApy(
    collateralAction,
    hasUserInteraction ? simulatedCollateralAmount : '0',
    strategy.collateralAsset.decimals || 8,
    marketData.collateralMarket?.metrics || null,
    {
      lend: currentCollateralApy,
      borrow: '0',
    },
  )

  // Calculate simulated debt borrow APY
  // Always simulate debt APY changes when user interacts (for both deposit/withdraw and leverage changes)
  const simulatedDebtApys = useSimulatedApy(
    'borrow', // Always use 'borrow' action
    hasUserInteraction
      ? debtAction === 'borrow'
        ? simulatedDebtAmount
        : `-${simulatedDebtAmount}`
      : '0', // Use negative amount for debt repayment
    strategy.debtAsset.decimals || 6,
    marketData.debtMarket?.metrics || null,
    {
      lend: '0',
      borrow: currentDebtApy,
    },
  )

  // Debug logging for APY simulation (remove in production)
  if (hasUserInteraction && process.env.NODE_ENV === 'development') {
    const debugInfo = {
      hasLeverageChange,
      hasDepositWithdrawAmount,
      currentLeverage: strategyAccountData?.leverage,
      effectiveLeverage,
      collateralAction,
      simulatedCollateralAmount,
      debtAction,
      simulatedDebtAmount,
      actualDebtSimulationAmount: hasUserInteraction
        ? debtAction === 'borrow'
          ? simulatedDebtAmount
          : `-${simulatedDebtAmount}`
        : '0',
      currentCollateralApy,
      simulatedCollateralApy: simulatedCollateralApys.lend,
      currentDebtApy,
      simulatedDebtApy: simulatedDebtApys.borrow,
      effectiveDebtBorrowApy:
        hasUserInteraction && simulatedDebtApys.borrow !== currentDebtApy
          ? parseFloat(simulatedDebtApys.borrow) / 100
          : positionCalcs.debtBorrowApy,
      // Additional debug info
      collateralAmountFormatted: strategyAccountData?.collateralAmountFormatted,
      debtAmountFormatted: strategyAccountData?.debtAmountFormatted,
      collateralUsd: activeStrategy?.collateralAsset.usdValue,
      debtUsd: activeStrategy?.debtAsset.usdValue,
    }
  }

  // Use simulated APYs when user has interaction, otherwise use current APYs
  const effectiveCollateralSupplyApy = useMemo(() => {
    if (hasUserInteraction && simulatedCollateralApys.lend !== currentCollateralApy) {
      // Convert from percentage to decimal since createDisplayValues expects decimal
      return parseFloat(simulatedCollateralApys.lend) / 100
    }
    return collateralSupplyApy
  }, [hasUserInteraction, simulatedCollateralApys.lend, currentCollateralApy, collateralSupplyApy])

  const effectiveDebtBorrowApy = useMemo(() => {
    // Always use simulated borrow APY when user is making changes (deposit/withdraw OR leverage change)
    if (hasUserInteraction && simulatedDebtApys.borrow !== currentDebtApy) {
      // Convert from percentage to decimal (3.86 -> 0.0386) since createDisplayValues expects decimal
      return parseFloat(simulatedDebtApys.borrow) / 100
    }
    return positionCalcs.debtBorrowApy
  }, [hasUserInteraction, simulatedDebtApys.borrow, currentDebtApy, positionCalcs.debtBorrowApy])

  // Display values - use effective (simulated) debt borrow APY
  const displayValues = createDisplayValues(
    false, // Not loading balances for modify mode
    Boolean(address),
    0, // No user balance needed for modify
    strategy,
    marketData.currentPrice,
    effectiveMaxBtcApy,
    effectiveDebtBorrowApy,
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
    strategyAccountData?.equityAmount,
  ])

  // Use health computer hook for existing position
  const { healthFactor: computedHealthFactor } = useHealthComputer(updatedPositions)

  // Add withdrawal hook for position closing
  const {
    withdrawFullStrategy,
    isProcessing: isWithdrawing,
    isFetchingRoute: isFetchingCloseRoute,
  } = useStrategyWithdrawal()

  // Add deposit/withdraw hook
  const depositWithdrawHook = useStrategyAccountDepositWithdraw({
    activeStrategy,
    accountId: strategyAccountData?.accountId || '',
  })

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

  const handleSwapRouteLoaded = useCallback(
    (routeInfo: SwapRouteInfo | null) => {
      // Cache swap route info for potential reuse in modify mode
      // This ensures consistent behavior with DeployStrategy
      setCachedSwapRouteInfo(routeInfo)

      // Log for debugging - can be used for performance optimizations later
      if (cachedSwapRouteInfo && routeInfo) {
        console.debug('Swap route updated in ModifyStrategy')
      }
    },
    [cachedSwapRouteInfo],
  )

  const handleSwapLoadingChange = useCallback((isLoading: boolean) => {
    setIsSwapLoading(isLoading)
  }, [])

  // Add leverage modification hook for modify mode
  const leverageModification = useStrategyLeverageModification({
    strategy,
    accountId: strategyAccountData?.accountId || '',
    activeStrategy: activeStrategy!,
    slippage,
  })
  const isFetchingLeverageRoute = leverageModification?.isFetchingRoute || false

  // Create simulated positions for health calculation using effective (debounced) leverage
  const simulatedPositions = useMemo(() => {
    if (!activeStrategy || !strategyAccountData) return updatedPositions

    // Calculate new collateral and debt amounts based on effective leverage (debounced)
    const equityAmount = strategyAccountData.equityAmount || 0
    const targetTotalCollateral = equityAmount * effectiveLeverage
    const targetDebtAmount = targetTotalCollateral - equityAmount

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

    // Check if leverage exceeds strategy's maximum allowed leverage
    if (strategy.maxLeverage && effectiveLeverage > strategy.maxLeverage) {
      console.error(
        `Leverage ${effectiveLeverage.toFixed(2)}x exceeds maximum allowed leverage of ${strategy.maxLeverage.toFixed(2)}x for this strategy.`,
      )
      // Track the validation failure
      const { track } = await import('@/utils/common/analytics')
      track('strategy_failed', {
        strategyId: strategy.id,
        collateralSymbol: strategy.collateralAsset.symbol,
        debtSymbol: strategy.debtAsset.symbol,
        leverage: effectiveLeverage,
        maxLeverage: strategy.maxLeverage,
        reason: 'leverage_too_high',
      })
      setIsProcessing(false)
      return
    }

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
  }, [activeStrategy, leverageModification, effectiveLeverage, router, strategy])

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
      slippage,
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
  }, [activeStrategy, withdrawFullStrategy, router, slippage])

  const handleDepositWithdraw = useCallback(async () => {
    if (!activeStrategy || !strategyAccountData) return

    setIsProcessing(true)
    try {
      const amount = depositWithdrawAmount
      const denom = strategy.collateralAsset.denom
      const decimals = strategy.collateralAsset.decimals
      const symbol = strategy.collateralAsset.symbol

      let result
      if (depositWithdrawMode === 'deposit') {
        result = await depositWithdrawHook.depositToStrategy(amount, denom, decimals, symbol)
      } else {
        result = await depositWithdrawHook.withdrawFromStrategy(amount, denom, decimals, symbol)
      }

      if (result.success) {
        // Clear the deposit/withdraw amount
        setDepositWithdrawAmount('')
        // Optionally redirect or show success message
      }
    } catch (error) {
      console.error('Deposit/Withdraw failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [
    activeStrategy,
    strategyAccountData,
    depositWithdrawAmount,
    depositWithdrawMode,
    depositWithdrawHook,
    strategy.collateralAsset,
  ])

  // If no strategy account found, show error
  if (!isDataLoading && !activeStrategy) {
    return (
      <div className='w-full max-w-6xl mx-auto px-4 py-4 sm:py-6'>
        <button
          onClick={() => router.push('/strategies')}
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
        onClick={() => router.push('/strategies')}
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
        activeTab={activeTab}
        onTabChange={setActiveTab}
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
          collateralSupplyApy={effectiveCollateralSupplyApy}
          debtBorrowApy={effectiveDebtBorrowApy}
          getEstimatedEarningsUsd={getEstimatedEarningsUsd}
          healthFactor={simulatedHealthFactor || computedHealthFactor || 0}
          existingHealthFactor={computedHealthFactor}
          currentAmount={strategyAccountData?.equityAmount || 0}
          multiplier={effectiveLeverage}
          isLoading={isDataLoading}
          swapRouteInfo={cachedSwapRouteInfo}
          slippage={slippage}
          isCalculatingPositions={isCalculatingPositions}
        />

        {/* Right Column - Form Panel */}
        <StrategyFormPanel
          strategy={strategy}
          mode='modify'
          collateralAmount={strategyAccountData?.equityAmount?.toString() || ''}
          setCollateralAmount={() => {}} // Not used in modify mode
          multiplier={effectiveLeverage} // Not used in modify mode
          setMultiplier={() => {}} // Not used in modify mode
          targetLeverage={targetLeverage}
          setTargetLeverage={setTargetLeverage}
          slippage={slippage}
          setSlippage={setSlippage}
          depositWithdrawAmount={depositWithdrawAmount}
          setDepositWithdrawAmount={setDepositWithdrawAmount}
          depositWithdrawMode={depositWithdrawMode}
          setDepositWithdrawMode={setDepositWithdrawMode}
          activeTab={activeTab}
          activeStrategy={activeStrategy}
          displayValues={displayValues}
          walletData={walletData}
          marketData={marketData}
          debtBasedLimits={undefined}
          positionCalcs={positionCalcs}
          riskStyles={riskStyles}
          strategyRiskStyles={strategyRiskStyles}
          collateralSupplyApy={effectiveCollateralSupplyApy}
          debtBorrowApy={effectiveDebtBorrowApy}
          healthFactor={simulatedHealthFactor || computedHealthFactor || 0}
          simulatedHealthFactor={simulatedHealthFactor}
          computedHealthFactor={computedHealthFactor}
          hasValidAmount={Boolean(activeStrategy)}
          hasInsufficientBalance={false}
          hasInsufficientLiquidity={false}
          hasUserInteraction={hasUserInteraction}
          isCalculatingPositions={isCalculatingPositions}
          onSwapRouteLoaded={handleSwapRouteLoaded}
          onSwapLoadingChange={handleSwapLoadingChange}
          onModifyLeverage={handleLeverageModification}
          onClosePosition={handleClosePosition}
          onDepositWithdraw={handleDepositWithdraw}
          getAvailableLiquidityDisplay={getAvailableLiquidityDisplay}
          isProcessing={isProcessing || depositWithdrawHook.isProcessing}
          isClosing={isClosing}
          isWithdrawing={isWithdrawing}
          isFetchingRoute={isFetchingLeverageRoute || isFetchingCloseRoute || isSwapLoading}
          isDataLoading={isDataLoading}
          connect={connect}
        />
      </div>
    </div>
  )
}
