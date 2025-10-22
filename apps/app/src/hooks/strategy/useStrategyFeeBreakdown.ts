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
    marsSwapFeeUsd: 0,
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

  // Mars swap fee: 5 basis points (0.05%) for Bitcoin LST swaps
  // Fee is applied to the swap amount
  const MARS_SWAP_FEE_BPS = 0.05 // 5 basis points = 0.05%

  // Try to get fee from route info first, otherwise calculate it
  let marsSwapFeeFormatted: number
  if (swapRouteInfo.fee && swapRouteInfo.fee.gt(0)) {
    // Use fee from route if available
    marsSwapFeeFormatted = swapRouteInfo.fee.shiftedBy(-collateralDecimals).toNumber()
  } else {
    // Calculate 0.05% of the output amount
    marsSwapFeeFormatted = (amountOutFormatted * MARS_SWAP_FEE_BPS) / 100
  }
  const marsSwapFeeUsd = marsSwapFeeFormatted * collateralPrice

  // Calculate price impact loss in USD
  // Price impact is the actual expected cost from the swap
  const priceImpactLoss = (amountOutFormatted * Math.abs(priceImpactPercent)) / 100
  const priceImpactUsd = priceImpactLoss * collateralPrice

  // Calculate max slippage loss (worst-case if slippage tolerance is hit)
  // Slippage tolerance is a protection limit - tx reverts if exceeded
  // This is NOT an additional cost, just the maximum acceptable deviation
  const slippageToleranceAmount = (amountOutFormatted * slippage) / 100
  const maxSlippageLossUsd = slippageToleranceAmount * collateralPrice

  // Total fees = Mars swap fee + price impact (actual expected costs)
  // Slippage tolerance is NOT included as it's just a protection limit
  const totalFeesUsd = marsSwapFeeUsd + priceImpactUsd

  // Fees as percentage of position
  const positionValueUsd = totalPosition * collateralPrice
  const feesAsPercentOfPosition = positionValueUsd > 0 ? (totalFeesUsd / positionValueUsd) * 100 : 0

  return {
    totalFeesUsd,
    marsSwapFeeUsd,
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
