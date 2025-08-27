const chainConfig = {
  name: 'neutron',
  chainId: 'neutron-1',
  rpc: 'https://rpc.neutron-1.neutron.org',
  rest: 'https://api.neutron-1.neutron.org',
  bip44: {
    coinType: 118,
  },
  bech32Config: {
    bech32PrefixAccAddr: 'neutron',
    bech32PrefixAccPub: 'neutronpub',
    bech32PrefixValAddr: 'neutronvaloper',
    bech32PrefixValPub: 'neutronvaloperpub',
    bech32PrefixConsAddr: 'neutronvalcons',
    bech32PrefixConsPub: 'neutronvalconspub',
  },
  currencies: [
    {
      coinDenom: 'NTRN',
      coinMinimalDenom: 'untrn',
      coinDecimals: 6,
      coinGeckoId: 'neutron',
    },
  ],
  feeCurrencies: [
    {
      coinDenom: 'NTRN',
      coinMinimalDenom: 'untrn',
      coinDecimals: 6,
      coinGeckoId: 'neutron',
    },
  ],
  stakeCurrency: {
    coinDenom: 'NTRN',
    coinMinimalDenom: 'untrn',
    coinDecimals: 6,
    coinGeckoId: 'neutron',
  },
  gasPriceStep: {
    low: 0.01,
    average: 0.025,
    high: 0.04,
  },
}

export default chainConfig
