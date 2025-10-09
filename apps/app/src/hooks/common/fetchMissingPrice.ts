import BigNumber from 'bignumber.js'

import chainConfig from '@/config/chain'

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

export default fetchMissingPrice
