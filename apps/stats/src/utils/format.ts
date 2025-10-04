import { BigNumber } from 'bignumber.js'

// Configure BigNumber for proper rounding
// ROUND_HALF_UP: Rounds up if the digit to be rounded is 5 or greater (standard rounding)
BigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_HALF_UP })

const safeParseNumber =
  (defaultValue: number = 0) =>
  (value: unknown): number => {
    if (typeof value === 'number' && !isNaN(value)) return value
    if (typeof value === 'string') {
      const parsed = parseFloat(value)
      return isNaN(parsed) ? defaultValue : parsed
    }
    return defaultValue
  }

// Pure function for number formatting with functional approach
export const formatNumber =
  (decimals = 2) =>
  (num: number | string): string => {
    const parsedNum = safeParseNumber()(num)

    return parsedNum.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  }

// Backward compatibility wrapper
export const formatNumberLegacy = (num: number | string, decimals = 2): string =>
  formatNumber(decimals)(num)

// Pure function for APY formatting
export const formatApy = (value: number): string => {
  if (value === 0 || value === undefined) return '-'
  // Convert decimal to percentage for display
  const percentageValue = value * 100
  return `${percentageValue > 0 ? '+' : '-'}${percentageValue.toFixed(2)}%`
}

// Higher-order function for creating APY formatters
export const createApyFormatter =
  (showSign: boolean = true) =>
  (value: number): string => {
    if (value === 0 || value === undefined) return '-'
    const sign = showSign && value > 0 ? '+' : '-'
    return `${sign}${value.toFixed(2)}%`
  }

// Convert APR to APY with daily compounding
export const convertAprToApy = (apr: number): number => {
  const compoundingPeriods = 365 // Daily compounding
  const aprDecimal = apr / 100
  const apy = (Math.pow(1 + aprDecimal / compoundingPeriods, compoundingPeriods) - 1) * 100
  return parseFloat(apy.toFixed(2))
}

// Pure function for compact number formatting
const formatCompactNumberPure = (bn: BigNumber): string => {
  const isNegative = bn.isLessThan(0)
  const absBn = bn.abs()

  let formatted: string
  if (absBn.isGreaterThanOrEqualTo(1_000_000_000)) {
    formatted = `${absBn.dividedBy(1_000_000_000).toFormat(2)}B`
  } else if (absBn.isGreaterThanOrEqualTo(1_000_000)) {
    formatted = `${absBn.dividedBy(1_000_000).toFormat(2)}M`
  } else if (absBn.isGreaterThanOrEqualTo(1_000)) {
    formatted = `${absBn.dividedBy(1_000).toFormat(2)}K`
  } else {
    formatted = absBn.toFormat(2)
  }

  return isNegative ? `-${formatted}` : formatted
}

// Functional approach to compact number formatting
export const formatCompactNumber = (value: string | number): string => {
  const num = safeParseNumber()(value)
  const bn = new BigNumber(num)
  return formatCompactNumberPure(bn)
}

// Pure function for currency formatting
export const formatCurrency =
  (decimals = 2) =>
  (num: number | string): string => {
    const formatted = formatNumber(decimals)(num)
    return `$${formatted}`
  }

// Backward compatibility wrapper
export const formatCurrencyLegacy = (num: number | string, decimals = 2): string =>
  formatCurrency(decimals)(num)

// Functional approach to compact currency formatting
export const formatCompactCurrency = (value: string | number): string => {
  const formatted = formatCompactNumber(value)
  return `$${formatted}`
}

// Helper functions to reduce complexity
const createDefaultMetadata = (isCurrency: boolean, decimals: number = 6): FormatMetadata => ({
  type: 'standard',
  value: isCurrency ? '0.00' : '0.' + '0'.repeat(decimals),
  prefix: isCurrency ? '$' : '',
})

const extractPrefix = (value: string, isCurrency: boolean) => {
  if (value.startsWith('$')) {
    return { workingValue: value.substring(1), prefix: '$', isCurrency: true }
  }
  return { workingValue: value, prefix: isCurrency ? '$' : '', isCurrency }
}

const handleScientificNotation = (
  bnValue: BigNumber,
  workingValue: string,
  prefix: string,
  isCurrency: boolean,
  decimalPlaces: number,
  significantDigits: number,
) => {
  if (!bnValue.isGreaterThan(0) || !workingValue.includes('e-')) return null

  try {
    const fullDecimal = bnValue.toFixed()
    const regex = /^0\.(0+)([1-9]\d*)$/
    const match = regex.exec(fullDecimal)

    if (match) {
      const [, leadingZeros, significantDigitsValue] = match
      const zeroCount = leadingZeros.length
      const limitedDigits = (() => {
        if (isCurrency) return significantDigitsValue.substring(0, decimalPlaces)
        if (significantDigits !== undefined)
          return significantDigitsValue.substring(0, significantDigits)
        return significantDigitsValue
      })()

      return {
        type: 'subscript' as const,
        value: '0.0',
        prefix,
        zeroCount,
        significantDigits: limitedDigits || '1',
      }
    }
  } catch (err) {
    console.error('Error handling scientific notation:', err)
  }
  return null
}

const formatLargeValue = (
  bnValue: BigNumber,
  prefix: string,
  useCompactNotation: boolean,
  largeValueThreshold: number,
) => {
  const absValue = bnValue.abs()
  if (!useCompactNotation || !absValue.isGreaterThanOrEqualTo(largeValueThreshold)) return null

  const isNegative = bnValue.isLessThan(0)
  const sign = isNegative ? '-' : ''

  if (absValue.isGreaterThanOrEqualTo(1_000_000_000)) {
    return {
      type: 'standard' as const,
      value: `${sign}${absValue.dividedBy(1_000_000_000).toFormat(2)}B`,
      prefix,
    }
  }
  if (absValue.isGreaterThanOrEqualTo(1_000_000)) {
    return {
      type: 'standard' as const,
      value: `${sign}${absValue.dividedBy(1_000_000).toFormat(2)}M`,
      prefix,
    }
  }
  if (absValue.isGreaterThanOrEqualTo(1_000)) {
    return {
      type: 'standard' as const,
      value: `${sign}${absValue.dividedBy(1_000).toFormat(2)}K`,
      prefix,
    }
  }
  return null
}

const formatSmallValue = (
  bnValue: BigNumber,
  prefix: string,
  smallValueThreshold: number,
  isCurrency: boolean,
  decimalPlaces: number,
) => {
  if (!bnValue.isGreaterThan(0) || !bnValue.isLessThan(smallValueThreshold)) return null

  try {
    const fullDecimal = bnValue.toFixed()
    const regex = /^0\.(0+)([1-9]\d*)$/
    const match = regex.exec(fullDecimal)

    if (match) {
      const [, leadingZeros, significantDigitsValue] = match
      const zeroCount = parseInt(leadingZeros.length.toString(), 10)

      if (isNaN(zeroCount)) {
        return { type: 'standard' as const, value: '< 0.0001', prefix }
      }

      const limitedDigits = isCurrency
        ? significantDigitsValue.substring(0, decimalPlaces)
        : significantDigitsValue

      return {
        type: 'subscript' as const,
        value: '0.0',
        prefix,
        zeroCount,
        significantDigits: limitedDigits || '1',
      }
    }
  } catch (error) {
    console.error('Error formatting small value:', error)
  }

  return { type: 'standard' as const, value: '< 0.0001', prefix }
}

const formatMediumSmallValue = (
  bnValue: BigNumber,
  prefix: string,
  significantDigits: number,
  decimalPlaces: number,
  isCurrency: boolean,
  smallValueThreshold: number,
) => {
  if (!bnValue.isLessThan(1) || !bnValue.isGreaterThanOrEqualTo(smallValueThreshold)) return null

  try {
    let formattedValue = bnValue.toPrecision(significantDigits)

    if (decimalPlaces !== undefined) {
      const tempBn = new BigNumber(formattedValue)

      if (!isCurrency && bnValue.isLessThan(0.01)) {
        const decimalStr = bnValue.toString()
        const regex = /^0\.(0+)/
        const match = regex.exec(decimalStr)
        const leadingZeros = match ? match[1].length : 0
        const minDecimals = leadingZeros + significantDigits
        const adjustedDecimals = Math.max(decimalPlaces, minDecimals)
        formattedValue = tempBn.toFormat(adjustedDecimals)
      } else {
        formattedValue = tempBn.toFormat(decimalPlaces)
      }
    }

    return { type: 'standard' as const, value: formattedValue, prefix }
  } catch (error) {
    console.error('Error formatting medium-small value:', error)
    return { type: 'standard' as const, value: bnValue.toFormat(decimalPlaces), prefix }
  }
}

const validateAndParseBigNumber = (value: string | number, workingValue: string) => {
  if ((!value && value !== 0) || (value && value.toString().toLowerCase() === 'nan')) {
    return { isValid: false, bnValue: null }
  }

  const bnValue = new BigNumber(workingValue)
  if (bnValue.isNaN()) {
    return { isValid: false, bnValue: null }
  }

  return { isValid: true, bnValue }
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
  const {
    isCurrency = false,
    useCompactNotation = true,
    significantDigits = 4,
    decimalPlaces = 2,
    smallValueThreshold = 0.0001,
    largeValueThreshold = 1000,
    tokenDecimals = 6,
  } = options

  // Handle null/undefined/zero values
  if (!value && value !== 0) return createDefaultMetadata(isCurrency, tokenDecimals)
  if (value === '0' || value === 0) return createDefaultMetadata(isCurrency, tokenDecimals)

  // Extract currency prefix
  const {
    workingValue,
    prefix,
    isCurrency: adjustedIsCurrency,
  } = extractPrefix(value.toString(), isCurrency)

  try {
    // Validate and parse BigNumber
    const { isValid, bnValue } = validateAndParseBigNumber(value, workingValue)
    if (!isValid || !bnValue) return createDefaultMetadata(adjustedIsCurrency)

    // Try different formatting strategies
    const scientificResult = handleScientificNotation(
      bnValue,
      workingValue,
      prefix,
      adjustedIsCurrency,
      decimalPlaces,
      significantDigits,
    )
    if (scientificResult) return scientificResult

    const largeResult = formatLargeValue(bnValue, prefix, useCompactNotation, largeValueThreshold)
    if (largeResult) return largeResult

    const smallResult = formatSmallValue(
      bnValue,
      prefix,
      smallValueThreshold,
      adjustedIsCurrency,
      decimalPlaces,
    )
    if (smallResult) return smallResult

    // Currency values use fixed decimal places
    if (adjustedIsCurrency) {
      return { type: 'standard', value: bnValue.toFormat(decimalPlaces), prefix }
    }

    // Medium-small values
    const mediumSmallResult = formatMediumSmallValue(
      bnValue,
      prefix,
      significantDigits,
      decimalPlaces,
      adjustedIsCurrency,
      smallValueThreshold,
    )
    if (mediumSmallResult) return mediumSmallResult

    // Default formatting
    return { type: 'standard', value: bnValue.toFormat(decimalPlaces), prefix }
  } catch (e) {
    console.error('Error formatting value:', value, e)

    if (value && !isNaN(parseFloat(value.toString()))) {
      return { type: 'standard', value: value.toString(), prefix }
    }

    return createDefaultMetadata(adjustedIsCurrency)
  }
}

// Pure function for USD value calculation with functional approach
export const calculateUsdValue =
  (decimals = 6) =>
  (price: string | number) =>
  (amount: string | number): number => {
    if (!amount || !price) return 0

    const parsedAmount = new BigNumber(amount).shiftedBy(-decimals)
    const parsedPrice = new BigNumber(price)

    return parsedAmount.multipliedBy(parsedPrice).toNumber()
  }

// Backward compatibility wrapper
export const calculateUsdValueLegacy = (
  amount: string | number,
  price: string | number,
  decimals = 6,
): number => calculateUsdValue(decimals)(price)(amount)

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

// Pure function for URL construction
export const getUrl = (baseUrl: string, path: string = ''): string => {
  const url = new URL(baseUrl.split('?')[0])
  return url.href + path
}

// Curried version for partial application
export const createUrlBuilder =
  (baseUrl: string) =>
  (path: string = ''): string =>
    getUrl(baseUrl, path)

// Pure function for determining decimal places based on amount magnitude
const getDecimalPlaces = (amount: number): number => {
  if (amount >= 1_000_000) return 2
  if (amount >= 1_000) return 2
  if (amount >= 100) return 4
  if (amount >= 1) return 6
  return 8
}

// Pure function for formatting amount based on magnitude
const formatAmountByMagnitude = (amount: number): string => {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(2)}M`
  }
  return amount.toFixed(getDecimalPlaces(amount))
}

/**
 * Functional approach to token amount formatting
 * @param symbol - Token symbol to append
 * @returns Function that formats amount with symbol
 */
export const formatTokenAmount =
  (symbol: string) =>
  (amount: number): string => {
    const formattedAmount = formatAmountByMagnitude(amount)
    return `${formattedAmount} ${symbol}`
  }

// Backward compatibility wrapper
export const formatTokenAmountLegacy = (amount: number, symbol: string): string =>
  formatTokenAmount(symbol)(amount)

// Pure functions for large number formatting
const getSign = (value: number): string => (value < 0 ? '-' : '')
const getAbsValue = (value: number): number => Math.abs(value)

const formatByMagnitude =
  (decimalPlaces: number) =>
  (absValue: number): string => {
    if (absValue >= 1_000_000_000) {
      return `${(absValue / 1_000_000_000).toFixed(decimalPlaces)}B`
    } else if (absValue >= 1_000_000) {
      return `${(absValue / 1_000_000).toFixed(decimalPlaces)}M`
    } else if (absValue >= 1_000) {
      return `${(absValue / 1_000).toFixed(decimalPlaces)}k`
    } else {
      return absValue.toFixed(decimalPlaces)
    }
  }

/**
 * Functional approach to large number formatting
 * Examples: 1500 -> 1.5k, 1500000 -> 1.5M, 1500000000 -> 1.5B
 */
export const formatLargeNumber =
  (decimalPlaces: number = 2) =>
  (value: number): string => {
    if (value === 0) return '0'

    const sign = getSign(value)
    const absValue = getAbsValue(value)
    const formatted = formatByMagnitude(decimalPlaces)(absValue)

    return `${sign}${formatted}`
  }

// Backward compatibility wrapper
export const formatLargeNumberLegacy = (value: number, decimalPlaces: number = 2): string =>
  formatLargeNumber(decimalPlaces)(value)

// Pure function for currency sign generation
const getCurrencySign = (value: number): string => (value < 0 ? '-$' : '$')

/**
 * Functional approach to large currency formatting
 * Shows up to 999.00, then 1.6k, 1.5M, 6.52B
 */
export const formatLargeCurrency = (value: number): string => {
  if (value === 0) return '$0'

  const sign = getCurrencySign(value)
  const absValue = getAbsValue(value)
  const formatted = formatByMagnitude(2)(absValue)

  return `${sign}${formatted}`
}
