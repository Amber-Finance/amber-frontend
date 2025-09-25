'use client'

import BigNumber from 'bignumber.js'
import useSWR from 'swr'

import chainConfig from '@/config/chain'
import { useStore } from '@/store/useStore'

// Oracle contract price query interface
interface PriceResponse {
  data: {
    price: string
    denom: string
  }
}

export const usePrices = () => {
  const { markets, updateMarketPrice } = useStore()

  // Define a fetcher that checks all markets with an asset denom
  const fetchAllPrices = async () => {
    const currentMarkets = markets || []
    const results = []
    const priceSet = new Set<string>()

    for (const market of currentMarkets) {
      if (!market.asset?.denom) continue

      try {
        const denom = market.asset.denom
        const query = btoa(JSON.stringify({ price: { denom } }))
        const url = `${chainConfig.endpoints.restUrl}/cosmwasm/wasm/v1/contract/${chainConfig.contracts.oracle}/smart/${query}`

        const response = await fetch(url)
        if (!response.ok) {
          console.error(`Failed to fetch price for ${denom}: ${response.statusText}`)
          continue
        }

        const data: PriceResponse = await response.json()

        const decimalDifferenceToOracle = market.asset.decimals - 6

        if (data?.data?.price) {
          const adjustedPrice = new BigNumber(data.data.price)
            .shiftedBy(decimalDifferenceToOracle)
            .toString()
          priceSet.add(data.data.price)

          const priceData: PriceData = {
            denom,
            price: adjustedPrice,
          }

          // Store the result to return
          results.push({ denom, priceData, rawPrice: data.data.price })
        }
      } catch (error) {
        console.error(`Error fetching price for ${market.asset.denom}:`, error)
      }
    }

    results.forEach(({ denom, priceData }) => {
      updateMarketPrice(denom, priceData)
    })

    return results
  }

  // Always fetch prices with a consistent key, no conditional calling
  const { error, isLoading, mutate } = useSWR('oraclePrices', fetchAllPrices, {
    refreshInterval: 60000, // Refresh every minute
    revalidateOnMount: true,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    errorRetryCount: 3, // Increased retries for oracle warm-up
    errorRetryInterval: 5000, // Longer interval for initial retries
    dedupingInterval: 10000, // 10 seconds
  })

  return {
    markets,
    isLoading,
    error,
    refetchPrices: mutate,
  }
}
