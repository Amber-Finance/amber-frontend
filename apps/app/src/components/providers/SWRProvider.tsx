'use client'

import { SWRConfig } from 'swr'

import { debugSWR } from '@/utils/common/middleware'

export const SWRProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SWRConfig
      value={{
        use: [debugSWR],
      }}
    >
      {children}
    </SWRConfig>
  )
}
