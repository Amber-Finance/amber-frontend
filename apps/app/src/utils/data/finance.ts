import BigNumber from 'bignumber.js'

// Use legacy USD calculation helper for direct 3-arg usage
import { calculateUsdValueLegacy } from '@/utils/formatting/format'

/**
 * Converts APR (Annual Percentage Rate) to APY (Annual Percentage Yield)
 * using daily compounding (n=365)
 *
 * Formula: APY = (1 + APR/n)^n - 1, where n is number of compounding periods
 *
 * @param apr - The APR value as a string, number, or BigNumber
 * @param decimals - Number of decimal places in the result (default: 2)
 * @returns The APY value as a string with specified decimal places
 */
export const convertAprToApy = (apr: string | number | BigNumber, decimals: number = 2): string => {
  let aprValue: number

  // Handle different input types
  if (apr instanceof BigNumber) {
    // Clamp BigNumber to safe JavaScript number range before conversion
    if (apr.isGreaterThan(Number.MAX_SAFE_INTEGER)) {
      aprValue = Number.MAX_SAFE_INTEGER
    } else if (apr.isLessThan(-Number.MAX_SAFE_INTEGER)) {
      aprValue = -Number.MAX_SAFE_INTEGER
    } else if (!apr.isFinite()) {
      aprValue = 0
    } else {
      aprValue = apr.toNumber()
    }
  } else if (typeof apr === 'string') {
    aprValue = parseFloat(apr)
  } else {
    aprValue = apr
  }

  // Handle invalid inputs and extreme values
  if (isNaN(aprValue) || aprValue === 0 || !isFinite(aprValue)) {
    return '0'.padEnd(decimals + 2, '0')
  }

  // Clamp APR to reasonable range (max 10000% APR = 100 as decimal)
  aprValue = Math.max(-100, Math.min(100, aprValue))

  // Calculate APY with daily compounding (n=365)
  const apy = (Math.pow(1 + aprValue / 365, 365) - 1) * 100

  // Ensure result is finite
  if (!isFinite(apy)) {
    return '0'.padEnd(decimals + 2, '0')
  }

  return apy.toFixed(decimals)
}

/**
 * Converts APR to APY and returns a BigNumber
 * Useful when you need to do further calculations with the result
 *
 * @param apr - The APR value as a string, number, or BigNumber
 * @returns The APY value as a BigNumber (not multiplied by 100)
 */
export const convertAprToApyAsBigNumber = (apr: string | number | BigNumber): BigNumber => {
  let aprValue: number

  // Handle different input types
  if (apr instanceof BigNumber) {
    // Clamp BigNumber to safe JavaScript number range before conversion
    if (apr.isGreaterThan(Number.MAX_SAFE_INTEGER)) {
      aprValue = Number.MAX_SAFE_INTEGER
    } else if (apr.isLessThan(-Number.MAX_SAFE_INTEGER)) {
      aprValue = -Number.MAX_SAFE_INTEGER
    } else if (!apr.isFinite()) {
      aprValue = 0
    } else {
      aprValue = apr.toNumber()
    }
  } else if (typeof apr === 'string') {
    aprValue = parseFloat(apr)
  } else {
    aprValue = apr
  }

  // Handle invalid inputs and extreme values
  if (isNaN(aprValue) || aprValue === 0 || !isFinite(aprValue)) {
    return new BigNumber(0)
  }

  // Clamp APR to reasonable range (max 10000% APR = 100 as decimal)
  aprValue = Math.max(-100, Math.min(100, aprValue))

  // Calculate APY with daily compounding (n=365)
  const apy = Math.pow(1 + aprValue / 365, 365) - 1

  // Ensure result is finite
  if (!isFinite(apy)) {
    return new BigNumber(0)
  }

  return new BigNumber(apy)
}

/**
 * Calculate the APY for supply assets
 * @param market - Market data object
 * @returns The APY value as a string
 */
export const getSupplyApy = (market: MarketItem): string => {
  return convertAprToApy(market.metrics.liquidity_rate || '0')
}

/**
 * Calculate the APY for borrow assets
 * @param market - Market data object
 * @returns The APY value as a string
 */
export const getBorrowApy = (market: MarketItem): string => {
  return convertAprToApy(market.metrics.borrow_rate || '0')
}

/**
 * Calculate the total/net APY for a user based on their deposits and debts across markets
 *
 * @param markets - Array of market objects with deposit and debt balances
 * @returns The net APY as a BigNumber (can be positive or negative)
 */
export const calculateTotalApy = (markets: Market[]): BigNumber => {
  if (!markets || markets.length === 0) {
    return new BigNumber(0)
  }

  let totalDepositsUSD = new BigNumber(0)
  let totalDebtsUSD = new BigNumber(0)
  let totalYieldPerYear = new BigNumber(0) // Total yield in USD per year

  // Process all markets
  markets.forEach((market) => {
    // Skip markets without price data
    if (!market.price?.price) return

    // Calculate deposit value and yield if user has deposited in this market
    if (new BigNumber(market.deposit || '0').isGreaterThan(0)) {
      const depositValue = calculateUsdValueLegacy(
        market.deposit || '0',
        market.price.price,
        market.asset.decimals,
      )

      // Convert to BigNumber for calculations
      const depositUSD = new BigNumber(depositValue)
      totalDepositsUSD = totalDepositsUSD.plus(depositUSD)

      // If liquidity rate is available, calculate actual yield in USD per year
      if (market.metrics.liquidity_rate) {
        // Convert APR to APY first
        const apyBigNumber = convertAprToApyAsBigNumber(market.metrics.liquidity_rate)
        // Calculate yearly yield based on deposit amount
        const yieldPerYear = depositUSD.multipliedBy(apyBigNumber)
        totalYieldPerYear = totalYieldPerYear.plus(yieldPerYear)
      }
    }

    // Calculate debt value and interest cost if user has debt in this market
    if (new BigNumber(market.debt || '0').isGreaterThan(0)) {
      const debtValue = calculateUsdValueLegacy(
        market.debt || '0',
        market.price.price,
        market.asset.decimals,
      )

      // Convert to BigNumber for calculations
      const debtUSD = new BigNumber(debtValue)
      totalDebtsUSD = totalDebtsUSD.plus(debtUSD)

      // If borrow rate is available, calculate actual interest cost in USD per year
      if (market.metrics.borrow_rate) {
        // Convert APR to APY first
        const apyBigNumber = convertAprToApyAsBigNumber(market.metrics.borrow_rate)
        // Calculate yearly interest cost based on debt amount (negative yield)
        const interestCostPerYear = debtUSD.multipliedBy(apyBigNumber)
        totalYieldPerYear = totalYieldPerYear.minus(interestCostPerYear)
      }
    }
  })

  // Calculate net worth
  const netWorthUSD = totalDepositsUSD.minus(totalDebtsUSD)

  // Calculate net APY based on total yield and net worth
  let netApy = new BigNumber(0)
  if (!netWorthUSD.isZero() && !netWorthUSD.isNegative()) {
    // Net APY = (Total Yield per Year / Net Worth) * 100
    netApy = totalYieldPerYear.dividedBy(netWorthUSD).multipliedBy(100)
  } else if (netWorthUSD.isNegative()) {
    // If net worth is negative, APY is meaningless - return 0
    netApy = new BigNumber(0)
  }

  return netApy
}
