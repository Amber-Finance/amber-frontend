export const formatBalance = (balance: number) => {
  if (balance === 0) return '0.00'
  if (balance >= 0.01) {
    // For amounts >= 0.01, show 2 decimal places
    return balance.toFixed(2)
  } else {
    // For very small amounts, show significant digits without trailing zeros
    return balance.toFixed(8).replace(/\.?0+$/, '')
  }
}

// Get protocol-specific points and multipliers
export const getProtocolPoints = (symbol: string) => {
  const symbolLower = symbol.toLowerCase()

  const pointsMap: Record<
    string,
    {
      multiplier: string
      protocolPoint?: string
      protocolIconLight?: string
      protocolIconDark?: string
    }
  > = {
    solvbtc: {
      multiplier: '4x',
      protocolPoint: 'Solv Points',
      protocolIconLight: '/images/solv/solvLight.png',
      protocolIconDark: '/images/solv/solvDark.png',
    },
    lbtc: {
      multiplier: '4x',
      protocolPoint: 'Lombard Lux',
      protocolIconLight: '/images/lombard/lombardIconOnly.svg',
      protocolIconDark: '/images/lombard/lombardIconOnlyDark.svg',
    },
    ebtc: {
      multiplier: '3x',
      protocolPoint: 'Etherfi Points',
      protocolIconLight: '/images/etherfiDark.svg',
      protocolIconDark: '/images/etherfi.svg',
    },
    unibtc: {
      multiplier: '3x',
      protocolPoint: 'Bedrock Diamonds',
      protocolIconLight: '/images/bedrock.svg',
      protocolIconDark: '/images/bedrock.svg', // Same icon for both themes
    },
    maxbtc: {
      multiplier: '1x',
      protocolPoint: 'Structured Points (TBC)',
      protocolIconLight: '/images/structured.svg',
      protocolIconDark: '/images/structured.svg',
    },
  }

  return pointsMap[symbolLower] || { multiplier: '1X' }
}

// Get protocol points icon based on theme
export const getProtocolPointsIcon = (symbol: string, theme: string) => {
  const protocolPoints = getProtocolPoints(symbol)
  if (!protocolPoints.protocolIconLight || !protocolPoints.protocolIconDark) return null

  // For icons with the same path for both themes, just return the light version
  if (protocolPoints.protocolIconLight === protocolPoints.protocolIconDark) {
    return protocolPoints.protocolIconLight
  }

  return theme === 'dark' ? protocolPoints.protocolIconDark : protocolPoints.protocolIconLight
}

// Get badge style for different point types
export const getBadgeStyle = (pointType: 'neutron' | 'protocol' | 'mars', symbol: string) => {
  const symbolLower = symbol.toLowerCase()

  switch (pointType) {
    case 'neutron':
      // Neutron brand blue/cyan color
      return {
        variant: 'secondary' as const,
        style: { backgroundColor: '#3FB0FF80', borderColor: '#3FB0FF' },
        className: 'text-foreground',
      }
    case 'protocol': {
      // Protocol-specific colors based on token
      const protocolColors: Record<string, { bg: string; border: string }> = {
        solvbtc: { bg: '#FEDF7080', border: '#D88528' }, // Golden yellow from Solv with 50% opacity
        lbtc: { bg: '#63C9B980', border: '#63C9B9' }, // Teal from Lombard with 50% opacity
        ebtc: { bg: '#6366F180', border: '#6366F1' }, // Indigo for Etherfi with 50% opacity
        unibtc: { bg: '#9236EA80', border: '#9236EA' }, // Purple from Bedrock with 50% opacity
      }
      const protocolColor = protocolColors[symbolLower] || {
        bg: '#6B728080',
        border: '#6B7280',
      }
      return {
        variant: 'secondary' as const,
        style: {
          backgroundColor: protocolColor.bg,
          borderColor: protocolColor.border,
        },
        className: 'text-foreground',
      }
    }
    case 'mars':
      // Mars red gradient color
      return {
        variant: 'secondary' as const,
        style: { backgroundColor: '#EF413680', borderColor: '#EF4136' },
        className: 'text-foreground',
      }
    default:
      return {
        variant: 'secondary' as const,
        style: { backgroundColor: '#6B728080', borderColor: '#6B7280' },
        className: 'text-foreground',
      }
  }
}

// Get protocol icon based on theme (for token protocol badge)
export const getProtocolIcon = (
  protocolIconLight?: string,
  protocolIconDark?: string,
  theme?: string,
) => {
  if (!protocolIconLight || !protocolIconDark) return null
  // For tokens with the same icon for both themes (like eBTC.svg), just return the light version
  if (protocolIconLight === protocolIconDark) return protocolIconLight
  return theme === 'dark' ? protocolIconDark : protocolIconLight
}
