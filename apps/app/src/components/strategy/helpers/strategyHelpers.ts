export const getPriceImpactColor = (priceImpact: number): string => {
  const absoluteImpact = Math.abs(priceImpact)
  if (absoluteImpact >= 5) return 'text-red-500 font-medium'
  if (absoluteImpact >= 2) return 'text-yellow-600 font-medium'
  if (absoluteImpact >= 1) return 'text-yellow-500'
  if (priceImpact < 0) return 'text-red-500'
  if (priceImpact > 0) return 'text-green-500'
  return 'text-muted-foreground'
}

export const getPriceImpactWarning = (
  priceImpact: number,
): { type: 'info' | 'warning' | 'danger'; message: string } | null => {
  const absoluteImpact = Math.abs(priceImpact)

  if (absoluteImpact >= 5) {
    return {
      type: 'danger',
      message:
        'Very high price impact detected! You will lose a significant amount due to price impact. Consider reducing your trade size.',
    }
  }
  if (absoluteImpact >= 2) {
    return {
      type: 'warning',
      message:
        'High price impact detected. This trade will move the market price significantly against you.',
    }
  }
  if (absoluteImpact >= 1) {
    return {
      type: 'info',
      message: 'Moderate price impact. Your trade will affect the market price slightly.',
    }
  }
  return null
}

export const getLeverageWarning = (
  leverage: number,
  maxLeverage?: number,
): { type: 'warning' | 'danger'; message: string } | null => {
  // Check if leverage exceeds the allowed maximum
  if (maxLeverage && leverage > maxLeverage) {
    return {
      type: 'danger',
      message: `Leverage of ${leverage.toFixed(2)}x exceeds the maximum allowed leverage of ${maxLeverage.toFixed(2)}x for this strategy. Reduce leverage to stay within safe limits.`,
    }
  }

  // Warn at 90% of liquidation threshold (typically around 8x-9x for 0.92 LTV)
  if (leverage >= 8) {
    return {
      type: 'danger',
      message:
        'EXTREME LEVERAGE: Your position is at high risk of liquidation. Even small price movements could result in liquidation.',
    }
  }

  if (leverage >= 6) {
    return {
      type: 'warning',
      message:
        'HIGH LEVERAGE: Your position is at increased liquidation risk. Monitor your position closely.',
    }
  }

  return null
}
