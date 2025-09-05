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
// Helper function to process display value
const processDisplayValue = (value: string, isCurrency: boolean) => {
  if (isCurrency || !value.includes('.')) return value

  // Remove trailing zeros
  let processed = value.replace(/\.?0+$/, '')

  // If we end up with just a decimal point, remove it too
  if (processed.endsWith('.')) {
    processed = processed.slice(0, -1)
  }

  return processed
}

// Helper function to render subscript notation
const renderSubscriptNotation = (
  formatData: FormatMetadata,
  effectivePrefix: string,
  className: string,
  suffix: string,
) => {
  try {
    const displayDigits = formatData.significantDigits
      ? formatData.significantDigits.substring(0, 4)
      : '1'

    return (
      <span className={`whitespace-nowrap inline-flex items-baseline ${className}`}>
        {effectivePrefix || formatData.prefix || ''}
        {formatData.value || '0.0'}
        <span
          className='inline-block text-[0.7em] font-bold relative bottom-[-0.1em] mx-[0.5px]'
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
    smallValueThreshold: isCurrency ? 0.01 : smallValueThreshold || 0.00001,
    largeValueThreshold: 1000,
    useCompactNotation,
    significantDigits: 4,
    decimalPlaces: (() => {
      if (maxDecimals !== undefined) return maxDecimals
      return isCurrency ? 2 : 4
    })(),
  })

  // Render based on format type
  if (formatData.type === 'standard') {
    const displayValue = processDisplayValue(formatData.value, isCurrency)

    return (
      <span className={className}>
        {effectivePrefix || formatData.prefix}
        {displayValue}
        {suffix}
      </span>
    )
  }

  if (formatData.type === 'subscript') {
    return renderSubscriptNotation(formatData, effectivePrefix, className, suffix)
  }

  return (
    <span className={className}>
      {effectivePrefix || ''}
      {value || '0'}
      {suffix}
    </span>
  )
}

export default FormattedValue
