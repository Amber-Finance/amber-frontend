import { FETCH_TIMEOUT } from '@/constants/query'
import { fetchWithTimeout } from '@/utils/fetch'

export default async function getDenomData(denom: string, days: number = 30) {
  try {
    const url = `https://amberfi-backend.prod.mars-dev.net/v2/redbank_denom_data?chain=neutron&denom=${denom}&days=${days}`
    const response = await fetchWithTimeout(url, FETCH_TIMEOUT)

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    return data
  } catch (error) {
    console.error('Could not fetch red bank denom data.', error)
    return null
  }
}
