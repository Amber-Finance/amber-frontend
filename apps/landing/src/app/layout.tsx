import { ReactNode } from 'react'

import type { Metadata } from 'next'

import '@/app/globals.css'

import { Background } from '../components/Background'
import { Footer } from '../components/layout/Footer'

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
        url: 'https://amberfi.io/twitter-banner/default.jpg',
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
        url: 'https://amberfi.io/twitter-banner/default.jpg',
        width: 1280,
        height: 720,
        alt: 'Amber Finance',
      },
    ],
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en' className='dark h-full prevent-overscroll'>
      <body className='font-sans h-full overflow-x-hidden prevent-overscroll'>
        <div className='relative min-h-full h-full w-full max-w-full bg-background overflow-x-hidden flex flex-col prevent-overscroll'>
          <main className='relative flex-1 w-full no-scrollbar'>
            <Background />
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
