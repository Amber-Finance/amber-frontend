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
): { type: 'warning'; message: string } | null => {
  // Only show warning at 11.5x and above
  if (leverage >= 11.5) {
    return {
      type: 'warning',
      message: 'Your position is at increased liquidation risk. Monitor your position closely.',
    }
  }

  return null
}
