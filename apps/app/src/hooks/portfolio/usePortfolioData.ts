import { useEffect, useMemo, useRef } from 'react'

import { useChain } from '@cosmos-kit/react'
import useSWR from 'swr'

import getPortfolioPositions from '@/api/getPortfolioPositions'
import chainConfig from '@/config/chain'
import tokens from '@/config/tokens'
import { useMaxBtcApy } from '@/hooks/market'
import { useLstMarkets } from '@/hooks/market/useLstMarkets'
import { usePrices } from '@/hooks/market/usePrices'
import { useStore } from '@/store/useStore'
import { calculateUsdValueLegacy } from '@/utils/formatting/format'

/**
 * Centralized Portfolio Data Hook
 * Fetches portfolio data and stores RAW data in Zustand
 *
 * This is the single source of truth for portfolio data fetching.
 * Components should use selector hooks (useDeposits, useActiveStrategies) to get processed data.
 *
 * @returns Portfolio data, loading states, and refresh function
 */
export function usePortfolioData() {
  const { address } = useChain(chainConfig.name)
  const {
    portfolioPositions: cachedPositions,
    setPortfolioPositions,
    resetPortfolioPositions,
  } = useStore()

  // Track previous address to detect disconnection (not initial load)
  const prevAddressRef = useRef<string | undefined>(address)

  // Reset positions ONLY when wallet actively disconnects (not on initial load)
  useEffect(() => {
    // If we had an address before but don't now = wallet disconnected
    if (prevAddressRef.current && !address) {
      resetPortfolioPositions()
    }

    // Update ref for next render
    prevAddressRef.current = address
  }, [address, resetPortfolioPositions])

  // Create SWR key - only fetch when wallet is connected
  const swrKey = address ? `portfolio-positions-${address}` : null

  // Use SWR ONLY for background fetching - Zustand is the INSTANT source of truth
  // This ensures cached data shows in 0ms while fresh data fetches in 6-7 seconds
  const { error, isLoading, isValidating, mutate } = useSWR(
    swrKey,
    async () => {
      const data = await getPortfolioPositions(address!)

      // Immediately update Zustand cache with fresh data
      if (data) {
        setPortfolioPositions(data)
      }

      return data
    },
    {
      refreshInterval: 60000, // Refresh every 60 seconds (1 minute)
      revalidateOnFocus: true,
      revalidateOnMount: true, // Fetch immediately when wallet connects
      revalidateOnReconnect: true,
      fallbackData: undefined, // Don't use SWR's cache - Zustand handles instant display
      dedupingInterval: 5000, // Prevent duplicate requests within 5 seconds
      keepPreviousData: false, // Zustand keeps our data, not SWR
      shouldRetryOnError: false, // Don't retry on error - return null gracefully
      errorRetryCount: 0, // No retries
      onError: (err) => {
        console.error('[Portfolio] ❌ Error fetching portfolio positions:', err)
        // Don't clear cache on error - keep showing old data
      },
    },
  )

  // ALWAYS read from Zustand cache - this is INSTANT (0ms, no waiting for 6-7s fetch)
  // SWR only updates the cache in the background
  const portfolioPositions = cachedPositions

  // Calculate derived data from cached positions
  const totalPositions = portfolioPositions
    ? portfolioPositions.accounts.length + portfolioPositions.redbank_deposits.length
    : 0

  const totalBorrows = portfolioPositions ? Number.parseFloat(portfolioPositions.total_borrows) : 0
  const totalSupplies = portfolioPositions
    ? Number.parseFloat(portfolioPositions.total_supplies)
    : 0
  const totalSupplied = totalSupplies - totalBorrows

  // Better loading state: only show loading if we have NO cached data at all
  // If we have cached data, show it immediately while validating in the background
  const isInitialLoading = isLoading && !cachedPositions

  return {
    // Raw data (ALWAYS from Zustand cache - instant 0ms access)
    portfolioPositions,

    // Derived metrics
    totalPositions,
    totalBorrows,
    totalSupplies,
    totalSupplied,

    // Loading states
    isLoading: isInitialLoading, // Only true when NO cached data exists
    isValidating, // True during 6-7s background fetch (while showing cached data)
    error,

    // Actions
    mutate, // Force a background refresh
  }
}

/**
 * Selector hook to get deposits from Zustand
 * Processes raw portfolioPositions into deposit format
 */
export function useDeposits() {
  const portfolioPositions = useStore((state) => state.portfolioPositions)
  const markets = useStore((state) => state.markets)
  const { data: lstMarkets } = useLstMarkets()

  // Ensure prices are loaded
  usePrices()

  const deposits = useMemo(() => {
    if (!portfolioPositions || !markets?.length) return []

    const depositPositions: DepositPosition[] = []

    for (const deposit of portfolioPositions.redbank_deposits) {
      const token = tokens.find((t) => t.denom === deposit.denom)
      if (!token) continue

      const market = markets.find((m) => m.asset.denom === deposit.denom)
      if (!market) continue

      const amountFormatted = Number.parseFloat(deposit.amount) / Math.pow(10, token.decimals)
      const usdValue = calculateUsdValueLegacy(
        deposit.amount,
        market.price?.price || '0',
        token.decimals,
      )

      const lstMarket = lstMarkets?.find((lst) => lst.token.denom === deposit.denom)
      const supplyApy = lstMarket?.metrics.totalApy || 0

      const initialDepositItem = portfolioPositions.redbank_initial_deposits?.find(
        (init) => init.denom === deposit.denom,
      )
      const initialDepositUsdValue = initialDepositItem
        ? calculateUsdValueLegacy(
            initialDepositItem.amount,
            market.price?.price || '0',
            token.decimals,
          )
        : 0

      const actualPnl = usdValue - initialDepositUsdValue
      const actualPnlPercent =
        initialDepositUsdValue > 0 ? (actualPnl / initialDepositUsdValue) * 100 : 0

      depositPositions.push({
        denom: deposit.denom,
        symbol: token.symbol,
        amount: deposit.amount,
        amountFormatted: Number.isNaN(amountFormatted) ? 0 : amountFormatted,
        usdValue: Number.isNaN(usdValue) ? 0 : usdValue,
        apy: Number.isNaN(supplyApy) ? 0 : supplyApy,
        actualPnl: Number.isNaN(actualPnl) ? 0 : actualPnl,
        actualPnlPercent: Number.isNaN(actualPnlPercent) ? 0 : actualPnlPercent,
      })
    }

    return depositPositions.sort((a, b) => b.usdValue - a.usdValue)
  }, [portfolioPositions, markets, lstMarkets])

  return deposits
}

/**
 * Helper function to process a single deposit-debt pair into a strategy
 */
function processStrategyPair(
  account: any,
  depositItem: any,
  debtItem: any,
  markets: any[],
  maxBtcApy: number,
): ActiveStrategy | null {
  const collateralToken = tokens.find((t) => t.denom === depositItem.denom)
  const debtToken = tokens.find((t) => t.denom === debtItem.denom)

  if (!collateralToken || !debtToken) return null

  const collateralMarket = markets.find((m) => m.asset.denom === depositItem.denom)
  const debtMarket = markets.find((m) => m.asset.denom === debtItem.denom)

  if (!collateralMarket || !debtMarket) return null

  const collateralAmountFormatted =
    Number.parseFloat(depositItem.amount) / Math.pow(10, collateralToken.decimals)
  const collateralUsdValue = calculateUsdValueLegacy(
    depositItem.amount,
    collateralMarket.price?.price || '0',
    collateralToken.decimals,
  )

  const debtAmountFormatted = Number.parseFloat(debtItem.amount) / Math.pow(10, debtToken.decimals)
  const debtUsdValue = calculateUsdValueLegacy(
    debtItem.amount,
    debtMarket.price?.price || '0',
    debtToken.decimals,
  )

  const initialDepositItem = account.initial_deposit.find(
    (init: any) => init.denom === depositItem.denom,
  )
  const initialDepositUsdValue = initialDepositItem
    ? calculateUsdValueLegacy(
        initialDepositItem.amount,
        collateralMarket.price?.price || '0',
        collateralToken.decimals,
      )
    : 0

  const currentPositionValue = collateralUsdValue - debtUsdValue
  const actualPnl = currentPositionValue - initialDepositUsdValue
  const actualPnlPercent =
    initialDepositUsdValue > 0 ? (actualPnl / initialDepositUsdValue) * 100 : 0

  const leverage =
    collateralUsdValue > 0 ? collateralUsdValue / (collateralUsdValue - debtUsdValue) : 1

  const collateralApy = Number.parseFloat(collateralMarket.metrics?.liquidity_rate || '0') * 100
  const debtApy = Number.parseFloat(debtMarket.metrics?.borrow_rate || '0') * 100

  const stakingApy = collateralToken.symbol === 'maxBTC' ? maxBtcApy : 0
  const totalCollateralApy = collateralApy + stakingApy

  const netApy = totalCollateralApy * leverage - debtApy * (leverage - 1)

  return {
    accountId: account.account_id,
    collateralAsset: {
      denom: depositItem.denom,
      symbol: collateralToken.symbol,
      amount: depositItem.amount,
      amountFormatted: collateralAmountFormatted,
      usdValue: collateralUsdValue,
      decimals: collateralToken.decimals,
      icon: collateralToken.icon,
    },
    debtAsset: {
      denom: debtItem.denom,
      symbol: debtToken.symbol,
      amount: debtItem.amount,
      amountFormatted: debtAmountFormatted,
      usdValue: debtUsdValue,
      decimals: debtToken.decimals,
      icon: debtToken.icon,
    },
    supply: {
      denom: depositItem.denom,
      symbol: collateralToken.symbol,
      amount: depositItem.amount,
      amountFormatted: collateralAmountFormatted - debtAmountFormatted,
      usdValue: collateralUsdValue - debtUsdValue,
      decimals: collateralToken.decimals,
      icon: collateralToken.icon,
    },
    leverage,
    netApy,
    isPositive: netApy >= 0,
    strategyId: `${collateralToken.symbol}-${debtToken.symbol}`,
    initialInvestment: initialDepositUsdValue,
    actualPnl,
    actualPnlPercent,
  }
}

/**
 * Helper function to process all strategies for an account
 */
function processAccountStrategies(
  account: any,
  markets: any[],
  maxBtcApy: number,
): ActiveStrategy[] {
  if (account.deposits.length === 0 || account.debts.length === 0) return []

  const accountStrategies: ActiveStrategy[] = []

  for (const depositItem of account.deposits) {
    for (const debtItem of account.debts) {
      const strategy = processStrategyPair(account, depositItem, debtItem, markets, maxBtcApy)
      if (strategy) {
        accountStrategies.push(strategy)
      }
    }
  }

  return accountStrategies
}

/**
 * Selector hook to get active strategies from Zustand
 * Processes raw portfolioPositions into strategy format
 */
export function useActiveStrategies() {
  const portfolioPositions = useStore((state) => state.portfolioPositions)
  const markets = useStore((state) => state.markets)
  const { apy: maxBtcApy } = useMaxBtcApy()

  // Ensure prices are loaded
  usePrices()

  const activeStrategies = useMemo(() => {
    if (!portfolioPositions || !markets?.length) return []

    const strategies: ActiveStrategy[] = []

    for (const account of portfolioPositions.accounts) {
      const accountStrategies = processAccountStrategies(account, markets, maxBtcApy)
      strategies.push(...accountStrategies)
    }

    return strategies.sort((a, b) => {
      const aValue = a.collateralAsset.usdValue - a.debtAsset.usdValue
      const bValue = b.collateralAsset.usdValue - b.debtAsset.usdValue
      return bValue - aValue
    })
  }, [portfolioPositions, markets, maxBtcApy])

  return activeStrategies
}

/**
 * Selector hook to get portfolio positions from Zustand
 * Returns raw portfolio data
 */
export function usePortfolioPositions() {
  const portfolioPositions = useStore((state) => state.portfolioPositions)
  return portfolioPositions
}

/**
 * Hook to check if portfolio data is being refreshed in the background
 * Useful for showing subtle loading indicators without blocking the UI
 */
export function usePortfolioValidating() {
  const { address } = useChain(chainConfig.name)
  const swrKey = address ? `portfolio-positions-${address}` : null

  // Access SWR cache to check if data is validating
  const { isValidating } = useSWR(swrKey, null, {
    revalidateOnMount: false,
    revalidateOnFocus: false,
  })

  return isValidating
}
