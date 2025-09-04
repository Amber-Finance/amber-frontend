import { BigNumber } from 'bignumber.js'

import { groupBy, pipe, safeParseNumber, sortBy } from '@/utils/functional'

// Pure functions for token calculations
export const calculateAdjustedBalance = (rawBalance: number, decimals: number): number => {
  if (rawBalance <= 0) return 0
  return new BigNumber(rawBalance).shiftedBy(-decimals).toNumber()
}

export const calculateUsdValue = (
  amount: string | number,
  price: string | number,
  decimals: number,
): string => {
  if (!amount || !price) return '0'

  const parsedAmount = new BigNumber(amount).shiftedBy(-decimals)
  const parsedPrice = new BigNumber(price)

  return parsedAmount.multipliedBy(parsedPrice).toString()
}

// Pure function to create token data
export const createTokenData = (
  token: any,
  market: MarketData | undefined,
  walletBalance: TokenBalance | undefined,
  isConnected: boolean,
  chainId: string,
): TokenData => {
  const decimals = market?.asset?.decimals ?? token.decimals ?? 8
  const rawBalance = isConnected && walletBalance?.amount ? Number(walletBalance.amount) : 0

  const adjustedBalance = calculateAdjustedBalance(rawBalance, decimals)
  const usdValue =
    isConnected && walletBalance?.amount && market?.price?.price && rawBalance > 0
      ? calculateUsdValue(walletBalance.amount, market.price.price, decimals)
      : '0'

  return {
    symbol: token.symbol,
    name: token.description,
    icon: token.icon,
    balance: adjustedBalance.toString(),
    rawBalance,
    price: market?.price?.price ? parseFloat(market.price.price) : 0,
    denom: token.denom,
    usdValue,
    decimals,
    chainId,
  }
}

// Pure function to map tokens with market data
export const mapTokensWithMarketData = (
  tokens: any[],
  markets: MarketData[],
  walletBalances: TokenBalance[],
  isConnected: boolean,
  chainId: string,
): TokenData[] => {
  return tokens.map((token) => {
    const market = markets.find((m) => m.asset.denom === token.denom)
    const walletBalance = walletBalances.find((b) => b.denom === token.denom)

    return createTokenData(token, market, walletBalance, isConnected, chainId)
  })
}

// Pure function to filter tokens with balance
export const filterTokensWithBalance = (tokens: TokenData[]): TokenData[] =>
  tokens.filter((token) => token.rawBalance > 0)

// Pure function to filter tokens without balance
export const filterTokensWithoutBalance = (tokens: TokenData[]): TokenData[] =>
  tokens.filter((token) => token.rawBalance === 0)

// Pure function to group tokens by balance status
export const groupTokensByBalance = (
  tokens: TokenData[],
): {
  withBalance: TokenData[]
  withoutBalance: TokenData[]
} => {
  const grouped = groupBy<TokenData, 'hasBalance' | 'noBalance'>((token) =>
    token.rawBalance > 0 ? 'hasBalance' : 'noBalance',
  )(tokens)

  return {
    withBalance: grouped.hasBalance || [],
    withoutBalance: grouped.noBalance || [],
  }
}

// Pure function to sort tokens by USD value (descending)
export const sortTokensByUsdValue = sortBy<TokenData>((token) => parseFloat(token.usdValue), 'desc')

// Pure function to sort tokens by balance (descending)
export const sortTokensByBalance = sortBy<TokenData>((token) => token.rawBalance, 'desc')

// Pure function to find token by denom
export const findTokenByDenom =
  (denom: string) =>
  (tokens: TokenData[]): TokenData | undefined =>
    tokens.find((token) => token.denom === denom)

// Pure function to check if user has sufficient balance
export const hasSufficientBalance = (token: TokenData | null, amount: string): boolean => {
  if (!token || !amount) return true
  const parsedAmount = safeParseNumber()(amount)
  const balance = safeParseNumber()(token.balance)
  return parsedAmount <= balance
}

// Pure function to format input amount with thousand separators
export const formatWithThousandsSeparator = (value: string): string => {
  if (!value) return ''
  const [int, dec] = value.split('.')
  const intFormatted = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return dec !== undefined ? `${intFormatted}.${dec}` : intFormatted
}

// Pure function to strip non-numeric characters except dot
export const stripNonNumericExceptDot = (value: string): string => value.replace(/[^\d.]/g, '')

// Pure function to clean amount input
export const cleanAmountInput = pipe(
  (value: string) => value.replace(/,/g, ''), // Remove commas
  stripNonNumericExceptDot, // Remove non-numeric except dot
  (value: string) => {
    // Prevent multiple decimals
    const parts = value.split('.')
    let clean = parts[0]
    if (parts.length > 1) {
      clean += '.' + parts.slice(1).join('')
    }
    return clean
  },
)

// Pure function to calculate percentage amount
export const calculatePercentageAmount = (balance: number, percentage: number): string => {
  if (balance <= 0 || percentage <= 0) return ''
  return new BigNumber(balance).multipliedBy(percentage).dividedBy(100).toString()
}

// Pure function to calculate percentage from amount
export const calculatePercentageFromAmount = (amount: string, balance: number): number => {
  if (!amount || balance <= 0) return 0
  const parsedAmount = safeParseNumber()(amount)
  return Math.min((parsedAmount / balance) * 100, 100)
}

// Pure function to validate token selection
export const isValidTokenPair = (
  fromToken: TokenData | null,
  toToken: TokenData | null,
): boolean => {
  return fromToken !== null && toToken !== null && fromToken.denom !== toToken.denom
}

// Higher-order function for token filtering
export const createTokenFilter =
  (predicate: (token: TokenData) => boolean) =>
  (tokens: TokenData[]): TokenData[] =>
    tokens.filter(predicate)

// Specific filters using the higher-order function
export const filterBySymbol = (symbol: string) =>
  createTokenFilter((token) => token.symbol.toLowerCase().includes(symbol.toLowerCase()))

export const filterByMinBalance = (minBalance: number) =>
  createTokenFilter((token) => token.rawBalance >= minBalance)

export const filterExcludeDenoms = (excludedDenoms: string[]) =>
  createTokenFilter((token) => !excludedDenoms.includes(token.denom))
