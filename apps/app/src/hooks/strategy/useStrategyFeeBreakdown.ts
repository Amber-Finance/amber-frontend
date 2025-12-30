import { useMemo } from 'react'

/**
 * Hook to calculate fee breakdown and break-even time for strategy deployment/modification
 *
 * Calculates slippage as the USD value difference between input and output,
 * using oracle prices only (not Skip API's USD values which are inaccurate).
 *
 * @param swapRouteInfo - Swap route information (only amountOut is used)
 * @param positionCalcs - Position calculations including leveragedApy, totalPosition
 * @param collateralPrice - Oracle price of collateral asset in USD
 * @param debtPrice - Oracle price of debt asset in USD
 * @param debtDecimals - Decimals for debt asset
 * @param collateralDecimals - Decimals for collateral asset
 * @param slippage - User's slippage tolerance percentage
 * @param isLeverageIncrease - Whether leverage is increasing (true) or decreasing (false)
 *
 * @returns Fee breakdown with total fees, recovery time, and visual indicators
 */
export function useStrategyFeeBreakdown(
  swapRouteInfo: SwapRouteInfo | null,
  positionCalcs: {
    leveragedApy: number
    totalPosition: number
    estimatedYearlyEarnings: number
    borrowAmount: number
  },
  collateralPrice: number,
  debtPrice: number,
  debtDecimals: number,
  collateralDecimals: number,
  slippage: number = 0.5,
  isLeverageIncrease: boolean = true,
) {
  return useMemo(() => {
    // Return null state if no swap route info
    if (!swapRouteInfo?.amountOut) {
      return createNullState()
    }

    // Calculate fee components using oracle prices only
    const feeComponents = calculateFeeComponents(
      swapRouteInfo,
      collateralPrice,
      debtPrice,
      debtDecimals,
      collateralDecimals,
      slippage,
      positionCalcs.totalPosition,
      positionCalcs.borrowAmount,
      isLeverageIncrease,
    )

    // Calculate break-even metrics
    const breakEvenMetrics = calculateBreakEvenMetrics(
      feeComponents.slippageLossUsd,
      positionCalcs.estimatedYearlyEarnings * collateralPrice,
    )

    return {
      ...feeComponents,
      ...breakEvenMetrics,
    }
  }, [
    swapRouteInfo,
    positionCalcs.leveragedApy,
    positionCalcs.totalPosition,
    positionCalcs.estimatedYearlyEarnings,
    positionCalcs.borrowAmount,
    collateralPrice,
    debtPrice,
    debtDecimals,
    collateralDecimals,
    slippage,
    isLeverageIncrease,
  ])
}

// Helper function to create null state
function createNullState() {
  return {
    inputValueUsd: 0,
    outputValueUsd: 0,
    swapFeeUsd: 0,
    slippageLossUsd: 0,
    slippagePercent: 0,
    maxSlippageLossUsd: 0,
    breakEvenDays: null,
    breakEvenFormatted: 'N/A',
    feesAsPercentOfPosition: 0,
    canRecover: false,
    recoveryHealthColor: 'text-muted-foreground',
    recoveryHealthLabel: 'N/A',
  }
}

// Helper function to calculate fee components using oracle prices only
function calculateFeeComponents(
  swapRouteInfo: SwapRouteInfo,
  collateralPrice: number,
  debtPrice: number,
  debtDecimals: number,
  collateralDecimals: number,
  slippage: number,
  totalPosition: number,
  borrowAmount: number,
  isLeverageIncrease: boolean,
) {
  // Contract swap fee: 0.0005 (0.05%)
  const SWAP_FEE_RATE = 0.0005

  // Calculate input value using oracle price (borrow amount * debt oracle price)
  const inputValueUsd = borrowAmount * debtPrice

  // When increasing leverage: swap debt → collateral, amountOut is in collateral
  // When decreasing leverage: swap collateral → debt, amountOut is in debt
  const outputDecimals = isLeverageIncrease ? collateralDecimals : debtDecimals
  const outputPrice = isLeverageIncrease ? collateralPrice : debtPrice

  // Get output amount from Skip (only thing we trust from Skip)
  const amountOutFormatted = swapRouteInfo.amountOut.shiftedBy(-outputDecimals).toNumber()

  // Calculate net amount after 0.05% swap fee
  const netAmountOut = amountOutFormatted * (1 - SWAP_FEE_RATE)

  // Calculate swap fee in USD
  const swapFeeAmount = amountOutFormatted - netAmountOut
  const swapFeeUsd = swapFeeAmount * outputPrice

  // Calculate output value using oracle price
  const outputValueUsd = netAmountOut * outputPrice

  // Slippage is the difference between input and output values
  const slippageLossUsd = inputValueUsd - outputValueUsd
  const slippagePercent = inputValueUsd > 0 ? (slippageLossUsd / inputValueUsd) * 100 : 0

  // Max slippage loss (worst-case if slippage tolerance is hit)
  const slippageToleranceAmount = (netAmountOut * slippage) / 100
  const maxSlippageLossUsd = slippageToleranceAmount * outputPrice

  // Fees as percentage of position
  const positionValueUsd = totalPosition * collateralPrice
  const feesAsPercentOfPosition =
    positionValueUsd > 0 ? (slippageLossUsd / positionValueUsd) * 100 : 0

  return {
    inputValueUsd,
    outputValueUsd,
    swapFeeUsd,
    slippageLossUsd,
    slippagePercent,
    maxSlippageLossUsd,
    feesAsPercentOfPosition,
  }
}

// Helper function to format break-even time
function formatBreakEvenTime(days: number): string {
  if (days < 1) {
    const hours = Math.ceil(days * 24)
    return `${hours} hour${hours !== 1 ? 's' : ''}`
  }
  if (days < 7) {
    const daysRounded = Math.ceil(days)
    return `${daysRounded} day${daysRounded !== 1 ? 's' : ''}`
  }
  if (days < 30) {
    const weeks = Math.ceil(days / 7)
    return `${weeks} week${weeks !== 1 ? 's' : ''}`
  }
  if (days < 365) {
    const months = Math.ceil(days / 30)
    return `${months} month${months !== 1 ? 's' : ''}`
  }
  const years = (days / 365).toFixed(1)
  return `${years} year${years !== '1.0' ? 's' : ''}`
}

// Helper function to get recovery health indicators
function getRecoveryHealth(days: number): {
  color: string
  label: string
} {
  if (days < 30) {
    return {
      color: 'text-emerald-600 dark:text-emerald-400',
      label: 'Excellent',
    }
  }
  if (days < 90) {
    return {
      color: 'text-green-600 dark:text-green-400',
      label: 'Good',
    }
  }
  if (days < 180) {
    return {
      color: 'text-yellow-600 dark:text-yellow-400',
      label: 'Moderate',
    }
  }
  if (days < 365) {
    return {
      color: 'text-orange-600 dark:text-orange-400',
      label: 'Long',
    }
  }
  return {
    color: 'text-red-600 dark:text-red-400',
    label: 'Very Long',
  }
}

// Helper function to calculate break-even metrics
function calculateBreakEvenMetrics(slippageLossUsd: number, annualEarningsUsd: number) {
  // No loss or gained value - nothing to recover
  if (slippageLossUsd <= 0) {
    return {
      breakEvenDays: 0,
      breakEvenFormatted: 'Immediate',
      canRecover: true,
      recoveryHealthColor: 'text-emerald-600 dark:text-emerald-400',
      recoveryHealthLabel: 'No Loss',
    }
  }

  // Positive loss but positive earnings - can recover
  if (annualEarningsUsd > 0) {
    const yearsToBreakEven = slippageLossUsd / annualEarningsUsd
    const breakEvenDays = yearsToBreakEven * 365
    const health = getRecoveryHealth(breakEvenDays)

    return {
      breakEvenDays,
      breakEvenFormatted: formatBreakEvenTime(breakEvenDays),
      canRecover: true,
      recoveryHealthColor: health.color,
      recoveryHealthLabel: health.label,
    }
  }

  // Negative or zero APY - cannot recover
  return {
    breakEvenDays: null,
    breakEvenFormatted: 'Never (Negative APY)',
    canRecover: false,
    recoveryHealthColor: 'text-red-600 dark:text-red-400',
    recoveryHealthLabel: 'Not Recoverable',
  }
}
