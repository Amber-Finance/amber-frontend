import chainConfig from '@/config/chain'
import { FETCH_TIMEOUT } from '@/constants/query'
import { fetchWithTimeout } from '@/utils/fetch'
import { getUrl } from '@/utils/url'

export default async function getBtcSupplyApyHistorical(asset: string, days: number = 7) {
  //asset symbol
  try {
    const assetSymbol = asset.toLowerCase()
    const url = getUrl(
      chainConfig.endpoints.amberBackend,
      `/btc_apy_historical?chain=neutron&asset=${assetSymbol}&days=${days}`,
    )
    const response = await fetchWithTimeout(url, FETCH_TIMEOUT)

    if (!response.ok) {
      return null
    }
    const data = await response.json()

    return data
  } catch (error) {
    console.error('Could not fetch BTC supply APY historical data.', error)
    return null
  }
}
