import chainConfig from '@/config/chain'
import { FETCH_TIMEOUT, MAXBTC_DENOM } from '@/constants/query'
import { fetchWithTimeout } from '@/utils/fetch'
import { getUrl } from '@/utils/url'

export default async function getMaxBtcDeposits(days: number = 5) {
  try {
    const url = getUrl(
      chainConfig.endpoints.amberBackend,
      `/cm_deposits?chain=neutron&denom=${MAXBTC_DENOM}&days=${days}`,
    )
    const response = await fetchWithTimeout(url, FETCH_TIMEOUT)

    if (!response.ok) {
      return null
    }
    const data = await response.json()

    return data
  } catch (error) {
    console.error('Could not fetch assets maxBTC deposits data.', error)
    return null
  }
}
