import { ReactNode } from 'react'

import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from 'next-themes'
import { Layout, Navbar } from 'nextra-theme-docs'
import 'nextra-theme-docs/style.css'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'

import { LaunchAppButton } from '@/components/LaunchAppButton'
import Logo from '@/components/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Background } from '@/components/ui/Background'
import { ThemedParticles } from '@/components/ui/ThemedParticles'
import { CollaborativeEditingProvider } from '@/contexts/CollaborativeEditingContext'

import './globals.css'

export default async function RootLayout({ children }: { children: ReactNode }) {
  const navbar = (
    <Navbar logo={<Logo />} projectLink='https://github.com/amber-finance'>
      <div className='flex items-center gap-3'>
        <ThemeToggle />
        <LaunchAppButton />
      </div>
    </Navbar>
  )

  return (
    <html lang='en' suppressHydrationWarning>
      <Head
        backgroundColor={{
          dark: 'rgb(10, 10, 10)',
          light: 'rgb(255, 248, 240)',
        }}
        color={{
          hue: { dark: 25, light: 25 },
          saturation: { dark: 100, light: 100 },
        }}
      >
        <meta name='msapplication-TileColor' content='#000000' />
        <meta name='theme-color' content='#000000' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        <meta httpEquiv='Content-Language' content='en' />
        <meta name='apple-mobile-web-app-title' content='Amber Docs' />
        <link rel='icon' href='/favicon.ico' type='image/x-icon' />
        <link rel='icon' href='/favicon.svg' type='image/svg+xml' />
        <link rel='apple-touch-icon' href='/apple-touch-icon.png' />
        <link rel='manifest' href='/manifest.json' />
        <meta property='og:site_name' content='Amber Finance | Docs' />
        <meta property='og:locale' content='en_US' />
        <meta property='og:url' content='https://docs.amberfi.io' />
        <meta property='og:image' content='https://docs.amberfi.io/x-banner/docs.jpg' />
        <meta property='og:image:width' content='1280' />
        <meta property='og:image:height' content='720' />
        <meta property='og:image:alt' content='Amber Finance Documentation' />
        <meta name='twitter:image' content='https://docs.amberfi.io/x-banner/docs.jpg' />
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:url' content='https://docs.amberfi.io' />
        <meta name='twitter:creator' content='@amberfi_io' />
        <meta name='twitter:site' content='@amberfi_io' />
      </Head>
      <body>
        <ThemeProvider attribute='class' defaultTheme='dark' enableSystem disableTransitionOnChange>
          <CollaborativeEditingProvider>
            <div className='relative min-h-screen w-full'>
              <Background />
              <ThemedParticles
                className='absolute inset-0 z-0'
                quantity={100}
                ease={70}
                size={0.6}
                staticity={30}
                refresh={false}
              />
              <div className='relative z-10'>
                <Layout
                  navbar={navbar}
                  pageMap={await getPageMap()}
                  docsRepositoryBase='https://github.com/amber-finance/amber-frontend'
                  editLink='Edit this page on GitHub'
                  feedback={{ content: 'Question? Give us feedback →' }}
                  darkMode={false}
                  sidebar={{
                    defaultMenuCollapseLevel: 1,
                    toggleButton: false,
                  }}
                >
                  {children}
                </Layout>
              </div>
            </div>
            <Analytics />
          </CollaborativeEditingProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
