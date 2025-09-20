import { Analytics } from '@vercel/analytics/next'

import '@/app/globals.css'
// import type { Metadata } from 'next'

import { Background } from '@/components/layout/Background'
import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { ThemedParticles } from '@/components/ui/ThemedParticles'

// export const metadata: Metadata = defaultMetadata

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className='no-scrollbar overflow-y-scroll dark' suppressHydrationWarning>
      <body className='overflow-x-hidden font-sans antialiased'>
        <ThemeProvider defaultTheme='dark' storageKey='amberfi-theme'>
          <div className='no-scrollbar relative flex w-full h-full max-w-full flex-col overflow-x-hidden bg-background'>
            <Background />
            <ThemedParticles
              className='absolute inset-0 z-0'
              quantity={100}
              ease={70}
              size={0.6}
              staticity={30}
              refresh={false}
            />
            <div className='relative z-10 flex-1 flex flex-col'>
              <main className='flex-1 mx-auto w-full max-w-screen-xl px-2 pt-16 sm:pt-20'>
                <Navbar />
                {children}
              </main>
              <Footer />
            </div>
          </div>
        </ThemeProvider>

        <Analytics />
      </body>
    </html>
  )
}
