/**
 * Error parsing utilities for converting technical blockchain errors
 * into user-friendly messages
 */

/**
 * Parses blockchain/contract errors and returns user-friendly messages
 */
export function parseErrorMessage(errorMessage: string): string {
  // Health Factor / Loan-to-Value errors
  if (
    errorMessage.includes('exceeding maximum allowed loan-to-value') ||
    errorMessage.includes('Max LTV health factor')
  ) {
    // Extract health factor if available
    const healthFactorMatch = errorMessage.match(/health factor[^"]*"([0-9.]+)"/)
    const healthFactor = healthFactorMatch ? parseFloat(healthFactorMatch[1]) : null

    if (healthFactor && healthFactor < 1.0) {
      return `⚠️ Leverage too high! Your position would be at risk of liquidation (Health Factor: ${(healthFactor * 100).toFixed(2)}%). Please reduce the leverage amount to stay above 100% health factor.`
    }

    return `⚠️ Leverage too high! Your position would exceed the maximum allowed loan-to-value ratio and risk liquidation. Please reduce the leverage amount.`
  }

  // Insufficient liquidity errors
  if (
    errorMessage.includes('insufficient liquidity') ||
    errorMessage.includes('not enough liquidity')
  ) {
    return `💧 Insufficient liquidity available for this size. Please reduce the amount or try again later when more liquidity is available.`
  }

  // Insufficient balance errors
  if (
    errorMessage.includes('insufficient funds') ||
    errorMessage.includes('insufficient balance')
  ) {
    return `💰 Insufficient balance in your wallet. Please ensure you have enough tokens for this transaction.`
  }

  // Slippage errors
  if (errorMessage.includes('slippage') || errorMessage.includes('price impact too high')) {
    return `📊 Price impact too high. Please reduce the transaction size or increase slippage tolerance.`
  }

  // Network/gas errors
  if (
    errorMessage.includes('out of gas') ||
    errorMessage.includes('gas required exceeds allowance')
  ) {
    return `⛽ Transaction requires more gas than available. Please try again with a higher gas limit.`
  }

  // Transaction timeout
  if (errorMessage.includes('timeout') || errorMessage.includes('request timeout')) {
    return `⏰ Transaction timed out. Please check your network connection and try again.`
  }

  // Wallet connection issues
  if (errorMessage.includes('wallet not connected') || errorMessage.includes('user rejected')) {
    return `👛 Wallet connection issue. Please reconnect your wallet and try again.`
  }

  // Contract/protocol specific errors
  if (
    errorMessage.includes('contract execution failed') ||
    errorMessage.includes('execute wasm contract failed')
  ) {
    return `⚙️ Smart contract execution failed. This may be due to network congestion or temporary protocol issues. Please try again.`
  }

  // Generic RPC/network errors
  if (
    errorMessage.includes('rpc error') ||
    errorMessage.includes('network error') ||
    errorMessage.includes('connection failed')
  ) {
    return `🌐 Network connection error. Please check your connection and try again.`
  }

  // If no specific pattern matches, return a cleaned up version of the original error
  return cleanGenericError(errorMessage)
}

/**
 * Cleans up generic error messages by removing technical jargon
 */
function cleanGenericError(errorMessage: string): string {
  // Remove common technical prefixes
  let cleaned = errorMessage
    .replace(/^.*?rpc error: code = \w+ desc = /, '')
    .replace(/^.*?failed to execute message.*?message index: \d+: /, '')
    .replace(/: execute wasm contract failed.*$/, '')
    .replace(/\[.*?\].*$/, '')
    .replace(/with gas used: '\d+'.*$/, '')

  // Capitalize first letter
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1)

  // Add period if missing
  if (!cleaned.endsWith('.') && !cleaned.endsWith('!') && !cleaned.endsWith('?')) {
    cleaned += '.'
  }

  // If still too technical, provide a generic friendly message
  if (
    cleaned.length > 200 ||
    cleaned.includes('wasm') ||
    cleaned.includes('CosmWasm') ||
    cleaned.includes('unknown request')
  ) {
    return `❌ Transaction failed due to a technical issue. Please try reducing the transaction size or try again later.`
  }

  return `❌ ${cleaned}`
}

/**
 * Determines if an error is user-actionable vs system/network error
 */
export function isUserActionableError(errorMessage: string): boolean {
  const userActionablePatterns = [
    'exceeding maximum allowed loan-to-value',
    'insufficient funds',
    'insufficient balance',
    'insufficient liquidity',
    'slippage',
    'price impact too high',
  ]

  return userActionablePatterns.some((pattern) =>
    errorMessage.toLowerCase().includes(pattern.toLowerCase()),
  )
}

/**
 * Gets error severity level for styling purposes
 */
export function getErrorSeverity(errorMessage: string): 'warning' | 'error' | 'info' {
  // Health factor warnings are warnings (user can fix)
  if (
    errorMessage.includes('exceeding maximum allowed loan-to-value') ||
    errorMessage.includes('Max LTV health factor')
  ) {
    return 'warning'
  }

  // Insufficient balance/liquidity are info (user needs to know)
  if (errorMessage.includes('insufficient') || errorMessage.includes('slippage')) {
    return 'info'
  }

  // Everything else is an error
  return 'error'
}
