const chainConfig: ChainConfig = {
  name: 'neutron',
  id: 'neutron-1',

  contracts: {
    redBank: 'neutron1v8uzkvq3qhaw5qpt33mkdqmnrjjrn4vd4hc59e03k0rqtnwzq25q99rhcj',
    incentives: 'neutron17k0u7ahqjjpwu8qvdgkdduyv2rjxsws3edtxayp86h9y78spq5zsfh7tm0',
    oracle: 'neutron1k4e3z0tlt0nuxdeuypjy00extj5mxkh00j96qagl7ntx3wqj4l3qhd0jsn',
    params: 'neutron1yfw4jvd3ftfcm2mt5rzd8hvfksedmtyz2mkrdyxdquxkues7wmkswgcz4l',
    creditManager: 'neutron1scjuh29rzffqzhgxusjd56f7qnf7r9e6rwxym6n65h9d3kkhfrqs0xm4dn',
    accountNft: 'neutron15xh5qf4hs9zassj04mql5xxqgh4xr8ssmmqht5zmsw9l770qy8fs5u3dht',
    perps: 'neutron1eqwkxu3nxdx707at8r952eahjyealrky6vc0x57fmqry4t68qkpqw886cv',
    pyth: 'neutron1m2emc93m9gpwgsrsf2vylv9xvgqh654630v7dfrhrkmr5slly53spg85wv',
    swapper: 'neutron1ratz633muu96er3wn7kx5hzty8zdg5d8maqduykesun30ddcseeqceyhfl',
    dualitySwapper: 'neutron1sunrkm9482mn4dvtekk53ns6vvntkrhzh2n36qngyfphjn32t63qy7hp6s',
  },
  endpoints: {
    // Base URL for REST API
    restUrl: process.env.NEXT_PUBLIC_REST || 'https://rest-lb.neutron.org',
    // Base URL for RPC Node
    rpcUrl: process.env.NEXT_PUBLIC_RPC || 'https://rpc-lb.neutron.org',
    // Fallback RPC for Skip API
    fallbackRpc: 'https://neutron-rpc.cosmos-apis.com',
    routes: 'https://api.astroport.fi/api/v1/quote',
  },

  // Base64 encoded queries
  queries: {
    // Query for all asset parameters with a limit of 100
    allAssetParams: 'ewogICJhbGxfYXNzZXRfcGFyYW1zIjogewogICAgImxpbWl0IjogMTAwCiAgfQp9',
    allMarkets: 'ewoibWFya2V0c192MiI6IHsKImxpbWl0IjogMTAwCn0KfQ==',
  },
}

export default chainConfig
