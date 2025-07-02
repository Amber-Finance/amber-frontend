'use client'

import React from 'react'

import { formatValue } from '@/utils/format'

interface FormattedValueProps {
  value: string | number
  isCurrency?: boolean
  className?: string
  maxDecimals?: number // Maximum number of decimal places to show
  prefix?: string // Prefix to add before the value (e.g., "$")
  suffix?: string // Suffix to add after the value (e.g., "%")
  useCompactNotation?: boolean // Whether to use compact notation (K, M, B) for large values
  smallValueThreshold?: number // Threshold for using subscript notation (default 0.00001)
}

/**
 * FormattedValue component handles consistent numeric formatting throughout the UI.
 *
 * Applies the following formatting rules:
 * - Values above 999: 1.00k
 * - Values above 99,999: 100k (no decimals)
 * - Values below 0.00001: Uses subscript notation for zero count
 * - Other values: Regular formatting with appropriate precision
 */
const FormattedValue: React.FC<FormattedValueProps> = ({
  value,
  isCurrency = false,
  className = '',
  maxDecimals,
  prefix = '',
  suffix = '',
  useCompactNotation = true,
  smallValueThreshold,
}) => {
  // Handle currency prefix - if isCurrency is true and no prefix is provided, use "$"
  const effectivePrefix = isCurrency && !prefix ? '$' : prefix

  // Format the value according to our rules
  const formatData = formatValue(value, {
    isCurrency,
    // For currency values, use 0.01 as default smallValueThreshold, otherwise use provided value or default (0.00001)
    smallValueThreshold: isCurrency ? 0.01 : smallValueThreshold || 0.00001,
    largeValueThreshold: 1000, // Use compact notation (K, M, B) for values above this
    useCompactNotation,
    significantDigits: 4, // Increased from 4 to 6 to show more digits for small values
    decimalPlaces: maxDecimals !== undefined ? maxDecimals : isCurrency ? 2 : 4, // Use 6 decimal places for tokens, 2 for currency
  })

  // Render based on format type
  if (formatData.type === 'standard') {
    // Trim trailing zeros for cleaner display, but only for non-currency values
    let displayValue = formatData.value

    // Only trim if there's a decimal point and it's not a currency value
    if (!isCurrency && displayValue.includes('.')) {
      // Remove trailing zeros
      displayValue = displayValue.replace(/\.?0+$/, '')

      // If we end up with just a decimal point, remove it too
      if (displayValue.endsWith('.')) {
        displayValue = displayValue.slice(0, -1)
      }
    }

    return (
      <span className={className}>
        {effectivePrefix || formatData.prefix}
        {displayValue}
        {suffix}
      </span>
    )
  }

  // For subscript notation (very small values)
  if (formatData.type === 'subscript') {
    try {
      // Limit the significant digits based on significantDigits from formatValue (4)
      // regardless of what's returned from the formatData
      const displayDigits = formatData.significantDigits
        ? formatData.significantDigits.substring(0, 4) // Always limit to 4 significant digits
        : '1' // Ensure we have at least one digit

      return (
        <span className={`whitespace-nowrap inline-flex items-baseline ${className}`}>
          {effectivePrefix || formatData.prefix || ''}
          {formatData.value || '0.0'}
          <span
            className='inline-block text-[0.7em] font-semibold relative bottom-[-0.1em] mx-[0.5px]'
            style={{ lineHeight: '1' }}
          >
            {formatData.zeroCount}
          </span>
          {displayDigits}
          {suffix}
        </span>
      )
    } catch (error) {
      console.error('Error rendering subscript notation:', error)
      return (
        <span className={className}>
          {effectivePrefix || ''}
          {'< 0.0001'}
          {suffix}
        </span>
      )
    }
  }

  // Fallback for any unhandled cases
  return (
    <span className={className}>
      {effectivePrefix || ''}
      {value || '0'}
      {suffix}
    </span>
  )
}

export default FormattedValue
