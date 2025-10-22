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
    // Extract health factor if available (use RegExp.exec for safer group access)
    const healthFactorRegex = /health factor[^"]*"([0-9.]+)"/
    const healthFactorMatch = healthFactorRegex.exec(errorMessage)
    const healthFactor = healthFactorMatch ? Number.parseFloat(healthFactorMatch[1] ?? '0') : null

    if (healthFactor && healthFactor < 1.0) {
      return `Leverage too high! Your position would be at risk of liquidation (Health Factor: ${(healthFactor * 100).toFixed(2)}%). Please reduce the leverage amount to stay above 100% health factor.`
    }

    return `Leverage too high! Your position would exceed the maximum allowed loan-to-value ratio and risk liquidation. Please reduce the leverage amount.`
  }

  // Insufficient liquidity errors
  if (
    errorMessage.includes('insufficient liquidity') ||
    errorMessage.includes('not enough liquidity')
  ) {
    return `There isn't enough liquidity in the pool to complete your transaction. The available tokens are fewer than what you're trying to swap. Please reduce your amount or wait for more liquidity to become available.`
  }

  // Insufficient balance errors
  if (
    errorMessage.includes('insufficient funds') ||
    errorMessage.includes('insufficient balance')
  ) {
    return `Insufficient balance in your wallet. Please ensure you have enough tokens for this transaction.`
  }

  // Slippage and Fill Or Kill order errors (Duality liquidity issues)
  if (
    errorMessage.includes('slippage') ||
    errorMessage.includes('price impact too high') ||
    errorMessage.includes('Fill Or Kill limit order') ||
    errorMessage.includes("couldn't be executed in its entirety")
  ) {
    return `Your transaction amount is too large for the available liquidity on Duality's SuperVaults. The swap couldn't be executed without experiencing high slippage. Please reduce your transaction size and try again.`
  }

  // Network/gas errors
  if (
    errorMessage.includes('out of gas') ||
    errorMessage.includes('gas required exceeds allowance')
  ) {
    return `Your transaction ran out of gas before it could complete. This means the computational resources allocated weren't enough. Your wallet will retry with a higher gas limit automatically, or you can adjust gas settings manually.`
  }

  // Transaction timeout
  if (errorMessage.includes('timeout') || errorMessage.includes('request timeout')) {
    return `Your transaction took too long to process and timed out. This usually happens during network congestion or when the blockchain is slow to respond. Please try again in a moment.`
  }

  // Wallet connection issues
  if (errorMessage.includes('wallet not connected') || errorMessage.includes('user rejected')) {
    return `Your wallet is either disconnected or you rejected the transaction request. Please ensure your wallet is connected and approve the transaction to proceed.`
  }

  // Contract/protocol specific errors
  if (
    errorMessage.includes('contract execution failed') ||
    errorMessage.includes('execute wasm contract failed')
  ) {
    return `The smart contract couldn't execute your transaction. This could be due to network congestion or the contract being in an unexpected state. Please wait a moment and try again.`
  }

  // Generic RPC/network errors
  if (
    errorMessage.includes('rpc error') ||
    errorMessage.includes('network error') ||
    errorMessage.includes('connection failed')
  ) {
    return `The blockchain network is experiencing connectivity issues. This could be due to network congestion or a node upgrade. Please wait a moment and try again.`
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
    return `Something went wrong with this transaction. Please try again in a moment.`
  }

  return cleaned
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
    'Fill Or Kill limit order',
    "couldn't be executed in its entirety",
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
  if (
    errorMessage.includes('insufficient') ||
    errorMessage.includes('slippage') ||
    errorMessage.includes('Fill Or Kill limit order') ||
    errorMessage.includes("couldn't be executed in its entirety")
  ) {
    return 'info'
  }

  // Everything else is an error
  return 'error'
}
