import chains from '@/chains/rest.json'
import { createProxyHandler } from '@/utils/api'

export const runtime = 'edge'

const ALLOWED_CHAIN_IDS = new Set(['neutron-1', 'cosmoshub-4'])

export const dynamic = 'force-dynamic'

export default createProxyHandler('api', (chainID) => ({
  endpoint: ALLOWED_CHAIN_IDS.has(chainID)
    ? chains.find((chain) => chain.chainId === chainID)?.rest
    : undefined,
  isPrivate: false,
}))
