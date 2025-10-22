import chainConfig from '@/config/chain'
import { FETCH_TIMEOUT } from '@/constants/query'
import { fetchWithTimeout } from '@/utils/common/fetch'
import { getUrl } from '@/utils/ui/url'

export default async function getAssetsTvl() {
  try {
    const url = getUrl(chainConfig.endpoints.redBank, '/redbank_assets_tvl?chain=neutron')
    const response = await fetchWithTimeout(url, FETCH_TIMEOUT)

    if (!response.ok) {
      return null
    }
    const data = await response.json()

    return data
  } catch (error) {
    console.error('Could not fetch assets tvl data.', error)
    return null
  }
}
