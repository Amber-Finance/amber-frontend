/**
 * Utilities for formatting and handling blockchain addresses
 */

/**
 * Formats a blockchain address according to the specified display format
 * @param address The full address to format
 * @param displayFormat How to format the address (full, truncated, or custom)
 * @param customDisplay Custom display string (used with displayFormat="custom")
 * @returns Formatted address string
 */
export const formatAddress = (
  address: string,
  displayFormat: 'full' | 'truncated' | 'custom' = 'truncated',
  customDisplay?: string,
): string => {
  if (displayFormat === 'full') return address
  if (displayFormat === 'custom' && customDisplay) return customDisplay

  // Default truncated format: first 7 chars + ... + last 4 chars
  return `${address.substring(0, 7)}...${address.substring(address.length - 4)}`
}
