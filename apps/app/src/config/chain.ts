const chainConfig: ChainConfig = {
  name: 'neutron',
  id: 'neutron-1',

  constracts: {
    // Contract Addresses for Neutron
    paramsContract: 'neutron1yfw4jvd3ftfcm2mt5rzd8hvfksedmtyz2mkrdyxdquxkues7wmkswgcz4l',
    moneyMarketContract: 'neutron1v8uzkvq3qhaw5qpt33mkdqmnrjjrn4vd4hc59e03k0rqtnwzq25q99rhcj',
    oracleContract: 'neutron1k4e3z0tlt0nuxdeuypjy00extj5mxkh00j96qagl7ntx3wqj4l3qhd0jsn',
  },
  endpoints: {
    // Base URL for REST API
    restUrl: process.env.NEXT_PUBLIC_REST || 'https://rest-lb.neutron.org',
    // Base URL for RPC Node
    rpcUrl: process.env.NEXT_PUBLIC_RPC || 'https://rpc-lb.neutron.org',
  },

  // Base64 encoded queries
  queries: {
    // Query for all asset parameters with a limit of 100
    allAssetParams: 'ewogICJhbGxfYXNzZXRfcGFyYW1zIjogewogICAgImxpbWl0IjogMTAwCiAgfQp9',
    allMarkets: 'ewoibWFya2V0c192MiI6IHsKImxpbWl0IjogMTAwCn0KfQ==',
  },
}

export default chainConfig
