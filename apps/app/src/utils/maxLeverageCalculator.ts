/**
 * Calculates maximum leverage for all available denoms using LTV formula
 * maxLev = 1 / (1 - LTV)
 */
export function maxLeverageCalculator(markets: Market[]): { [denom: string]: number } {
  const leverageResults: { [denom: string]: number } = {}

  markets.forEach((market) => {
    try {
      // Use LTV from market params
      const maxLTV = parseFloat(market.params?.max_loan_to_value || '0.8')

      // Calculate max leverage using LTV formula: maxLev = 1 / (1 - LTV)
      const maxLeverage = maxLTV > 0 ? Math.min(1 / (1 - maxLTV), 10) : 1

      leverageResults[market.asset.denom] = maxLeverage
    } catch (error) {
      console.warn(`Error calculating leverage for ${market.asset.symbol}:`, error)
      leverageResults[market.asset.denom] = 5 // Fallback to 5x
    }
  })

  return leverageResults
}

/**
 * Gets the max leverage for a specific debt asset denom using LTV formula
 */
export function getMaxLeverageForDenom(
  debtDenom: string,
  markets: Market[],
  isWasmReady: boolean,
): number {
  const market = markets.find((m) => m.asset.denom === debtDenom)
  if (!market) return 5 // Fallback to 5x

  const maxLTV = parseFloat(market.params?.max_loan_to_value || '0.8')
  return maxLTV > 0 ? Math.min(1 / (1 - maxLTV), 10) : 5
}

/**
 * Gets the max leverage for a strategy based on its debt asset using LTV formula
 */
export function getMaxLeverageForStrategy(
  strategy: Strategy,
  markets: Market[],
  isWasmReady: boolean,
): number {
  // Use simple LTV calculation
  const ltvLeverage = getMaxLeverageForDenom(strategy.debtAsset.denom, markets, isWasmReady)

  // Return LTV-based leverage, capped at reasonable maximum
  return Math.min(ltvLeverage, 50)
}
