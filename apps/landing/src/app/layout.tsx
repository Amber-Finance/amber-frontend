import { ReactNode } from 'react'

import type { Metadata } from 'next'

import '@/app/globals.css'

import { Background } from '../components/Background'

export const metadata: Metadata = {
  title: 'Amber Finance',
  metadataBase: new URL('https:/amberfi.io'),
  description:
    'Bridge your liquid staking tokens and earn maximum yield. Preserve Value. Generate Wealth.',
  openGraph: {
    type: 'website',
    url: 'https://amberfi.io',
    title: 'Amber Finance',
    locale: 'en_US',
    description:
      'Bridge your liquid staking tokens and earn maximum yield. Preserve Value. Generate Wealth.',
    siteName: 'Amber',
    images: [
      {
        url: 'https://amberfi.io/banner.png',
        width: 1280,
        height: 720,
        alt: 'Amber Finance',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@amberfi_io',
    title: 'Amber Finance',
    description:
      'Bridge your liquid staking tokens and earn maximum yield. Preserve Value. Generate Wealth.',
    images: [
      {
        url: 'https://amberfi.io/banner.png',
        width: 1280,
        height: 720,
        alt: 'Amber Finance',
      },
    ],
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en' className='dark'>
      <body className='font-sans'>
        <main className='relative min-h-screen h-full w-full max-w-full overflow-x-hidden bg-background no-scrollbar'>
          <Background />
          {children}
        </main>
      </body>
    </html>
  )
}
