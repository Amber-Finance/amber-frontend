import type { Metadata } from 'next'

import { Providers } from '@/app/providers'
import { Background } from '@/components/layout/Background'
import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'
import { ThemedParticles } from '@/components/ui/ThemedParticles'

import '../styles/globals.css'
import { metadata as defaultMetadata } from './metadata'

export const metadata: Metadata = defaultMetadata

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className='no-scrollbar overflow-y-scroll dark' suppressHydrationWarning>
      <body
        className='overflow-x-hidden font-sans antialiased'
        style={{ overscrollBehavior: 'none' }}
      >
        <Providers>
          <div className='no-scrollbar relative flex min-h-screen w-full max-w-full flex-col overflow-x-hidden bg-background'>
            <Background />
            <ThemedParticles
              className='absolute inset-0 z-0'
              quantity={100}
              ease={70}
              size={0.6}
              staticity={30}
              refresh={false}
            />
            <main className='relative z-10 mx-auto w-full max-w-screen-2xl flex-1 px-2 pt-16 sm:px-8 sm:pt-20'>
              <Navbar />
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
