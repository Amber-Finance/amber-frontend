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

      // Calculate max leverage using LTV formula with safety buffer: maxLev = 1 / (1 - LTV) - 0.5
      const theoreticalMaxLeverage = maxLTV > 0 ? 1 / (1 - maxLTV) - 1 : 1
      // Apply 0.5x safety buffer
      const maxLeverage = Math.max(1, theoreticalMaxLeverage - 0.5)

      // Console log maxLeverageCalculator values
      console.log(`📊 maxLeverageCalculator ${market.asset.symbol}:`, {
        maxLTV,
        rawMaxLoanToValue: market.params?.max_loan_to_value,
        calculatedMaxLeverage: maxLeverage,
        marketDenom: market.asset.denom,
      })

      leverageResults[market.asset.denom] = maxLeverage
    } catch (error) {
      console.warn(`Error calculating leverage for ${market.asset.symbol}:`, error)
      leverageResults[market.asset.denom] = 1 // Fallback to 1x
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
  if (!market) return 1 // Fallback to 1x

  const maxLTV = parseFloat(market.params?.max_loan_to_value || '0.8')
  const theoreticalMaxLeverage = maxLTV > 0 ? 1 / (1 - maxLTV) - 1 : 1
  // Apply 0.5x safety buffer
  const calculatedMaxLeverage = Math.max(1, theoreticalMaxLeverage - 0.5)

  // Console log getMaxLeverageForDenom values
  console.log(`🎯 getMaxLeverageForDenom ${market.asset.symbol}:`, {
    debtDenom,
    maxLTV,
    rawMaxLoanToValue: market.params?.max_loan_to_value,
    calculatedMaxLeverage,
    marketDenom: market.asset.denom,
  })

  return calculatedMaxLeverage
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
  return getMaxLeverageForDenom(strategy.debtAsset.denom, markets, isWasmReady)
}
