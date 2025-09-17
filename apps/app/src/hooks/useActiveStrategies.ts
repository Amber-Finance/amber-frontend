import { useCallback, useEffect, useState } from 'react'

import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { useChain } from '@cosmos-kit/react'
import { BigNumber } from 'bignumber.js'

import chainConfig from '@/config/chain'
import tokens from '@/config/tokens'
import { MAXBTC_DENOM } from '@/constants/query'
import { useMaxBtcApy } from '@/hooks/useMaxBtcApy'
import { usePrices } from '@/hooks/usePrices'
import { useStore } from '@/store/useStore'
import { calculateUsdValueLegacy } from '@/utils/format'

// Create a CosmWasm client with fallback RPC endpoints
const createCosmWasmClientWithFallback = async (): Promise<any> => {
  const primaryRpc = chainConfig.endpoints.rpcUrl
  const fallbackRpcs = chainConfig.endpoints.fallbackRpcs || []
  const allRpcs = [primaryRpc, ...fallbackRpcs]

  for (const rpc of allRpcs) {
    try {
      console.log(`Attempting to connect to RPC: ${rpc}`)
      const client = await CosmWasmClient.connect(rpc)
      console.log(`Successfully connected to RPC: ${rpc}`)
      return client
    } catch (error) {
      console.warn(`Failed to connect to RPC ${rpc}:`, error)
      if (rpc === allRpcs[allRpcs.length - 1]) {
        // If this is the last RPC, throw the error
        throw new Error(
          `Failed to connect to any RPC endpoint. Last error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        )
      }
      // Continue to next RPC
    }
  }

  throw new Error('No RPC endpoints available')
}

export function useActiveStrategies() {
  const { address, getCosmWasmClient } = useChain(chainConfig.name)
  const { markets, updateMarketPrice } = useStore()
  const [activeStrategies, setActiveStrategies] = useState<ActiveStrategy[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Use price and APY hooks
  usePrices() // Ensures prices are fetched and updated
  const { apy: maxBtcApy } = useMaxBtcApy()

  // Fetch missing prices for strategy tokens that aren't in markets
  const fetchMissingPrice = useCallback(
    async (denom: string, decimals: number) => {
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
    },
    [updateMarketPrice],
  )

  // Get maxBTC denom for looping strategies
  const maxBtcDenom = MAXBTC_DENOM

  // Get all credit accounts for the user
  const getUserCreditAccounts = async (client: any) => {
    try {
      const accountsQuery = {
        accounts: {
          owner: address,
          limit: 100, // Get up to 100 accounts
        },
      }
      const response = await client.queryContractSmart(
        chainConfig.contracts.creditManager,
        accountsQuery,
      )
      // Response structure: [...] (direct array)
      return response || []
    } catch (error) {
      console.error('Failed to fetch credit accounts:', error)
      throw new Error(
        `Failed to fetch credit accounts: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  // Get positions for a specific account
  const getAccountPositions = async (client: any, accountId: string) => {
    try {
      const positionsQuery = {
        positions: {
          account_id: accountId,
        },
      }
      const response = await client.queryContractSmart(
        chainConfig.contracts.creditManager,
        positionsQuery,
      )
      // Response structure: { account_id, deposits, debts, ... } (direct object)
      return response || null
    } catch (error) {
      console.error(`Failed to fetch positions for account ${accountId}:`, error)
      throw error
    }
  }

  const hasActivePositions = (positions: any) => {
    return positions && (positions.deposits?.length > 0 || positions.debts?.length > 0)
  }

  const createStrategy = (account: any, wbtcCollateral: any, debt: any, maxBtcApyValue: number) => {
    const collateralToken = tokens.find((t) => t.denom === wbtcCollateral.denom)
    const debtToken = tokens.find((t) => t.denom === debt.denom)
    const collateralMarket = markets?.find((m) => m.asset.denom === wbtcCollateral.denom)
    const debtMarket = markets?.find((m) => m.asset.denom === debt.denom)

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

    // Calculate leverage as debt/equity ratio: debt/(collateral-debt)
    const equity = collateralUsd - debtUsd
    const leverage = equity > 0 ? debtUsd / equity : 0

    // Use maxBTC APY for collateral supply APY, fallback to market metrics
    const collateralSupplyApy =
      maxBtcApyValue / 100 || parseFloat(collateralMarket.metrics?.liquidity_rate || '0')
    const debtBorrowApy = parseFloat(debtMarket.metrics?.borrow_rate || '0')
    // Net APY = Supply APY × (1 + leverage) - Borrow APY × leverage
    const netApy = collateralSupplyApy * (1 + leverage) - debtBorrowApy * leverage

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
      leverage,
      netApy: netApy * 100, // Convert to percentage for display (same as StrategyCard expects)
      isPositive: netApy > 0,
      strategyId: `${collateralToken.symbol}-${debtToken.symbol}`,
    }
  }

  // Get all user accounts with their positions
  const getUserAccountsWithPositions = async (client: any) => {
    // First, get all credit accounts for the user
    const creditAccounts = await getUserCreditAccounts(client)

    if (creditAccounts.length === 0) {
      return []
    }

    // Then, query positions for each account in parallel with timeout
    const accountsWithPositions = await Promise.allSettled(
      creditAccounts.map(async (account: any) => {
        try {
          // Add timeout to prevent hanging
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Query timeout')), 10000),
          )

          const positions = await Promise.race([
            getAccountPositions(client, account.id),
            timeoutPromise,
          ])

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

    // Filter out failed queries and null results
    return accountsWithPositions
      .filter(
        (result): result is PromiseFulfilledResult<any> =>
          result.status === 'fulfilled' && result.value !== null,
      )
      .map((result) => result.value)
  }

  const processAccount = (account: any) => {
    const { deposits = [], debts = [] } = account.positions
    const maxBtcCollateral = deposits.find((deposit: any) => deposit.denom === maxBtcDenom)

    if (!maxBtcCollateral) return []

    const btcDebts = debts.filter((debt: any) => {
      const token = tokens.find((t) => t.denom === debt.denom)
      return token && token.symbol.includes('BTC') && token.symbol !== 'maxBTC'
    })

    return btcDebts
      .map((debt: any) => createStrategy(account, maxBtcCollateral, debt, maxBtcApy))
      .filter(Boolean)
  }

  const scanCreditAccounts = useCallback(async () => {
    if (!address || !markets?.length) return
    setIsLoading(true)
    setError(null)
    setHasAttemptedLoad(true)

    // Check if maxBTC price is missing and fetch it
    const maxBtcMarket = markets.find((m) => m.asset.denom === maxBtcDenom)
    const maxBtcToken = tokens.find((t) => t.denom === maxBtcDenom)

    if (maxBtcToken) {
      if (!maxBtcMarket) {
        await fetchMissingPrice(maxBtcDenom, maxBtcToken.decimals)
      } else if (!maxBtcMarket.price?.price || maxBtcMarket.price.price === '0') {
        await fetchMissingPrice(maxBtcDenom, maxBtcToken.decimals)
      }
    }

    try {
      // Try our custom client with fallback RPC endpoints first
      let client: any
      try {
        client = await createCosmWasmClientWithFallback()
      } catch (fallbackError) {
        console.warn('Fallback client failed, trying CosmosKit client:', fallbackError)
        // Fallback to CosmosKit client if our custom client fails
        const cosmosKitClient = await getCosmWasmClient()
        if (!cosmosKitClient)
          throw new Error('Failed to get CosmWasm client from both custom and CosmosKit')
        client = cosmosKitClient
      }

      // Get all user accounts with their positions using the optimized approach
      const accountsWithPositions = await getUserAccountsWithPositions(client)

      if (accountsWithPositions.length === 0) {
        setActiveStrategies([])
        return
      }

      // Process each account to extract strategies
      const strategies = accountsWithPositions.flatMap(processAccount)

      setActiveStrategies(strategies)
    } catch (err) {
      console.error('Failed to scan credit accounts:', err)
      setError(err instanceof Error ? err.message : 'Failed to scan credit accounts')
    } finally {
      setIsLoading(false)
    }
  }, [address, getCosmWasmClient, maxBtcDenom, markets, maxBtcApy])

  // Scan accounts when wallet connects or when markets/prices update
  useEffect(() => {
    if (address) {
      scanCreditAccounts()
    } else {
      setActiveStrategies([])
      setHasAttemptedLoad(false) // Reset when wallet disconnects
    }
  }, [address, markets, scanCreditAccounts]) // Also depend on markets to trigger when prices load

  // Manual refresh function
  const refreshActiveStrategies = useCallback(() => {
    if (address) {
      scanCreditAccounts()
    }
  }, [address, scanCreditAccounts])

  return {
    activeStrategies,
    isLoading,
    isInitialLoading: !hasAttemptedLoad && !!address, // Show initial loading when connected but haven't attempted load yet
    error,
    refreshActiveStrategies,
    hasActiveStrategies: activeStrategies.length > 0,
  }
}
