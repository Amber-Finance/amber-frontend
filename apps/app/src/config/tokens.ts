const tokens = [
  {
    chainId: 'neutron-1',
    denom: 'untrn',
    symbol: 'FBTC',
    icon: 'https://bitcoin-outpost-fe.vercel.app/images/FBTC.svg',
    description: 'FBTC Ignition',
    decimals: 8,
    isLST: true,
    stakingApy: 0,
    protocol: 'Fire Protocol',
    brandColor: '#FF6B35', // Fire orange (warmer, more vibrant)
  },
  {
    chainId: 'neutron-1',
    denom: 'ibc/2EB30350120BBAFC168F55D0E65551A27A724175E8FBCC7B37F9A71618FE136B',
    symbol: 'LBTC',
    icon: 'https://bitcoin-outpost-fe.vercel.app/images/LBTC.svg',
    description: 'Lombard Bitcoin',
    decimals: 8,
    isLST: true,
    stakingApy: 4.2,
    protocol: 'Lombard Finance',
    brandColor: '#22C55E', // Lombard green (vibrant green)
  },
  {
    chainId: 'neutron-1',
    denom: 'ibc/B7BF60BB54433071B49D586F54BD4DED5E20BEFBBA91958E87488A761115106B',
    symbol: 'solvBTC',
    icon: 'https://bitcoin-outpost-fe.vercel.app/images/solvBTC.svg',
    description: 'Solv Bitcoin',
    decimals: 8,
    isLST: true,
    stakingApy: 3.8,
    protocol: 'Solv Protocol',
    brandColor: '#8B5CF6', // Solv purple/violet
  },
  {
    chainId: 'neutron-1',
    denom: 'ibc/C0F284F165E6152F6DDDA900537C1BC8DA1EA00F03B9C9EC1841FA7E004EF7A3',
    symbol: 'eBTC',
    icon: 'https://bitcoin-outpost-fe.vercel.app/images/eBTC.png',
    description: 'Edge Bitcoin',
    decimals: 8,
    isLST: true,
    stakingApy: 0,
    protocol: 'Edge Protocol',
    brandColor: '#06B6D4', // Edge cyan/blue
  },
  {
    chainId: 'neutron-1',
    denom: 'ibc/6F8F0E9D472BF053261F2DEBE521801B703372777F3923B48DAE55D4F1212B5F',
    symbol: 'pumpBTC',
    icon: 'https://bitcoin-outpost-fe.vercel.app/images/pumpBTC.svg',
    description: 'Pump Bitcoin',
    decimals: 8,
    isLST: true,
    stakingApy: 0,
    protocol: 'Pump Protocol',
    brandColor: '#F59E0B', // Pump amber/gold
  },
  {
    chainId: 'neutron-1',
    denom: 'ibc/3F1D988D9EEA19EB0F3950B4C19664218031D8BCE68CE7DE30F187D5ACEA0463',
    symbol: 'uniBTC',
    icon: 'https://bitcoin-outpost-fe.vercel.app/images/uniBTC.svg',
    description: 'Bedrock Bitcoin',
    decimals: 8,
    isLST: true,
    stakingApy: 4.5,
    protocol: 'Bedrock',
    brandColor: '#A855F7', // Bedrock purple (slightly different from Solv)
  },
  {
    chainId: 'neutron-1',
    denom: 'ibc/0E293A7622DC9A6439DB60E6D234B5AF446962E27CA3AB44D0590603DFF6968E',
    symbol: 'wBTC',
    icon: 'https://bitcoin-outpost-fe.vercel.app/images/WBTC.svg',
    description: 'Wrapped Bitcoin (Eureka)',
    decimals: 8,
    isLST: true,
    stakingApy: 0,
    protocol: 'Eureka',
    brandColor: '#F97316', // Eureka orange (classic Bitcoin orange)
  },
  {
    chainId: 'neutron-1',
    denom: 'ibc/DF8722298D192AAB85D86D0462E8166234A6A9A572DD4A2EA7996029DF4DB363',
    symbol: 'wBTC.axl',
    icon: 'https://bitcoin-outpost-fe.vercel.app/images/WBTC.axl.svg',
    description: 'Wrapped Bitcoin Axelar',
    decimals: 8,
    isLST: true,
    stakingApy: 0,
    protocol: 'Axelar',
    brandColor: '#3B82F6', // Axelar blue (classic blue)
  },
]

export default tokens
