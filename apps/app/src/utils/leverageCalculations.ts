import { BigNumber } from 'bignumber.js'

/**
 * Calculate additional borrow amount needed to reach target leverage
 * Formula: targetDebtUsd = (targetLeverage - 1) * currentEquity
 * where currentEquity = currentCollateralUsd - currentDebtUsd
 *
 * Derivation:
 * - Target leverage L = collateral / equity
 * - collateral = equity + debt
 * - So: L = (equity + debt) / equity = 1 + debt/equity
 * - Therefore: debt = (L - 1) * equity
 */
export const calculateAdditionalBorrowAmount = (
  currentCollateralUsd: number,
  currentDebtUsd: number,
  targetLeverage: number,
): number => {
  const currentEquity = currentCollateralUsd - currentDebtUsd

  if (currentEquity <= 0) {
    throw new Error('Invalid position: negative or zero equity')
  }

  if (targetLeverage < 2.0) {
    throw new Error('Target leverage must be at least 2.0x')
  }

  const targetDebtUsd = (targetLeverage - 1) * currentEquity
  const additionalBorrowUsd = targetDebtUsd - currentDebtUsd

  // Cannot borrow negative amount
  return Math.max(0, additionalBorrowUsd)
}

/**
 * Calculate collateral amount to withdraw to reach target leverage
 * When reducing leverage, we withdraw collateral, swap it to debt token, and repay debt
 * This reduces both collateral and debt proportionally
 *
 * Formula: targetCollateralUsd = targetLeverage * currentEquity
 * collateralToWithdraw = currentCollateralUsd - targetCollateralUsd
 *
 * Derivation:
 * - Target leverage L = collateral / equity
 * - Current equity stays the same during the transaction
 * - Therefore: targetCollateral = L × currentEquity
 */
export const calculateCollateralToWithdraw = (
  currentCollateralUsd: number,
  currentDebtUsd: number,
  targetLeverage: number,
): number => {
  if (targetLeverage < 2.0) {
    throw new Error('Target leverage must be at least 2.0x for positions with debt')
  }

  if (currentDebtUsd <= 0) {
    throw new Error('Cannot decrease leverage with zero debt')
  }

  const currentEquity = currentCollateralUsd - currentDebtUsd
  if (currentEquity <= 0) {
    throw new Error('Invalid position: negative or zero equity')
  }

  const targetCollateralUsd = targetLeverage * currentEquity
  const collateralToWithdraw = currentCollateralUsd - targetCollateralUsd

  // Cannot withdraw negative amount or more than available
  return Math.max(0, Math.min(collateralToWithdraw, currentCollateralUsd))
}

/**
 * Calculate current leverage from position
 * Formula: leverage = collateralUsd / (collateralUsd - debtUsd)
 */
export const calculateCurrentLeverage = (collateralUsd: number, debtUsd: number): number => {
  const equity = collateralUsd - debtUsd

  if (equity <= 0) {
    return 0 // Invalid position
  }

  return collateralUsd / equity
}

/**
 * Calculate position health factor
 * Formula: healthFactor = (collateralUsd * ltv) / debtUsd
 */
export const calculateHealthFactor = (
  collateralUsd: number,
  debtUsd: number,
  maxLoanToValue: number, // LTV as decimal (e.g., 0.8 for 80%)
): number => {
  if (debtUsd <= 0) {
    return Number.MAX_SAFE_INTEGER // No debt = infinite health
  }

  return (collateralUsd * maxLoanToValue) / debtUsd
}

/**
 * Validate if target leverage is safe (health factor > 1.0)
 */
export const validateLeverageChange = (
  currentCollateralUsd: number,
  currentDebtUsd: number,
  targetLeverage: number,
  maxLoanToValue: number,
  minHealthFactor: number = 1, // below 1.0 is liquidation threshold
): {
  isValid: boolean
  newHealthFactor: number
  error?: string
} => {
  try {
    let newCollateralUsd = currentCollateralUsd
    let newDebtUsd = currentDebtUsd

    const currentLeverage = calculateCurrentLeverage(currentCollateralUsd, currentDebtUsd)

    if (targetLeverage > currentLeverage) {
      // Increasing leverage: more debt
      const additionalBorrowUsd = calculateAdditionalBorrowAmount(
        currentCollateralUsd,
        currentDebtUsd,
        targetLeverage,
      )
      newDebtUsd += additionalBorrowUsd
      // Assume borrowed amount is swapped to collateral
      newCollateralUsd += additionalBorrowUsd
    } else {
      // Decreasing leverage: withdraw collateral, swap to debt, repay
      const collateralToWithdraw = calculateCollateralToWithdraw(
        currentCollateralUsd,
        currentDebtUsd,
        targetLeverage,
      )
      newCollateralUsd -= collateralToWithdraw
      // Assume withdrawn collateral is swapped to debt token and used to repay
      newDebtUsd -= collateralToWithdraw
    }

    const newHealthFactor = calculateHealthFactor(newCollateralUsd, newDebtUsd, maxLoanToValue)

    if (newHealthFactor < minHealthFactor) {
      return {
        isValid: false,
        newHealthFactor,
        error: `Target leverage would result in health factor of ${newHealthFactor.toFixed(2)}, which is below the safe threshold of ${minHealthFactor.toFixed(2)}`,
      }
    }

    return {
      isValid: true,
      newHealthFactor,
    }
  } catch (error) {
    return {
      isValid: false,
      newHealthFactor: 0,
      error: error instanceof Error ? error.message : 'Unknown validation error',
    }
  }
}

/**
 * Calculate maximum safe leverage given LTV and minimum health factor
 */
export const calculateMaxSafeLeverage = (
  maxLoanToValue: number,
  minHealthFactor: number = 1.0,
): number => {
  // From health factor formula: HF = (collateral * LTV) / debt
  // From leverage formula: leverage = debt / equity = debt / (collateral - debt)
  // Solving for max leverage where HF >= minHealthFactor

  // This is a simplified calculation - in practice, you'd want to account for
  // slippage, fees, and other factors that could affect the final position
  const theoreticalMaxLeverage = maxLoanToValue / (maxLoanToValue - 1 / minHealthFactor)

  // Apply safety buffer
  return Math.max(1, theoreticalMaxLeverage * 0.95)
}

/**
 * Calculate debt amount to repay to reach target leverage
 * When reducing leverage, we need to repay some debt to reduce the leverage ratio
 */
export const calculateDebtToRepay = (
  currentCollateralUsd: number,
  currentDebtUsd: number,
  targetLeverage: number,
): number => {
  if (targetLeverage < 1.0) {
    throw new Error('Target leverage must be at least 1.0x')
  }

  if (currentDebtUsd <= 0) {
    throw new Error('Cannot decrease leverage with zero debt')
  }

  const currentEquity = currentCollateralUsd - currentDebtUsd
  if (currentEquity <= 0) {
    throw new Error('Invalid position: negative or zero equity')
  }

  // For target leverage: targetLeverage = collateral / equity
  // Since we're only repaying debt, collateral stays the same
  // So: targetLeverage = currentCollateral / (currentCollateral - targetDebt)
  // Solving for targetDebt: targetDebt = currentCollateral - (currentCollateral / targetLeverage)
  const targetDebtUsd = currentCollateralUsd - currentCollateralUsd / targetLeverage
  const debtToRepayUsd = currentDebtUsd - targetDebtUsd

  // Cannot repay negative amount or more than current debt
  return Math.max(0, Math.min(debtToRepayUsd, currentDebtUsd))
}

/**
 * Convert leverage change to token amounts
 */
export const convertLeverageChangeToTokenAmounts = (
  currentCollateralAmount: string,
  currentDebtAmount: string,
  currentCollateralPrice: string,
  currentDebtPrice: string,
  targetLeverage: number,
  collateralDecimals: number,
  debtDecimals: number,
): {
  additionalBorrowAmount?: string // For increasing leverage
  collateralToWithdraw?: string // For decreasing leverage (legacy - kept for compatibility)
  debtToRepay?: string // For decreasing leverage (new - for reverse routing)
  isIncreasing: boolean
} => {
  const collateralUsd = new BigNumber(currentCollateralAmount)
    .shiftedBy(-collateralDecimals)
    .multipliedBy(currentCollateralPrice)
    .toNumber()

  const debtUsd = new BigNumber(currentDebtAmount)
    .shiftedBy(-debtDecimals)
    .multipliedBy(currentDebtPrice)
    .toNumber()

  const currentLeverage = calculateCurrentLeverage(collateralUsd, debtUsd)
  const isIncreasing = targetLeverage > currentLeverage

  if (isIncreasing) {
    const additionalBorrowUsd = calculateAdditionalBorrowAmount(
      collateralUsd,
      debtUsd,
      targetLeverage,
    )

    const additionalBorrowAmount = new BigNumber(additionalBorrowUsd)
      .dividedBy(currentDebtPrice)
      .shiftedBy(debtDecimals)
      .integerValue(BigNumber.ROUND_DOWN)
      .toString()

    return {
      additionalBorrowAmount,
      isIncreasing: true,
    }
  } else {
    const collateralToWithdrawUsd = calculateCollateralToWithdraw(
      collateralUsd,
      debtUsd,
      targetLeverage,
    )

    const collateralToWithdraw = new BigNumber(collateralToWithdrawUsd)
      .dividedBy(currentCollateralPrice)
      .shiftedBy(collateralDecimals)
      .integerValue(BigNumber.ROUND_DOWN)
      .toString()

    // Also calculate the debt amount to repay for reverse routing
    const debtToRepayUsd = calculateDebtToRepay(collateralUsd, debtUsd, targetLeverage)

    const debtToRepay = new BigNumber(debtToRepayUsd)
      .dividedBy(currentDebtPrice)
      .shiftedBy(debtDecimals)
      .integerValue(BigNumber.ROUND_UP)
      .toString()

    return {
      collateralToWithdraw, // Keep for compatibility
      debtToRepay, // New field for reverse routing
      isIncreasing: false,
    }
  }
}
