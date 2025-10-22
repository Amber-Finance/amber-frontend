/**
 * Functional programming utilities for pure functions and composition
 */

// Higher-order function for safe number parsing
export const safeParseNumber =
  (defaultValue: number = 0) =>
  (value: unknown): number => {
    if (typeof value === 'number' && !isNaN(value)) return value
    if (typeof value === 'string') {
      const parsed = parseFloat(value)
      return isNaN(parsed) ? defaultValue : parsed
    }
    return defaultValue
  }

// Curried function for creating formatters
export const createFormatter =
  (options: Intl.NumberFormatOptions) =>
  (value: number): string =>
    value.toLocaleString('en-US', options)

// Pure function compositions for common formatting
export const formatCurrency = createFormatter({
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export const formatPercentage = createFormatter({
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export const formatNumber = (decimals: number = 2) =>
  createFormatter({
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

// Function composition utility
export const compose =
  <T>(...fns: Array<(arg: T) => T>) =>
  (value: T): T =>
    fns.reduceRight((acc, fn) => fn(acc), value)

// Pipe function for left-to-right composition
export const pipe =
  <T>(...fns: Array<(arg: T) => T>) =>
  (value: T): T =>
    fns.reduce((acc, fn) => fn(acc), value)

// Higher-order function for conditional application
export const when =
  <T>(predicate: (value: T) => boolean) =>
  (fn: (value: T) => T) =>
  (value: T): T =>
    predicate(value) ? fn(value) : value

// Higher-order function for mapping over arrays
export const mapWith =
  <T, U>(fn: (item: T, index?: number) => U) =>
  (array: T[]): U[] =>
    array.map(fn)

// Pure function for value validation
export const isValidNumber = (value: unknown): value is number =>
  typeof value === 'number' && !isNaN(value) && isFinite(value)

// Pure function for string validation
export const isValidString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

// Higher-order function for creating validators
export const createValidator =
  <T>(predicate: (value: unknown) => value is T) =>
  (defaultValue: T) =>
  (value: unknown): T =>
    predicate(value) ? value : defaultValue

// Curried function for safe property access
export const prop =
  <T, K extends keyof T>(key: K) =>
  (obj: T): T[K] =>
    obj[key]

// Function for safe nested property access
export const path =
  <T>(keys: string[]) =>
  (obj: any): T | undefined => {
    return keys.reduce((current, key) => current?.[key], obj)
  }

// Pure function for calculating percentage
export const calculatePercentage =
  (value: number) =>
  (total: number): number =>
    total === 0 ? 0 : (value / total) * 100

// Pure function for clamping values
export const clamp =
  (min: number) =>
  (max: number) =>
  (value: number): number =>
    Math.min(Math.max(value, min), max)

// Higher-order function for debouncing
export const createDebouncer =
  <T extends (...args: any[]) => any>(delay: number) =>
  (fn: T): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => fn(...args), delay)
    }
  }

// Pure function for array grouping
export const groupBy =
  <T, K extends string | number | symbol>(keyFn: (item: T) => K) =>
  (array: T[]): Record<K, T[]> => {
    return array.reduce(
      (groups, item) => {
        const key = keyFn(item)
        const existingItems = groups[key] || []
        return {
          ...groups,
          [key]: [...existingItems, item],
        }
      },
      {} as Record<K, T[]>,
    )
  }

// Pure function for filtering unique items
export const unique =
  <T>(keyFn?: (item: T) => any) =>
  (array: T[]): T[] => {
    if (!keyFn) return [...new Set(array)]

    const seen = new Set()
    return array.filter((item) => {
      const key = keyFn(item)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

// Pure function for sorting
export const sortBy =
  <T>(keyFn: (item: T) => any, direction: 'asc' | 'desc' = 'asc') =>
  (array: T[]): T[] => {
    return [...array].sort((a, b) => {
      const aVal = keyFn(a)
      const bVal = keyFn(b)
      const comparison = (() => {
        if (aVal < bVal) return -1
        if (aVal > bVal) return 1
        return 0
      })()
      return direction === 'asc' ? comparison : -comparison
    })
  }
