import { ReactNode } from 'react'

import type { Metadata } from 'next'

import '@/app/globals.css'
import RunningLogo from '@/components/RunningLogo'

export const metadata: Metadata = {
  title: 'Amber Finance - Landing',
  description: 'Amber Finance Landing Page',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en'>
      <body className='font-sans'>
        <RunningLogo />
        {children}
      </body>
    </html>
  )
}
