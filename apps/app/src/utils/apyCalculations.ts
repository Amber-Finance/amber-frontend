import BigNumber from 'bignumber.js'

import { convertAprToApy } from '@/utils/finance'

/**
 * Calculate the lending and borrowing APY after a specific action (deposit or borrow)
 *
 * @param action - The action to simulate: 'deposit' or 'borrow'
 * @param amount - The amount in the smallest unit (e.g., satoshis for BTC)
 * @param marketData - The current market data containing utilization and interest rate model
 * @returns Object with lending and borrowing APY as formatted strings
 */
export function calculateApyAfterAction(
  action: 'deposit' | 'borrow',
  amount: string | number,
  marketData: MarketDataItem,
): {
  apys: {
    lend: string
    borrow: string
  }
} {
  // Convert amount to BigNumber for precise calculations
  const actionAmount = new BigNumber(amount)

  // Extract current market values
  const currentCollateralTotal = new BigNumber(marketData.collateral_total_amount)
  const currentDebtTotal = new BigNumber(marketData.debt_total_amount)

  // Calculate new totals based on action
  let newCollateralTotal = currentCollateralTotal
  let newDebtTotal = currentDebtTotal

  if (action === 'deposit') {
    newCollateralTotal = currentCollateralTotal.plus(actionAmount)
  } else if (action === 'borrow') {
    newDebtTotal = currentDebtTotal.plus(actionAmount)
  } else {
    throw new Error('Invalid action. Use "deposit" or "borrow".')
  }

  // Calculate new utilization rate
  const newUtilizationRate = newCollateralTotal.isZero()
    ? new BigNumber(0)
    : newDebtTotal.dividedBy(newCollateralTotal)

  // Extract interest rate model parameters
  const interestRateModel = marketData.interest_rate_model
  const baseRate = new BigNumber(interestRateModel.base)
  const optimalUtilizationRate = new BigNumber(interestRateModel.optimal_utilization_rate)
  const slope1 = new BigNumber(interestRateModel.slope_1)
  const slope2 = new BigNumber(interestRateModel.slope_2)
  const reserveFactor = new BigNumber(marketData.reserve_factor)

  // Calculate borrow rate using Mars Protocol interest rate model
  let borrowRate: BigNumber

  if (newUtilizationRate.isLessThanOrEqualTo(optimalUtilizationRate)) {
    // Below optimal utilization: rate = base + (utilization / optimal_utilization) * slope_1
    borrowRate = baseRate.plus(
      newUtilizationRate.dividedBy(optimalUtilizationRate).multipliedBy(slope1),
    )
  } else {
    // Above optimal utilization: rate = base + slope_1 + ((utilization - optimal) / (1 - optimal)) * slope_2
    const excessUtilization = newUtilizationRate.minus(optimalUtilizationRate)
    const maxExcessUtilization = new BigNumber(1).minus(optimalUtilizationRate)

    borrowRate = baseRate
      .plus(slope1)
      .plus(excessUtilization.dividedBy(maxExcessUtilization).multipliedBy(slope2))
  }

  // Calculate supply rate: supply_rate = borrow_rate * utilization * (1 - reserve_factor)
  const supplyRate = borrowRate
    .multipliedBy(newUtilizationRate)
    .multipliedBy(new BigNumber(1).minus(reserveFactor))

  // Convert APR to APY using existing utility function
  const borrowApy = convertAprToApy(borrowRate.toString(), 2)
  const lendApy = convertAprToApy(supplyRate.toString(), 2)

  return {
    apys: {
      lend: lendApy,
      borrow: borrowApy,
    },
  }
}
