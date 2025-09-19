'use client'

import React from 'react'

import { ThemeProvider } from '@/components/providers/ThemeProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme='dark' storageKey='amberfi-theme'>
      {children}
    </ThemeProvider>
  )
}
