import { useMemo } from 'react'

/**
 * Hook to calculate fee breakdown and break-even time for strategy deployment/modification
 *
 * Calculates:
 * - Total fees from swaps (price impact)
 * - Break-even time based on leveraged APY
 * - Visual indicators for fee recovery timeline
 *
 * @param swapRouteInfo - Swap route information containing amountIn, amountOut, priceImpact
 * @param positionCalcs - Position calculations including leveragedApy, totalPosition
 * @param collateralPrice - Price of collateral asset in USD
 * @param debtDecimals - Decimals for debt asset
 * @param collateralDecimals - Decimals for collateral asset
 * @param slippage - User's slippage tolerance percentage
 *
 * @returns Fee breakdown with total fees, recovery time, and visual indicators
 */
export function useStrategyFeeBreakdown(
  swapRouteInfo: SwapRouteInfo | null,
  positionCalcs: {
    leveragedApy: number
    totalPosition: number
    estimatedYearlyEarnings: number
  },
  collateralPrice: number,
  debtDecimals: number,
  collateralDecimals: number,
  slippage: number = 0.5,
) {
  return useMemo(() => {
    // Return null state if no swap route info
    if (!swapRouteInfo || !swapRouteInfo.amountIn || !swapRouteInfo.amountOut) {
      return createNullState()
    }

    // Calculate fee components
    const feeComponents = calculateFeeComponents(
      swapRouteInfo,
      collateralPrice,
      debtDecimals,
      collateralDecimals,
      slippage,
      positionCalcs.totalPosition,
    )

    // Calculate break-even metrics
    const breakEvenMetrics = calculateBreakEvenMetrics(
      feeComponents.totalFeesUsd,
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
    collateralPrice,
    debtDecimals,
    collateralDecimals,
    slippage,
  ])
}

// Helper function to create null state
function createNullState() {
  return {
    totalFeesUsd: 0,
    swapFeeUsd: 0,
    priceImpactUsd: 0,
    maxSlippageLossUsd: 0,
    breakEvenDays: null,
    breakEvenFormatted: 'N/A',
    feesAsPercentOfPosition: 0,
    canRecover: false,
    recoveryHealthColor: 'text-muted-foreground',
    recoveryHealthLabel: 'N/A',
  }
}

// Helper function to calculate fee components
function calculateFeeComponents(
  swapRouteInfo: SwapRouteInfo,
  collateralPrice: number,
  debtDecimals: number,
  collateralDecimals: number,
  slippage: number,
  totalPosition: number,
) {
  const priceImpactPercent = swapRouteInfo.priceImpact?.toNumber() || 0

  // SwapRouteInfo amounts are in RAW units and need to be shifted by decimals
  // amountOut is collateral asset (being swapped TO)
  const amountOutFormatted = swapRouteInfo.amountOut.shiftedBy(-collateralDecimals).toNumber()

  // Contract swap fee: 0.0005 where 1 = 100% (so 0.0005 = 0.05%)
  // The amountOut from swap route is the gross amount before fee deduction
  // The contract will deduct the fee, so actual received = amountOut * (1 - swapFee)
  const SWAP_FEE_RATE = 0.0005 // Contract fee rate where 1 = 100%

  // Calculate the actual amount received after fee deduction
  const netAmountOut = amountOutFormatted * (1 - SWAP_FEE_RATE)

  // Calculate the swap fee that will be deducted
  const swapFeeFormatted = amountOutFormatted - netAmountOut
  const swapFeeUsd = swapFeeFormatted * collateralPrice

  // Calculate price impact loss in USD
  // Price impact is calculated on the net amount (after fees) that user actually receives
  const priceImpactLoss = (netAmountOut * Math.abs(priceImpactPercent)) / 100
  const priceImpactUsd = priceImpactLoss * collateralPrice

  // Calculate max slippage loss (worst-case if slippage tolerance is hit)
  // Slippage tolerance is a protection limit - tx reverts if exceeded
  // This is NOT an additional cost, just the maximum acceptable deviation
  // Applied to the net amount the user receives
  const slippageToleranceAmount = (netAmountOut * slippage) / 100
  const maxSlippageLossUsd = slippageToleranceAmount * collateralPrice

  // Total fees = Swap fee + price impact (actual expected costs)
  // Slippage tolerance is NOT included as it's just a protection limit
  const totalFeesUsd = swapFeeUsd + priceImpactUsd

  // Fees as percentage of position
  const positionValueUsd = totalPosition * collateralPrice
  const feesAsPercentOfPosition = positionValueUsd > 0 ? (totalFeesUsd / positionValueUsd) * 100 : 0

  return {
    totalFeesUsd,
    swapFeeUsd,
    priceImpactUsd,
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
function calculateBreakEvenMetrics(totalFeesUsd: number, annualEarningsUsd: number) {
  if (annualEarningsUsd > 0 && totalFeesUsd > 0) {
    const yearsToBreakEven = totalFeesUsd / annualEarningsUsd
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

  // Negative or zero APY
  return {
    breakEvenDays: null,
    breakEvenFormatted: 'Never (Negative APY)',
    canRecover: false,
    recoveryHealthColor: 'text-red-600 dark:text-red-400',
    recoveryHealthLabel: 'Not Recoverable',
  }
}
