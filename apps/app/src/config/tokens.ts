import { MAXBTC_DENOM } from '@/constants/query'

const tokens: TokenInfo[] = [
  {
    chainId: 'neutron-1',
    denom: 'ibc/B7BF60BB54433071B49D586F54BD4DED5E20BEFBBA91958E87488A761115106B',
    symbol: 'LBTC',
    icon: '/images/LBTC.svg',
    description: 'Lombard Bitcoin',
    protocolIconLight: '/images/lombard/lombardIconOnly.svg',
    protocolIconDark: '/images/lombard/lombardIconOnlyDark.svg',
    decimals: 8,
    isLST: true,
    protocol: 'Lombard Finance',
    brandColor: '#22C55E', // Lombard green (vibrant green)
    origin: {
      chainId: '1',
      tokenAddress: '0x8236a87084f8b84306f72007f36f2618a5634494',
    },
    comingSoon: true,
  },
  {
    chainId: 'neutron-1',
    denom: 'ibc/C0F284F165E6152F6DDDA900537C1BC8DA1EA00F03B9C9EC1841FA7E004EF7A3',
    symbol: 'solvBTC',
    icon: '/images/solvBTC.svg',
    description: 'Solv Bitcoin',
    protocolIconLight: '/images/solv/solvLight.png',
    protocolIconDark: '/images/solv/solvDark.png',
    decimals: 18,
    isLST: true,
    protocol: 'Solv Protocol',
    brandColor: '#EAB308', // Solv yellow
    origin: {
      chainId: '1',
      tokenAddress: '0x7a56e1c57c7475ccf742a1832b028f0456652f97',
    },
    comingSoon: false,
  },
  {
    chainId: 'neutron-1',
    denom: 'ibc/E2A000FD3EDD91C9429B473995CE2C7C555BCC8CFC1D0A3D02F514392B7A80E8',
    symbol: 'eBTC',
    icon: '/images/eBTC.svg',
    description: 'Ether.fi Bitcoin',
    protocolIconLight: '/images/etherfiDark.svg',
    protocolIconDark: '/images/etherfi.svg',
    decimals: 8, // eBTC uses 8 decimals like other BTC tokens
    isLST: true,
    protocol: 'Ether.fi ',
    brandColor: '#6366F1', // Ether.fi blue
    origin: {
      chainId: '1',
      tokenAddress: '0x657e8c867d8b37dcc18fa4caead9c45eb088c642',
    },
    comingSoon: false,
  },
  {
    chainId: 'neutron-1',
    denom: 'ibc/3F1D988D9EEA19EB0F3950B4C19664218031D8BCE68CE7DE30F187D5ACEA0463',
    symbol: 'uniBTC',
    icon: '/images/uniBTC.svg',
    description: 'Bedrock Bitcoin',
    protocolIconLight: '/images/bedrock.svg',
    protocolIconDark: '/images/bedrock.svg',
    decimals: 8,
    isLST: true,
    protocol: 'Bedrock',
    brandColor: '#b45afa', // Bedrock purple (slightly different from Solv)
    origin: {
      chainId: '1',
      tokenAddress: '0x004e9c3ef86bc1ca1f0bb5c7662861ee93350568',
    },
    comingSoon: false,
  },
  {
    chainId: 'neutron-1',
    denom: MAXBTC_DENOM,
    symbol: 'maxBTC',
    icon: '/images/maxBTC.png',
    description: 'Structured Bitcoin',
    protocolIconLight: '/images/structured.svg',
    protocolIconDark: '/images/structured.svg',
    decimals: 8,
    isLST: true,
    protocol: 'Structured Finance',
    brandColor: '#F97316', // Bitcoin orange
    origin: {
      chainId: '1',
      tokenAddress: '0x0000000000000000000000000000000000000000', // Factory token on Neutron
    },
    comingSoon: false,
  },
  {
    chainId: 'neutron-1',
    denom: 'ibc/0E293A7622DC9A6439DB60E6D234B5AF446962E27CA3AB44D0590603DFF6968E',
    symbol: 'WBTC',
    icon: '/images/WBTC.svg',
    description: 'Wrapped Bitcoin (Eureka)',
    protocolIconLight: '/images/eureka/eurekaLight.svg',
    protocolIconDark: '/images/eureka/eurekaDark.svg',
    decimals: 8,
    isLST: true,
    protocol: 'Eureka',
    brandColor: '#F97316', // Eureka orange (classic Bitcoin orange)
    origin: {
      chainId: '1',
      tokenAddress: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    },
    comingSoon: false,
  },
  {
    chainId: 'neutron-1',
    denom: 'ibc/B559A80D62249C8AA07A380E2A2BEA6E5CA9A6F079C912C3A9E9B494105E4F81',
    symbol: 'USDC',
    icon: '/images/USDC.svg',
    description: 'USD Coin',
    protocolIconLight: '/images/USDC.svg',
    protocolIconDark: '/images/USDC.svg',
    decimals: 6,
    isLST: false,
    protocol: 'Circle',
    brandColor: '#2775CA', // USDC blue
    origin: {
      chainId: '1',
      tokenAddress: '0xA0b86a33E6441b8C4C8C0d4b0c8B8C8B8C8B8C8B',
    },
    comingSoon: false,
  },
  // {
  //   chainId: 'neutron-1',
  //   denom: 'ibc/2EB30350120BBAFC168F55D0E65551A27A724175E8FBCC7B37F9A71618FE136B',
  //   symbol: 'FBTC',
  //   icon: '/images/FBTC.svg',
  //   description: 'FBTC Ignition',
  //   protocolIconLight: '/images/fbtc.svg',
  //   protocolIconDark: '/images/fbtc.svg',
  //   decimals: 8,
  //   isLST: true,
  //   protocol: 'FBTC Ignition',
  //   brandColor: '#0066ff', // FBTC blue
  //   origin: {
  //     chainId: '1',
  //     tokenAddress: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
  //   },
  // },
]
export default tokens
