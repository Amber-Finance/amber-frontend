import { FETCH_TIMEOUT } from '@/constants/query'
import { fetchWithTimeout } from '@/utils/fetch'

export default async function getAssetsTvl() {
  try {
    const url = 'https://amberfi-backend.prod.mars-dev.net/v2/redbank_assets_tvl?chain=neutron'
    const response = await fetchWithTimeout(url, FETCH_TIMEOUT)

    if (!response.ok) {
      return null
    }
    const data = await response.json()

    return data
  } catch (error) {
    console.error('Could not fetch red bank tvl data.', error)
    return null
  }
}
