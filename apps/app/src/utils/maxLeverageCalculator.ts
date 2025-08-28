import { BigNumber } from 'bignumber.js'

import { buildHealthComputer } from '@/utils/healthComputer'
import { max_borrow_estimate_js } from '@/utils/health_computer'

// Global cache for max leverage calculations
let maxLeverageCache: { [key: string]: { [denom: string]: number } } = {}
const MAX_CACHE_SIZE = 10 // Limit cache to prevent memory issues

/**
 * Generates a cache key based on markets data
 */
function generateCacheKey(markets: Market[]): string {
  // Create a simple hash based on market data
  const sortedMarkets = [...markets].sort((a, b) => a.asset.denom.localeCompare(b.asset.denom))
  return sortedMarkets.map((m) => `${m.asset.denom}:${m.price?.price || '0'}`).join('|')
}

/**
 * Calculates maximum leverage for all available denoms using a fake credit account
 * with 1 wBTC Eureka as collateral
 */
export function maxLeverageCalculator(
  markets: Market[],
  isWasmReady: boolean,
): { [denom: string]: number } {
  if (!isWasmReady || !markets) {
    console.warn('Health computer not ready or markets not available')
    return {}
  }

  // Check cache first
  const cacheKey = generateCacheKey(markets)
  if (maxLeverageCache[cacheKey]) {
    return maxLeverageCache[cacheKey]
  }

  try {
    // Build a test health computer
    const testHealthComputer = buildHealthComputer(markets)
    if (!testHealthComputer) {
      console.warn('Could not build test health computer')
      return {}
    }

    // Create fake credit account with 1 wBTC Eureka supply (8 decimals)
    const oneWBTCMicro = (1 * 100_000_000).toString() // 1 wBTC = 100,000,000 micro units (8 decimals)
    const wBTCEurekaDenom = 'ibc/0E293A7622DC9A6439DB60E6D234B5AF446962E27CA3AB44D0590603DFF6968E' // wBTC.eureka denom

    // Add 1 wBTC Eureka as collateral
    testHealthComputer.positions.lends.push({
      denom: wBTCEurekaDenom,
      amount: oneWBTCMicro,
    })

    // Calculate max leverage for all denoms

    // Test max borrow amount for each available denom
    const leverageResults: { [denom: string]: number } = {}

    markets.forEach((market) => {
      try {
        const maxBorrowAmount = new BigNumber(
          max_borrow_estimate_js(testHealthComputer, market.asset.denom, 'deposit'),
        ).integerValue()

        if (!maxBorrowAmount.isZero()) {
          // Convert back from microunits to normal units
          const decimals = market.asset.decimals || 6
          const maxBorrowNormal = maxBorrowAmount.shiftedBy(-decimals).toNumber()

          // Calculate max leverage: 1 + (maxBorrow / 1 wBTC)
          const maxLeverage = 1 + maxBorrowNormal

          leverageResults[market.asset.denom] = maxLeverage

          // Max leverage calculated successfully
        }
      } catch (error) {
        console.warn(`Error calculating leverage for ${market.asset.symbol}:`, error)
      }
    })

    // Cache the results with size limiting
    if (Object.keys(maxLeverageCache).length >= MAX_CACHE_SIZE) {
      // Remove oldest entry (simple FIFO)
      const firstKey = Object.keys(maxLeverageCache)[0]
      delete maxLeverageCache[firstKey]
    }

    maxLeverageCache[cacheKey] = leverageResults

    return leverageResults
  } catch (error) {
    console.warn('Error in maxLeverageCalculator:', error)
    return {}
  }
}

/**
 * Clears the max leverage cache
 */
export function clearMaxLeverageCache(): void {
  maxLeverageCache = {}
}

/**
 * Gets the current cache size
 */
export function getMaxLeverageCacheSize(): number {
  return Object.keys(maxLeverageCache).length
}

/**
 * Gets the max leverage for a specific debt asset denom
 */
export function getMaxLeverageForDenom(
  debtDenom: string,
  markets: Market[],
  isWasmReady: boolean,
): number {
  const leverageResults = maxLeverageCalculator(markets, isWasmReady)

  // Return the calculated leverage directly, or fallback to strategy max if not found
  return leverageResults[debtDenom] || 1.1 // Minimal fallback if health computer calculation fails
}

/**
 * Gets the max leverage for a strategy based on its debt asset
 */
export function getMaxLeverageForStrategy(
  strategy: Strategy,
  markets: Market[],
  isWasmReady: boolean,
): number {
  // Get the health computer calculated leverage
  const calculatedLeverage = getMaxLeverageForDenom(strategy.debtAsset.denom, markets, isWasmReady)

  // If health computer calculation succeeded (> 1.1), use it directly
  if (calculatedLeverage > 1.1) {
    // Cap at reasonable maximum to prevent UI issues
    return Math.min(calculatedLeverage, 50)
  }

  // Fallback to strategy's predefined max leverage only if health computer failed
  return strategy.maxLeverage || 5
}
