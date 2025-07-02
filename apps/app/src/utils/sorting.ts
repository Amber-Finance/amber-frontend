/**
 * Utility functions for sorting operations used in table components
 */

/**
 * Toggles sort direction between 'asc' and 'desc'
 * @param currentDirection The current sort direction
 * @returns The toggled sort direction
 */
export const toggleSortDirection = (currentDirection: 'asc' | 'desc'): 'asc' | 'desc' => {
  return currentDirection === 'asc' ? 'desc' : 'asc'
}

/**
 * Generic function to sort an array of objects by a specified property
 * @param array The array to sort
 * @param key The object property to sort by
 * @param direction The sort direction ('asc' or 'desc')
 * @returns The sorted array
 */
export const sortArrayByProperty = <T>(
  array: T[],
  key: keyof T,
  direction: 'asc' | 'desc' = 'asc',
): T[] => {
  return [...array].sort((a, b) => {
    // Handle potentially undefined or null values
    const aValue = a[key] ?? ''
    const bValue = b[key] ?? ''

    // Compare values based on their type
    const comparison =
      typeof aValue === 'number' && typeof bValue === 'number'
        ? aValue - bValue
        : String(aValue).localeCompare(String(bValue))

    return direction === 'asc' ? comparison : -comparison
  })
}

/**
 * Determines if sort indicator should be shown for a column
 * @param column The column to check
 * @param currentSortColumn The currently sorted column
 * @returns Boolean indicating if this column is being sorted
 */
export const isColumnSorted = (column: string, currentSortColumn: string): boolean => {
  return column === currentSortColumn
}
