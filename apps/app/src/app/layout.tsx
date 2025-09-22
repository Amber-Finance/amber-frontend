import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import '@/app/globals.css'
import { metaData } from '@/app/metadata'
import { Background } from '@/components/layout/Background'
import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'
import { TermsModalProvider } from '@/components/modals/TermsModalProvider'
import { CosmosKitProvider, SkipProvider } from '@/components/providers'
import { SWRProvider } from '@/components/providers/SWRProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { ThemedParticles } from '@/components/ui/ThemedParticles'

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
        // style={{ overscrollBehavior: 'none' }}
      >
        <ThemeProvider defaultTheme='dark' storageKey='amberfi-theme'>
          <SWRProvider>
            <CosmosKitProvider>
              <SkipProvider>
                <TermsModalProvider>
                  <div className='relative flex flex-col w-full h-full max-w-full overflow-x-hidden no-scrollbar bg-background'>
                    <Background />

                    <ThemedParticles
                      className='fixed inset-0 z-[1]'
                      quantity={100}
                      ease={70}
                      size={0.6}
                      staticity={30}
                      refresh={false}
                    />
                    <div className='relative z-10 flex-1 flex flex-col'>
                      <Navbar />
                      <main className='flex-1 w-full max-w-screen-2xl min-h-screen mx-auto px-2 sm:px-8 py-16 sm:pt-20'>
                        {/* <div className='fixed w-screen h-screen inset-0 bg-background/90 pointer-events-none z-[-2]' /> */}

                        {children}
                      </main>
                      <Footer />
                    </div>

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
                      theme='dark'
                      toastClassName='!bg-card/95 !text-foreground !border !border-border/50 !shadow-xl !rounded-xl !backdrop-blur-sm'
                      progressClassName='!bg-gradient-to-r !from-gradient-start !to-gradient-end'
                      style={{
                        fontFamily: 'var(--font-space-mono), monospace',
                      }}
                    />
                    <Analytics />
                  </div>
                </TermsModalProvider>
              </SkipProvider>
            </CosmosKitProvider>
          </SWRProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
