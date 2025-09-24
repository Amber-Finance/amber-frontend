import { useCallback, useEffect, useRef } from 'react'

import { useChain } from '@cosmos-kit/react'
import { BigNumber } from 'bignumber.js'
import useSWR from 'swr'

import chainConfig from '@/config/chain'
import tokens from '@/config/tokens'
import { MAXBTC_DENOM } from '@/constants/query'
import { useMaxBtcApy } from '@/hooks/useMaxBtcApy'
import { usePrices } from '@/hooks/usePrices'
import { useStore } from '@/store/useStore'
import { calculateUsdValueLegacy } from '@/utils/format'

// REST-based fetcher for credit accounts
const fetchCreditAccounts = async (address: string): Promise<any[]> => {
  try {
    const accountsQuery = {
      accounts: {
        owner: address,
        limit: 10, // Get up to 10 accounts
      },
    }
    const query = btoa(JSON.stringify(accountsQuery))
    const url = `${chainConfig.endpoints.restUrl}/cosmwasm/wasm/v1/contract/${chainConfig.contracts.creditManager}/smart/${query}`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch credit accounts: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Failed to fetch credit accounts:', error)
    throw new Error(
      `Failed to fetch credit accounts: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}

// REST-based fetcher for account positions
const fetchAccountPositions = async (accountId: string): Promise<any> => {
  try {
    const positionsQuery = {
      positions: {
        account_id: accountId,
      },
    }
    const query = btoa(JSON.stringify(positionsQuery))
    const url = `${chainConfig.endpoints.restUrl}/cosmwasm/wasm/v1/contract/${chainConfig.contracts.creditManager}/smart/${query}`

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(
        `Failed to fetch positions for account ${accountId}: ${response.status} ${response.statusText}`,
      )
    }

    const data = await response.json()
    return data.data || null
  } catch (error) {
    console.error(`Failed to fetch positions for account ${accountId}:`, error)
    throw error
  }
}

// Main fetcher function that processes all account data
const fetchActiveStrategies = async (
  address: string,
  markets: Market[] | null,
  maxBtcApy: number,
  updateMarketPrice: (denom: string, priceData: PriceData) => void,
): Promise<ActiveStrategy[]> => {
  if (!markets?.length) return []

  try {
    // Get all credit accounts for the user
    const creditAccounts = await fetchCreditAccounts(address)
    if (creditAccounts.length === 0) return []

    // Get positions for each account in parallel
    const accountsWithPositions = await Promise.allSettled(
      creditAccounts.map(async (account: any) => {
        try {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Query timeout')), 10000),
          )
          const positions = await Promise.race([fetchAccountPositions(account.id), timeoutPromise])

          if (hasActivePositions(positions)) {
            return {
              id: account.id,
              kind: account.kind || 'default',
              positions,
            }
          }
          return null
        } catch (error) {
          console.warn(`Failed to query positions for account ${account.id}:`, error)
          return null
        }
      }),
    )

    // Filter out failed queries and process accounts
    const validAccounts = accountsWithPositions
      .filter(
        (result): result is PromiseFulfilledResult<any> =>
          result.status === 'fulfilled' && result.value !== null,
      )
      .map((result) => result.value)

    // Process each account to extract strategies
    const strategies = validAccounts.flatMap((account) =>
      processAccount(account, markets, maxBtcApy),
    )

    // Fetch missing prices for maxBTC if needed
    const maxBtcMarket = markets.find((m) => m.asset.denom === MAXBTC_DENOM)
    const maxBtcToken = tokens.find((t) => t.denom === MAXBTC_DENOM)

    if (maxBtcToken && (!maxBtcMarket?.price?.price || maxBtcMarket.price.price === '0')) {
      await fetchMissingPrice(MAXBTC_DENOM, maxBtcToken.decimals, updateMarketPrice)
    }

    return strategies
  } catch (error) {
    console.error('Failed to fetch active strategies:', error)
    throw error
  }
}

export function useActiveStrategies() {
  const { address } = useChain(chainConfig.name)
  const {
    markets,
    updateMarketPrice,
    activeStrategies: cachedStrategies,
    setActiveStrategies,
    resetActiveStrategies,
  } = useStore()

  // Use price and APY hooks
  usePrices() // Ensures prices are fetched and updated
  const { apy: maxBtcApy } = useMaxBtcApy()

  // Track previous strategies with a ref to avoid unnecessary updates
  const prevStrategiesRef = useRef<ActiveStrategy[] | null>(null)

  // Reset strategies when address changes
  useEffect(() => {
    prevStrategiesRef.current = null
    if (!address) {
      resetActiveStrategies()
    }
  }, [address, resetActiveStrategies])

  // Create SWR key that depends on address
  const swrKey = address ? `activeStrategies-${address}` : null

  // Use SWR to fetch and cache active strategies
  const {
    data: activeStrategies,
    error,
    isLoading,
    mutate,
  } = useSWR(swrKey, () => fetchActiveStrategies(address!, markets, maxBtcApy, updateMarketPrice), {
    refreshInterval: 60000, // Refresh every minute
    revalidateOnFocus: false,
    revalidateOnMount: true,
    fallbackData: cachedStrategies, // Use cached strategies as fallback
    onSuccess: (data) => {
      if (data && hasStrategiesChanged(prevStrategiesRef.current, data)) {
        setActiveStrategies(data)
        prevStrategiesRef.current = data
      }
    },
    onError: (err) => {
      console.error('Error fetching active strategies:', err)
    },
  })

  // Helper function to check if strategies data has changed
  const hasStrategiesChanged = (
    prevStrategies: ActiveStrategy[] | null,
    newStrategies: ActiveStrategy[],
  ): boolean => {
    if (!prevStrategies) return true

    // Check if number of strategies has changed
    if (prevStrategies.length !== newStrategies.length) {
      return true
    }

    // Check if any strategy has changed
    const strategiesChanged = newStrategies.some((newStrategy) => {
      const prevStrategy = prevStrategies.find((s) => s.accountId === newStrategy.accountId)
      return (
        !prevStrategy ||
        prevStrategy.collateralAsset.amount !== newStrategy.collateralAsset.amount ||
        prevStrategy.debtAsset.amount !== newStrategy.debtAsset.amount ||
        prevStrategy.netApy !== newStrategy.netApy
      )
    })

    return strategiesChanged
  }

  // Manual refresh function
  const refreshActiveStrategies = useCallback(() => {
    mutate()
  }, [mutate])

  // Use cached strategies if available, otherwise use fetched data
  const strategies = activeStrategies || cachedStrategies || []

  return {
    activeStrategies: strategies,
    isLoading: address ? isLoading : false,
    isInitialLoading: address ? isLoading && !cachedStrategies?.length : false,
    error: error?.message || null,
    refreshActiveStrategies,
    hasActiveStrategies: strategies.length > 0,
  }
}

// Helper function to fetch missing prices
const fetchMissingPrice = async (
  denom: string,
  decimals: number,
  updateMarketPrice: (denom: string, priceData: PriceData) => void,
) => {
  try {
    const query = btoa(JSON.stringify({ price: { denom } }))
    const url = `${chainConfig.endpoints.restUrl}/cosmwasm/wasm/v1/contract/${chainConfig.contracts.oracle}/smart/${query}`

    const response = await fetch(url)
    if (!response.ok) {
      console.error(`Failed to fetch price for ${denom}: ${response.statusText}`)
      return null
    }

    const data = await response.json()
    const decimalDifferenceToOracle = decimals - 6

    if (data?.data?.price) {
      const priceData: PriceData = {
        denom,
        price: new BigNumber(data.data.price).shiftedBy(decimalDifferenceToOracle).toString(),
      }

      // Update the market price in the store
      updateMarketPrice(denom, priceData)
      return priceData
    }
  } catch (error) {
    console.error(`Error fetching price for ${denom}:`, error)
  }
  return null
}

// Helper function to check if positions are active
const hasActivePositions = (positions: any) => {
  return positions && (positions.deposits?.length > 0 || positions.debts?.length > 0)
}

// Helper function to create strategy object
const createStrategy = (
  account: any,
  wbtcCollateral: any,
  debt: any,
  maxBtcApyValue: number,
  markets: Market[],
) => {
  const collateralToken = tokens.find((t) => t.denom === wbtcCollateral.denom)
  const debtToken = tokens.find((t) => t.denom === debt.denom)
  const collateralMarket = markets.find((m) => m.asset.denom === wbtcCollateral.denom)
  const debtMarket = markets.find((m) => m.asset.denom === debt.denom)

  if (!collateralToken || !debtToken || !collateralMarket || !debtMarket) return null

  const collateralAmount = new BigNumber(wbtcCollateral.amount)
    .shiftedBy(-collateralToken.decimals)
    .toNumber()
  const debtAmount = new BigNumber(debt.amount).shiftedBy(-debtToken.decimals).toNumber()

  // Ensure we have valid price data before calculating USD values
  const collateralPrice = collateralMarket.price?.price || '0'
  const debtPrice = debtMarket.price?.price || '0'

  // Only skip if BOTH prices are zero (indicating initial loading state)
  if (collateralPrice === '0' && debtPrice === '0') {
    return null
  }

  const collateralUsd = calculateUsdValueLegacy(
    wbtcCollateral.amount,
    collateralPrice,
    collateralToken.decimals,
  )
  const debtUsd = calculateUsdValueLegacy(debt.amount, debtPrice, debtToken.decimals)

  // Calculate leverage as collateral/equity ratio: collateral/(collateral-debt)
  const equity = collateralUsd - debtUsd
  const leverage = equity > 0 ? collateralUsd / equity : 0

  // Use maxBTC APY for collateral supply APY, fallback to market metrics
  const collateralSupplyApy =
    maxBtcApyValue / 100 || parseFloat(collateralMarket.metrics?.liquidity_rate || '0')
  const debtBorrowApy = parseFloat(debtMarket.metrics?.borrow_rate || '0')
  // Net APY = Supply APY × leverage - Borrow APY × (leverage - 1)
  // You earn on total leveraged amount, but only pay borrow cost on borrowed amount
  const netApy = collateralSupplyApy * leverage - debtBorrowApy * (leverage - 1)

  return {
    accountId: account.id,
    collateralAsset: {
      denom: wbtcCollateral.denom,
      symbol: collateralToken.symbol,
      amount: wbtcCollateral.amount,
      amountFormatted: collateralAmount,
      usdValue: collateralUsd,
      decimals: collateralToken.decimals, // Add decimals for proper handling
      icon: collateralToken.icon, // Add icon for display
      brandColor: collateralToken.brandColor, // Add brandColor for styling
    },
    debtAsset: {
      denom: debt.denom,
      symbol: debtToken.symbol,
      amount: debt.amount,
      amountFormatted: debtAmount,
      usdValue: debtUsd,
      decimals: debtToken.decimals, // Add decimals for proper handling
      icon: debtToken.icon, // Add icon for display
      brandColor: debtToken.brandColor, // Add brandColor for styling
    },
    supply: {
      amount: collateralAmount - debtAmount,
      amountFormatted: collateralAmount - debtAmount,
      usdValue: collateralUsd - debtUsd,
      decimals: collateralToken.decimals,
      icon: collateralToken.icon,
      brandColor: collateralToken.brandColor,
      symbol: collateralToken.symbol,
      denom: collateralToken.denom,
    },
    leverage,
    netApy: netApy * 100, // Convert to percentage for display (same as StrategyCard expects)
    isPositive: netApy > 0,
    strategyId: `${collateralToken.symbol}-${debtToken.symbol}`,
  }
}

// Helper function to process account data into strategies
const processAccount = (account: any, markets: Market[], maxBtcApy: number) => {
  const { deposits = [], debts = [] } = account.positions
  const maxBtcCollateral = deposits.find((deposit: any) => deposit.denom === MAXBTC_DENOM)

  if (!maxBtcCollateral) return []

  const btcDebts = debts.filter((debt: any) => {
    const token = tokens.find((t) => t.denom === debt.denom)
    return token && token.symbol.includes('BTC') && token.symbol !== 'maxBTC'
  })

  return btcDebts
    .map((debt: any) => createStrategy(account, maxBtcCollateral, debt, maxBtcApy, markets))
    .filter(Boolean)
}
