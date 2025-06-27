'use client'

import DepositCard from '@/components/earn/DepositCard'
import Hero from '@/components/layout/Hero'
import { useMarkets, useLstMarkets } from '@/hooks'

export default function Home() {
  // Get market data
  useMarkets()
  const lstMarkets = useLstMarkets()

  return (
    <>
      {/* Hero Section with Market Data */}
      <Hero markets={lstMarkets} />

      <div className='w-full max-w-full mx-auto px-3 sm:px-5 lg:px-6 pt-16 pb-2'>
        <div className='space-y-8'>
          {/* LST Cards Grid */}
          {lstMarkets.length > 0 ? (
            <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-5 justify-items-center'>
              {lstMarkets.map((item) => (
                <DepositCard key={item.token.symbol} token={item.token} metrics={item.metrics} />
              ))}
            </div>
          ) : (
            <div className='text-center py-12'>
              <div className='max-w-md mx-auto space-y-3'>
                <div className='w-12 h-12 mx-auto bg-muted/20 rounded-full flex items-center justify-center'>
                  <div className='w-6 h-6 bg-muted/40 rounded-full animate-pulse' />
                </div>
                <h3 className='text-base font-semibold text-foreground'>Loading Yield Opportunities</h3>
                <p className='text-sm text-muted-foreground'>
                  Fetching the latest Bitcoin yield farming opportunities...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
