import { PageConfig } from 'next'

import chains from '@/chains/rest.json'
import { createProxyHandler } from '@/utils/api'

const ALLOWED_CHAIN_IDS = new Set(['neutron-1', 'cosmoshub-4'])

export const config: PageConfig = {
  api: {
    externalResolver: true,
    bodyParser: false,
  },
  runtime: 'edge',
}

export default createProxyHandler('api', (chainID) => ({
  endpoint: ALLOWED_CHAIN_IDS.has(chainID)
    ? chains.find((chain) => chain.chainId === chainID)?.rest
    : undefined,
  isPrivate: false,
}))
