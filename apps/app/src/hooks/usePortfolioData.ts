import { useEffect, useMemo } from 'react'

import { useChain } from '@cosmos-kit/react'
import useSWR from 'swr'

import getPortfolioPositions from '@/api/getPortfolioPositions'
import chainConfig from '@/config/chain'
import tokens from '@/config/tokens'
import { useLstMarkets } from '@/hooks/useLstMarkets'
import { useMaxBtcApy } from '@/hooks/useMaxBtcApy'
import { usePrices } from '@/hooks/usePrices'
import { useStore } from '@/store/useStore'
import { calculateUsdValueLegacy } from '@/utils/format'

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

  // Reset positions when wallet disconnects
  useEffect(() => {
    if (!address) {
      resetPortfolioPositions()
    }
  }, [address, resetPortfolioPositions])

  // Create SWR key - only fetch when wallet is connected
  const swrKey = address ? `portfolio-positions-${address}` : null

  // Use SWR to fetch and cache portfolio positions
  const {
    data: portfolioPositions,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR(
    swrKey,
    async () => {
      const data = await getPortfolioPositions(address!)
      return data || cachedPositions || null
    },
    {
      refreshInterval: 60000, // Refresh every 60 seconds (1 minute)
      revalidateOnFocus: true,
      revalidateOnMount: true, // Fetch immediately when wallet connects
      revalidateOnReconnect: true,
      fallbackData: cachedPositions || undefined,
      dedupingInterval: 5000,
      keepPreviousData: true,
      shouldRetryOnError: true,
      errorRetryCount: 3,
      errorRetryInterval: 10000,
      onSuccess: (data) => {
        if (data) {
          setPortfolioPositions(data)
        }
      },
      onError: (err) => {
        console.error('Error fetching portfolio positions:', err)
      },
    },
  )

  // Calculate derived data
  const totalPositions = portfolioPositions
    ? portfolioPositions.accounts.length + portfolioPositions.redbank_deposits.length
    : 0

  const totalBorrows = portfolioPositions ? parseFloat(portfolioPositions.total_borrows) : 0
  const totalSupplies = portfolioPositions ? parseFloat(portfolioPositions.total_supplies) : 0
  const totalSupplied = totalSupplies - totalBorrows

  return {
    // Raw data
    portfolioPositions,

    // Derived metrics
    totalPositions,
    totalBorrows,
    totalSupplies,
    totalSupplied,

    // Loading states
    isLoading,
    isValidating,
    error,

    // Actions
    mutate,
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

    portfolioPositions.redbank_deposits.forEach((deposit) => {
      const token = tokens.find((t) => t.denom === deposit.denom)
      if (!token) return

      const market = markets.find((m) => m.asset.denom === deposit.denom)
      if (!market) return

      const amountFormatted = parseFloat(deposit.amount) / Math.pow(10, token.decimals)
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
        amountFormatted: isNaN(amountFormatted) ? 0 : amountFormatted,
        usdValue: isNaN(usdValue) ? 0 : usdValue,
        apy: isNaN(supplyApy) ? 0 : supplyApy,
        actualPnl: isNaN(actualPnl) ? 0 : actualPnl,
        actualPnlPercent: isNaN(actualPnlPercent) ? 0 : actualPnlPercent,
      })
    })

    return depositPositions.sort((a, b) => b.usdValue - a.usdValue)
  }, [portfolioPositions, markets, lstMarkets])

  return deposits
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

    portfolioPositions.accounts.forEach((account) => {
      if (account.deposits.length === 0 || account.debts.length === 0) return

      account.deposits.forEach((depositItem) => {
        account.debts.forEach((debtItem) => {
          const collateralToken = tokens.find((t) => t.denom === depositItem.denom)
          const debtToken = tokens.find((t) => t.denom === debtItem.denom)

          if (!collateralToken || !debtToken) return

          const collateralMarket = markets.find((m) => m.asset.denom === depositItem.denom)
          const debtMarket = markets.find((m) => m.asset.denom === debtItem.denom)

          if (!collateralMarket || !debtMarket) return

          const collateralAmountFormatted =
            parseFloat(depositItem.amount) / Math.pow(10, collateralToken.decimals)
          const collateralUsdValue = calculateUsdValueLegacy(
            depositItem.amount,
            collateralMarket.price?.price || '0',
            collateralToken.decimals,
          )

          const debtAmountFormatted = parseFloat(debtItem.amount) / Math.pow(10, debtToken.decimals)
          const debtUsdValue = calculateUsdValueLegacy(
            debtItem.amount,
            debtMarket.price?.price || '0',
            debtToken.decimals,
          )

          const initialDepositItem = account.initial_deposit.find(
            (init) => init.denom === depositItem.denom,
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

          const collateralApy = parseFloat(collateralMarket.metrics?.liquidity_rate || '0') * 100
          const debtApy = parseFloat(debtMarket.metrics?.borrow_rate || '0') * 100

          const stakingApy = collateralToken.symbol === 'maxBTC' ? maxBtcApy : 0
          const totalCollateralApy = collateralApy + stakingApy

          const netApy = totalCollateralApy * leverage - debtApy * (leverage - 1)

          strategies.push({
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
          })
        })
      })
    })

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
