export default async function getRedBankAssetsTvl() {
  try {
    const url = 'https://amberfi-backend.prod.mars-dev.net/v2/redbank_assets_tvl?chain=neutron'
    const response = await fetch(url)

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
