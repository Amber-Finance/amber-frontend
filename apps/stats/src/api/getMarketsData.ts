import chainConfig from '@/config/chain'
import { FETCH_TIMEOUT } from '@/constants/query'
import { fetchWithTimeout } from '@/utils/fetch'
import { getUrl } from '@/utils/url'

export default async function getMarketsData(denom?: string, days: number = 30) {
  console.log(denom, days, 'denom, days')
  try {
    const marketParam = denom ? `&market=${denom}` : ''
    const url = getUrl(
      chainConfig.endpoints.amberBackend,
      `/redbank_markets_data?chain=neutron&days=${days}${marketParam}`,
    )
    const response = await fetchWithTimeout(url, FETCH_TIMEOUT)

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    return data
  } catch (error) {
    console.error('Could not fetch markets data.', error)
    return null
  }
}
