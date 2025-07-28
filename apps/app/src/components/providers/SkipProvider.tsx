'use client'

import { useEffect } from 'react'

import { setClientOptions } from '@skip-go/client'

import chainConfig from '@/config/chain'

export function SkipProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    setClientOptions({
      apiUrl: 'https://api.skip.build',
      endpointOptions: {
        [chainConfig.id]: {
          rpc: chainConfig.endpoints.rpcUrl,
          rest: chainConfig.endpoints.restUrl,
        },
      },
      cacheDurationMs: 30000,
    })
  }, [])

  return <>{children}</>
}
