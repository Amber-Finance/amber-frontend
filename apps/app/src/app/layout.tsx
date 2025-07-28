import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import '@/app/globals.css'
import { Background } from '@/components/layout/Background'
import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'
import { CosmosKitProvider, SkipProvider } from '@/components/providers'
import { SWRProvider } from '@/components/providers/SWRProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { ThemedParticles } from '@/components/ui/ThemedParticles'

import { metaData } from './metadata'

export const metadata: Metadata = metaData.home

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' className='overflow-y-scroll no-scrollbar' suppressHydrationWarning>
      <head />
      <body
        className='antialiased overflow-x-hidden font-sans'
        style={{ overscrollBehavior: 'none' }}
      >
        <ThemeProvider defaultTheme='dark' storageKey='btc-outpost-theme'>
          <SWRProvider>
            <CosmosKitProvider>
              <SkipProvider>
                <main className='relative min-h-screen h-full w-full max-w-full overflow-x-hidden bg-background no-scrollbar'>
                  <Background />
                  <ThemedParticles
                    className='absolute inset-0 z-0'
                    quantity={100}
                    ease={70}
                    size={0.6}
                    staticity={30}
                    refresh={false}
                  />
                  <div className='relative z-10 w-full max-w-screen-2xl mx-auto px-2 sm:px-8 pt-16 sm:pt-20'>
                    <Navbar />
                    {children}
                  </div>
                  <Footer />

                  <ToastContainer
                    position='bottom-right'
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme='colored'
                  />
                  <Analytics />
                </main>
              </SkipProvider>
            </CosmosKitProvider>
          </SWRProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
