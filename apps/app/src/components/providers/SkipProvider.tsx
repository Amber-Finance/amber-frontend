'use client'

import { useEffect } from 'react'

import { setApiOptions } from '@skip-go/client'

export function SkipProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    setApiOptions({
      apiUrl: 'https://api.skip.build',
    })
  }, [])

  return <>{children}</>
}
