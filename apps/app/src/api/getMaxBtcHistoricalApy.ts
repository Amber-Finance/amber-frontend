import chainConfig from '@/config/chain'
import { FETCH_TIMEOUT } from '@/constants/query'
import { fetchWithTimeout } from '@/utils/common/fetch'
import { getUrl } from '@/utils/ui/url'

export default async function getMaxBtcHistoricalApy(days: number = 7) {
  try {
    const url = getUrl(
      chainConfig.endpoints.amberBackend,
      `/btc_apy_historical?chain=neutron&asset=maxbtc&days=${days}`,
    )
    const response = await fetchWithTimeout(url, FETCH_TIMEOUT)

    if (!response.ok) {
      return null
    }
    const data = await response.json()

    return data
  } catch (error) {
    console.error('Could not fetch assets apy data.', error)
    return null
  }
}
