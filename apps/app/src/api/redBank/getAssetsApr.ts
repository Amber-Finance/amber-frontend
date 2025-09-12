import chainConfig from '@/config/chain'
import { FETCH_TIMEOUT } from '@/constants/query'
import { fetchWithTimeout } from '@/utils/fetch'
import { getUrl } from '@/utils/url'

export default async function getAssetsApr(denom: string, days: number = 30) {
  try {
    const url = getUrl(
      chainConfig.endpoints.redBank,
      `/rb_asset_apr?chain=neutron&granularity=day&unit=${days}&denom=${denom}`,
    )
    const response = await fetchWithTimeout(url, FETCH_TIMEOUT)

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    return data
  } catch (error) {
    console.error('Could not fetch assets apr data.', error)
    return null
  }
}
