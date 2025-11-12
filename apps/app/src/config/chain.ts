const chainConfig: ChainConfig = {
  name: 'neutron',
  id: 'neutron-1',
  swapFee: 0.005,
  contracts: {
    redBank: 'neutron1k8xyccg9nvfavagqjsqngh66w4z286utqweswl4txtnewaymkc9ss5f5e8',
    incentives: 'neutron1u9eg2njpcvdprtes8s78hwddayrxzgw9akkjpxx0umr0awvapxrshmjlsd',
    oracle: 'neutron18l6cfm34qng2h9cvl3mxfw9zck9j5awv9jen4sa4f67x6t98y47s9vmuye',
    params: 'neutron1y2hjwse8sq77gvsmcy8gm6kjye6a3g9ksyxdjg99ceg3rmlpq5usyv5n07',
    creditManager: 'neutron1et4xza4pge3asumk8yxdx6qm85k9eplk0kathtkheln6znxsqheqfytsza',
    accountNft: 'neutron1nl8d943u3k8lext62c2vplsmpr257zmfdd2mwvegc77xfjy5w0qq5zqc6e',
    perps: 'neutron1eqwkxu3nxdx707at8r952eahjyealrky6vc0x57fmqry4t68qkpqw886cv',
    pyth: 'neutron1m2emc93m9gpwgsrsf2vylv9xvgqh654630v7dfrhrkmr5slly53spg85wv',
    swapper: 'neutron1ratz633muu96er3wn7kx5hzty8zdg5d8maqduykesun30ddcseeqceyhfl',
    dualitySwapper: 'neutron1ltg4s9hfm7ta55nwclvgr8vhu6hwmqjs2q6luu9l3pt0g79whv6skg02jp',
    structuredPoints: 'neutron1ng8zg06s64g6k3hecp2wejuqxxanlf7z88q0nawqdrrq07j2wwtsuhnjsq',
  },
  endpoints: {
    // Base URL for REST API
    restUrl: process.env.NEXT_PUBLIC_REST || 'https://rest-lb.neutron.org',
    // Base URL for RPC Node
    rpcUrl: process.env.NEXT_PUBLIC_RPC || 'https://rpc-lb.neutron.org',
    // Fallback RPC endpoints for better reliability
    fallbackRpcs: [
      'https://neutron-rpc.cosmos-apis.com',
      'https://neutron-rpc.publicnode.com',
      'https://rpc-neutron.ecostake.com',
      'https://neutron-rpc.validatorwallet.net',
      'https://neutron-rpc.kingnodes.com',
      'https://rpc.neutron.validatrium.club',
      'https://neutron-rpc.lavenderfive.com',
    ],
    amberBackend: 'https://amberfi-backend.prod.mars-dev.net/v2',
  },

  // Base64 encoded queries
  queries: {
    // Query for all asset parameters with a limit of 100
    allAssetParams: 'ewogICJhbGxfYXNzZXRfcGFyYW1zIjogewogICAgImxpbWl0IjogMTAwCiAgfQp9',
    allMarkets: 'ewoibWFya2V0c192MiI6IHsKImxpbWl0IjogMTAwCn0KfQ==',
    allCoinBalances:
      'eyJhbGxfY29pbl9iYWxhbmNlcyI6IHsibGltaXQiOiAxMDAwLCAic3RhcnRfYWZ0ZXIiOiBudWxsfX0K',
  },
}

export default chainConfig
