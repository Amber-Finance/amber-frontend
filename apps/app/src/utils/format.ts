import { BigNumber } from 'bignumber.js'

// Configure BigNumber for proper rounding
// ROUND_HALF_UP: Rounds up if the digit to be rounded is 5 or greater (standard rounding)
BigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_HALF_UP })

// Format a number with commas and specified decimal places
export const formatNumber = (num: number | string, decimals = 2): string => {
  const parsedNum = typeof num === 'string' ? parseFloat(num) : num

  if (isNaN(parsedNum)) return '0'

  // Format with commas and specified decimal places
  return parsedNum.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export const formatApy = (value: number) => {
  if (value === 0 || value === undefined) return '-'
  // Convert decimal to percentage for display
  const percentageValue = value * 100
  return `${percentageValue > 0 ? '+' : ''}${percentageValue.toFixed(2)}%`
}

// Format a number to display in millions, billions, etc.
export const formatCompactNumber = (num: number | string): string => {
  const parsedNum = typeof num === 'string' ? parseFloat(num) : num

  if (isNaN(parsedNum)) return '0'

  // Format in compact notation (K, M, B) using BigNumber for consistent rounding
  const bn = new BigNumber(parsedNum)
  if (bn.isGreaterThanOrEqualTo(1_000_000_000)) {
    return `${bn.dividedBy(1_000_000_000).toFormat(2)}B`
  } else if (bn.isGreaterThanOrEqualTo(1_000_000)) {
    return `${bn.dividedBy(1_000_000).toFormat(2)}M`
  } else if (bn.isGreaterThanOrEqualTo(1_000)) {
    return `${bn.dividedBy(1_000).toFormat(2)}K`
  } else {
    return bn.toFormat(2)
  }
}

// Format a number as currency (USD)
export const formatCurrency = (num: number | string, decimals = 2): string => {
  const parsedNum = typeof num === 'string' ? parseFloat(num) : num

  if (isNaN(parsedNum)) return '$0.00'

  return `$${formatNumber(parsedNum, decimals)}`
}

// Format a number as currency in compact form (e.g., $1.23M)
export const formatCompactCurrency = (num: number | string): string => {
  const parsedNum = typeof num === 'string' ? parseFloat(num) : num

  if (isNaN(parsedNum)) return '$0'

  return `$${formatCompactNumber(parsedNum)}`
}

/**
 * Comprehensive value formatting utility
 * Instead of returning React elements, it returns formatting metadata
 * that components can use to render appropriately
 */
export const formatValue = (
  value: string | number,
  options: FormatValueOptions = {},
): FormatMetadata => {
  // Default options
  const {
    isCurrency = false,
    useCompactNotation = true,
    significantDigits = 4,
    decimalPlaces = 2,
    smallValueThreshold = 0.0001,
    largeValueThreshold = 1000,
  } = options

  // Normalize value and handle special cases
  if (!value && value !== 0) {
    return {
      type: 'standard',
      value: isCurrency ? '0.00' : '0',
      prefix: isCurrency ? '$' : '',
    }
  }

  if (value === '0' || value === 0) {
    return {
      type: 'standard',
      value: isCurrency ? '0.00' : '0',
      prefix: isCurrency ? '$' : '',
    }
  }

  // Extract currency prefix if present
  let workingValue = value.toString()
  let prefix = ''

  if (workingValue.startsWith('$')) {
    workingValue = workingValue.substring(1)
    prefix = '$'
    // Ensure consistency - if $ is present, treat as currency
    options.isCurrency = true
  } else if (isCurrency) {
    prefix = '$'
  }

  try {
    // Check for invalid values first
    if ((!value && value !== 0) || (value && value.toString().toLowerCase() === 'nan')) {
      return {
        type: 'standard',
        value: isCurrency ? '0.00' : '0',
        prefix: isCurrency ? '$' : '',
      }
    }

    // Convert to BigNumber for consistent handling
    const bnValue = new BigNumber(workingValue)

    // Check for NaN
    if (bnValue.isNaN()) {
      return {
        type: 'standard',
        value: isCurrency ? '0.00' : '0',
        prefix: isCurrency ? '$' : '',
      }
    }

    // Handle scientific notation for extremely small values
    if (bnValue.isGreaterThan(0) && workingValue.toString().includes('e-')) {
      try {
        // Convert to a full decimal representation first
        const fullDecimal = bnValue.toFixed()

        // Match pattern like 0.000000123
        const match = fullDecimal.match(/^0\.([0]+)([1-9]\d*)$/)

        if (match) {
          const [, leadingZeros, significantDigitsValue] = match
          const zeroCount = leadingZeros.length

          // For currency values, limit to decimalPlaces digits
          // For token values, use all significant digits or limit based on significantDigits
          const limitedDigits = isCurrency
            ? significantDigitsValue.substring(0, decimalPlaces)
            : significantDigits !== undefined
              ? significantDigitsValue.substring(0, significantDigits)
              : significantDigitsValue

          return {
            type: 'subscript',
            value: '0.0', // The base part
            prefix,
            zeroCount,
            significantDigits: limitedDigits || '1',
          }
        }
      } catch (err) {
        console.error('Error handling scientific notation:', err)
      }
    }

    // CASE 1: Very large values - use compact notation if enabled
    if (useCompactNotation && bnValue.isGreaterThanOrEqualTo(largeValueThreshold)) {
      if (bnValue.isGreaterThanOrEqualTo(1_000_000_000)) {
        return {
          type: 'standard',
          value: `${bnValue.dividedBy(1_000_000_000).toFormat(2)}B`,
          prefix,
        }
      } else if (bnValue.isGreaterThanOrEqualTo(1_000_000)) {
        return {
          type: 'standard',
          value: `${bnValue.dividedBy(1_000_000).toFormat(2)}M`,
          prefix,
        }
      } else if (bnValue.isGreaterThanOrEqualTo(1_000)) {
        return {
          type: 'standard',
          value: `${bnValue.dividedBy(1_000).toFormat(2)}K`,
          prefix,
        }
      }
    }

    // CASE 2: Very small values - provide metadata for subscript notation
    if (bnValue.isGreaterThan(0) && bnValue.isLessThan(smallValueThreshold)) {
      try {
        // Get full decimal representation
        const fullDecimal = bnValue.toFixed()

        // Match pattern like 0.000000123
        const match = fullDecimal.match(/^0\.([0]+)([1-9]\d*)$/)

        if (match) {
          const [, leadingZeros, significantDigitsValue] = match

          // Convert zeroCount to number to avoid NaN display - ensure it's a valid number
          const zeroCount = parseInt(leadingZeros.length.toString(), 10)

          if (isNaN(zeroCount)) {
            // If we can't get a valid zeroCount, fall back to standard formatting
            return {
              type: 'standard',
              value: '< 0.0001',
              prefix,
            }
          }

          // For currency values, limit to decimalPlaces digits
          // For token values, use all significant digits
          const limitedDigits = isCurrency
            ? significantDigitsValue.substring(0, decimalPlaces)
            : significantDigitsValue

          // Return metadata for subscript notation
          return {
            type: 'subscript',
            value: '0.0', // The base part
            prefix,
            zeroCount,
            significantDigits: limitedDigits || '1',
          }
        }
      } catch (error) {
        console.error('Error formatting small value:', error)
      }

      // Fallback for small values that don't match the pattern
      return {
        type: 'standard',
        value: '< 0.0001',
        prefix,
      }
    }

    // CASE 3: Regular values
    // For currency values, always use exactly decimalPlaces decimal places
    if (isCurrency) {
      return {
        type: 'standard',
        value: bnValue.toFormat(decimalPlaces),
        prefix,
      }
    }

    // For non-currency values between smallValueThreshold and 1:
    // Use significantDigits for more precision but respect decimalPlaces
    if (bnValue.isLessThan(1) && bnValue.isGreaterThanOrEqualTo(smallValueThreshold)) {
      try {
        // Get the formatted value with significant digits first
        let formattedValue = bnValue.toPrecision(significantDigits)

        // If decimalPlaces is specified, also respect that limit
        if (decimalPlaces !== undefined) {
          // Parse the formatted value to create a new BigNumber
          // This handles any scientific notation that might have been created
          const tempBn = new BigNumber(formattedValue)

          // For small values below 0.01, ensure we show enough decimal places
          // to represent the value meaningfully
          if (!isCurrency && bnValue.isLessThan(0.01)) {
            // Count leading zeros after the decimal point
            const decimalStr = bnValue.toString()
            const match = decimalStr.match(/^0\.([0]+)/)
            const leadingZeros = match ? match[1].length : 0

            // Use at least enough decimals to show the first significant digit
            // plus the number of significant digits specified
            const minDecimals = leadingZeros + significantDigits
            const adjustedDecimals = Math.max(decimalPlaces, minDecimals)

            // Format with calculated decimal places
            formattedValue = tempBn.toFormat(adjustedDecimals)
          } else {
            // Format with fixed decimal places
            formattedValue = tempBn.toFormat(decimalPlaces)
          }
        }

        return {
          type: 'standard',
          value: formattedValue,
          prefix,
        }
      } catch (error) {
        console.error('Error formatting medium-small value:', error)
        // Fall back to standard formatting
        return {
          type: 'standard',
          value: bnValue.toFormat(decimalPlaces),
          prefix,
        }
      }
    }

    // For other values, use decimalPlaces
    return {
      type: 'standard',
      value: bnValue.toFormat(decimalPlaces),
      prefix,
    }
  } catch (e) {
    console.error('Error formatting value:', value, e)

    // Return a safe fallback instead of passing the error through
    if (value && !isNaN(parseFloat(value.toString()))) {
      return {
        type: 'standard',
        value: value.toString(),
        prefix,
      }
    }

    // If we can't parse the value at all, return 0
    return {
      type: 'standard',
      value: isCurrency ? '0.00' : '0',
      prefix: isCurrency ? '$' : '',
    }
  }
}

// Convert token amount to USD value based on price and decimals
export const calculateUsdValue = (
  amount: string | number,
  price: string | number,
  decimals = 6,
): number => {
  if (!amount || !price) return 0
  // adjust the decimals to oracle decimals
  const parsedAmount = new BigNumber(amount).shiftedBy(-decimals)
  const parsedPrice = new BigNumber(price)

  return parsedAmount.multipliedBy(parsedPrice).toNumber()
}

/**
 * Format token balance to display at least the specified number of significant digits.
 * Uses the formatValue function for consistent formatting.
 *
 * @param amount The token amount as a string or number
 * @param decimals The number of decimals the token uses (e.g., 6 for most Cosmos tokens)
 * @param significantDigits The minimum number of significant digits to display (default: 4)
 * @param fixedDecimals The number of decimal places for numbers >= 1 (default: 2)
 * @returns Formatted balance string
 */
export const formatTokenBalance = (
  amount: string | number,
  decimals: number = 6,
  significantDigits: number = 4,
  fixedDecimals: number = 2,
): string => {
  // Convert to BigNumber and adjust for token decimals
  const balanceNum = new BigNumber(amount).shiftedBy(-decimals)

  // Get format metadata
  const formatData = formatValue(balanceNum.toString(), {
    isCurrency: false,
    significantDigits,
    decimalPlaces: fixedDecimals,
    useCompactNotation: false, // Don't use K, M, B for token balances
  })

  // Convert to simple string
  if (formatData.type === 'standard') {
    return formatData.prefix + formatData.value
  } else if (formatData.type === 'subscript') {
    // Return a basic string format for non-React contexts
    return `${formatData.prefix}${formatData.value}_${formatData.zeroCount}_${formatData.significantDigits}`
  }

  return balanceNum.toString()
}

export const getUrl = (baseUrl: string, path: string = ''): string => {
  const url = new URL(baseUrl.split('?')[0])

  return url.href + path
}

/**
 * Format token amount with appropriate decimal places based on magnitude
 * @param amount - Token amount as a number
 * @param symbol - Token symbol to append
 * @returns Formatted token amount string with symbol
 */
export const formatTokenAmount = (amount: number, symbol: string): string => {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(2)}M ${symbol}`
  } else if (amount >= 1_000) {
    return `${amount.toFixed(2)} ${symbol}`
  } else if (amount >= 100) {
    return `${amount.toFixed(4)} ${symbol}`
  } else if (amount >= 1) {
    return `${amount.toFixed(6)} ${symbol}`
  } else {
    return `${amount.toFixed(8)} ${symbol}`
  }
}

/**
 * Format large numbers with abbreviations (k, M, B)
 * Examples: 1500 -> 1.5k, 1500000 -> 1.5M, 1500000000 -> 1.5B
 */
export const formatLargeNumber = (value: number, decimalPlaces: number = 2): string => {
  if (value === 0) return '0'

  const absValue = Math.abs(value)
  const sign = value < 0 ? '-' : ''

  if (absValue >= 1_000_000_000) {
    return `${sign}${(absValue / 1_000_000_000).toFixed(decimalPlaces)}B`
  } else if (absValue >= 1_000_000) {
    return `${sign}${(absValue / 1_000_000).toFixed(decimalPlaces)}M`
  } else if (absValue >= 1_000) {
    return `${sign}${(absValue / 1_000).toFixed(decimalPlaces)}k`
  } else {
    return `${sign}${absValue.toFixed(decimalPlaces)}`
  }
}

/**
 * Format large numbers with abbreviations for currency display
 * Shows up to 999.00, then 1.6k, 1.5M, 6.52B
 */
export const formatLargeCurrency = (value: number): string => {
  if (value === 0) return '$0'

  const absValue = Math.abs(value)
  const sign = value < 0 ? '-$' : '$'

  if (absValue >= 1_000_000_000) {
    return `${sign}${(absValue / 1_000_000_000).toFixed(2)}B`
  } else if (absValue >= 1_000_000) {
    return `${sign}${(absValue / 1_000_000).toFixed(2)}M`
  } else if (absValue >= 1_000) {
    return `${sign}${(absValue / 1_000).toFixed(2)}k`
  } else {
    return `${sign}${absValue.toFixed(2)}`
  }
}
