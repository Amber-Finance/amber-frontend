import { Navbar } from '@/components/layout/Navbar'
import { CosmosKitProvider } from '@/components/providers/CosmosKitProvider'
import { SWRProvider } from '@/components/providers/SWRProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Space_Mono } from 'next/font/google'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import '@/app/globals.css'
import { Background } from '@/components/layout/Background'
import { Particles } from '@/components/ui/Particles'

const spaceMono = Space_Mono({
  variable: '--font-space-mono',
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Bitcoin Outpost - powered by Mars Protocol',
  description: 'Lend and borrow Bitcoin Derivatives on Neutron.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang='en'
      className='overflow-y-scroll no-scrollbar'
      suppressHydrationWarning
    >
      <head />
      <body
        className={`${spaceMono.variable} antialiased overflow-x-hidden font-mono`}
        style={{ overscrollBehavior: 'none' }}
      >
        <ThemeProvider defaultTheme='dark' storageKey='btc-outpost-theme'>
          <SWRProvider>
            <CosmosKitProvider>
              <main className='relative min-h-screen h-full w-full max-w-full overflow-x-hidden bg-background no-scrollbar'>
                <Background />
                <Particles
                  className='absolute inset-0 z-0'
                  quantity={150}
                  ease={70}
                  color='#f7931a'
                  size={0.6}
                  staticity={30}
                  refresh={false}
                />
                <div className='relative z-10 w-full max-w-screen-2xl mx-auto w'>
                  <Navbar />
                  {children}
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
                  theme='colored'
                />
                <Analytics />
              </main>
            </CosmosKitProvider>
          </SWRProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
