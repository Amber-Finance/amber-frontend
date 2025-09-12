import chainConfig from '@/config/chain'
import { FETCH_TIMEOUT } from '@/constants/query'
import { fetchWithTimeout } from '@/utils/fetch'
import { getUrl } from '@/utils/url'

export default async function getDenomData(denom: string, days: number = 30) {
  try {
    const url = getUrl(
      chainConfig.endpoints.redBank,
      `/redbank_denom_data?chain=neutron&denom=${denom}&days=${days}`,
    )

    const response = await fetchWithTimeout(url, FETCH_TIMEOUT)

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    return data
  } catch (error) {
    console.error('Could not fetch denom data.', error)
    return null
  }
}
