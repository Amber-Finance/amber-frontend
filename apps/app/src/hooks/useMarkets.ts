'use client'

import useSWR from 'swr'
import useSWRImmutable from 'swr/immutable'

import chainConfig from '@/config/chain'
import tokens from '@/config/tokens'
import { usePrices } from '@/hooks/usePrices'
import { useStore } from '@/store/useStore'

// Create initial markets from params data and token data
const createInitialMarkets = (paramsData: AssetParamsResponse, tokensData: Token[]): Market[] => {
  // First filter params to only include deposit-enabled assets
  // Convert to proper Market objects and filter out nulls
  const marketsWithNulls = paramsData.data
    .filter(
      // Only include assets where deposits are enabled, credit_manager.whitelisted is true,
      // and max_loan_to_value is not "0"
      (param) =>
        param.red_bank.deposit_enabled &&
        param.credit_manager.whitelisted &&
        param.max_loan_to_value !== '0',
    )
    .map((param) => {
      // Find matching token in tokens data
      const matchedToken = tokensData.find((token) => token.denom === param.denom)

      if (matchedToken) {
        // Create asset object with matched data
        const asset: Asset = {
          denom: param.denom,
          symbol: matchedToken.symbol || '',
          name: matchedToken.description || '',
          description: matchedToken.description || '',
          decimals: matchedToken.decimals || 6,
          icon: matchedToken.icon || '',
        }

        // Create params object from MarketResponse
        const params: MarketParams = {
          denom: param.denom,
          credit_manager: {
            whitelisted: param.credit_manager.whitelisted,
            withdraw_enabled: param.credit_manager.withdraw_enabled,
            hls: null,
          },
          red_bank: {
            deposit_enabled: param.red_bank.deposit_enabled,
            borrow_enabled: param.red_bank.borrow_enabled,
            withdraw_enabled: param.red_bank.withdraw_enabled,
          },
          max_loan_to_value: param.max_loan_to_value,
          liquidation_threshold: param.liquidation_threshold,
          liquidation_bonus: {
            starting_lb: param.liquidation_bonus.starting_lb,
            slope: param.liquidation_bonus.slope,
            min_lb: param.liquidation_bonus.min_lb,
            max_lb: param.liquidation_bonus.max_lb,
          },
          protocol_liquidation_fee: param.protocol_liquidation_fee,
          deposit_cap: param.deposit_cap,
          close_factor: param.close_factor,
        }

        // Create empty market data item to be filled later
        const metrics: MarketDataItem = {
          denom: param.denom,
          collateral_total_amount: '0',
          debt_total_amount: '0',
          utilization_rate: '0',
          borrow_rate: '0',
          liquidity_rate: '0',
          reserve_factor: '0',
          interest_rate_model: {
            optimal_utilization_rate: '0',
            base: '0',
            slope_1: '0',
            slope_2: '0',
          },
        }

        // Add price data directly from the token API
        const price: PriceData = {
          denom: param.denom,
          price: '0',
        }

        // Create market with default deposit and debt values
        const market: Market = {
          asset,
          params,
          metrics,
          price,
          deposit: '0', // Default deposit amount
          debt: '0', // Default debt amount
        }
        return market
      }
      return null
    })
    .filter((item): item is Market => item !== null)

  return marketsWithNulls
}

// Update markets with market data
const updateMarketsWithMetrics = (
  markets: Market[],
  marketsData: MarketDataResponse,
  updateMarketMetrics: (denom: string, metrics: MarketDataItem) => void,
): void => {
  // For each market, find the corresponding market data and update metrics
  markets.forEach((market) => {
    const marketDenom = market.params.denom
    const matchingMarketData = marketsData.data.data.find((md) => md.denom === marketDenom)

    if (matchingMarketData) {
      updateMarketMetrics(marketDenom, matchingMarketData)
    } else {
      console.warn(`No matching market data found for ${marketDenom} (${market.asset.symbol})`)
    }
  })
}

export const useMarkets = () => {
  const { markets, setMarkets, updateMarketMetrics } = useStore()
  usePrices()

  // Construct the URLs for fetching data
  const paramsUrl = `${chainConfig.endpoints.restUrl}/cosmwasm/wasm/v1/contract/${chainConfig.contracts.params}/smart/${chainConfig.queries.allAssetParams}`
  const marketsUrl = `${chainConfig.endpoints.restUrl}/cosmwasm/wasm/v1/contract/${chainConfig.contracts.redBank}/smart/${chainConfig.queries.allMarkets}`

  // Fetcher for params data
  const paramsFetcher = async (url: string) => {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Error fetching params data: ${response.statusText}`)
    }
    return await response.json()
  }

  // Fetcher for markets data
  const marketsFetcher = async (url: string) => {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Error fetching markets data: ${response.statusText}`)
    }
    return await response.json()
  }

  // Function to fetch all market data in parallel
  const fetchAllMarketData = async () => {
    try {
      const [paramsResult, marketsResult] = await Promise.all([
        paramsFetcher(paramsUrl),
        marketsFetcher(marketsUrl),
      ])

      return {
        paramsData: paramsResult,
        marketsData: marketsResult,
      }
    } catch (error) {
      console.error('Error fetching market data:', error)
      throw error
    }
  }

  // Fetch all data at once to avoid race conditions
  const {
    data: marketDataBundle,
    error,
    isLoading,
  } = useSWRImmutable<{
    paramsData: AssetParamsResponse
    marketsData: MarketDataResponse
  }>('allMarketData', fetchAllMarketData, {
    onSuccess: (data) => {
      if (data?.paramsData?.data && data?.marketsData?.data) {
        // Create initial markets
        const initialMarkets = createInitialMarkets(data.paramsData, tokens)

        // Set the markets in the store
        setMarkets(initialMarkets)

        // Then immediately update with metrics
        updateMarketsWithMetrics(initialMarkets, data.marketsData, updateMarketMetrics)
      }
    },
  })

  // Set up a periodic refresh for just the market metrics data
  useSWR<MarketDataResponse>('metricsRefresh', () => marketsFetcher(marketsUrl), {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    onSuccess: (data: MarketDataResponse) => {
      // Update markets with metrics if we have both markets and market data
      if (markets && data && data.data) {
        updateMarketsWithMetrics(markets, data, updateMarketMetrics)
      }
    },
  })

  return {
    paramsData: marketDataBundle?.paramsData,
    marketsData: marketDataBundle?.marketsData,
    error,
    isLoading,
  }
}
