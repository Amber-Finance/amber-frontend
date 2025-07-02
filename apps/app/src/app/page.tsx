'use client'

import DepositCard from '@/components/deposit/DepositCard'
import Hero from '@/components/layout/Hero'
import { useLstMarkets, useMarkets } from '@/hooks'

export default function Home() {
  useMarkets()
  const { data: lstMarkets, isLoading } = useLstMarkets()

  return (
    <>
      <Hero markets={lstMarkets} />

      <div className='w-full pt-6 pb-2'>
        {lstMarkets.length > 0 ? (
          <div className='flex flex-wrap gap-4 justify-center'>
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
              <h3 className='text-base font-bold text-foreground'>
                {isLoading ? 'Loading Yield Opportunities' : 'No Yield Opportunities Available'}
              </h3>
              <p className='text-sm text-muted-foreground'>
                {isLoading
                  ? 'Fetching the latest Bitcoin yield farming opportunities...'
                  : 'Please check back later for available opportunities.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
