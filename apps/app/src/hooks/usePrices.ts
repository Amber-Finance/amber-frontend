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
    if (!markets) return null

    const results = []

    for (const market of markets) {
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
          const priceData: PriceData = {
            denom,
            price: new BigNumber(data.data.price).shiftedBy(decimalDifferenceToOracle).toString(),
          }

          // Update market price directly here instead of in useEffect
          updateMarketPrice(denom, priceData)

          // Store the result to return
          results.push({ denom, priceData })
        }
      } catch (error) {
        console.error(`Error fetching price for ${market.asset.denom}:`, error)
      }
    }

    return results
  }

  // Use SWR with a key that depends on whether we have markets with asset denoms
  const shouldFetch = markets && markets.some((market) => market.asset?.denom)

  const { error, isLoading } = useSWR(shouldFetch && 'oraclePrices', fetchAllPrices, {
    refreshInterval: 20000,
    revalidateOnMount: true,
    revalidateOnFocus: true,
  })

  return {
    markets,
    isLoading,
    error,
  }
}
