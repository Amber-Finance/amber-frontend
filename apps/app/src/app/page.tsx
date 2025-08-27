'use client'

import Hero from '@/components/layout/Hero'
import { AuroraText } from '@/components/ui/AuroraText'
import { ComingSoonOverlay } from '@/components/ui/ComingSoonOverlay'

export default function Home() {
  return (
    <>
      <Hero
        title='Liquid Staking.'
        subtitle={<AuroraText>Solid Yields.</AuroraText>}
        description='Bridge your liquid staking tokens and earn maximum yield. Deposit supported assets to earn real yield.'
        stats={[
          {
            value: 0,
            label: 'Total TVL',
            isCurrency: true,
            prefix: '$',
          },
        ]}
      />

      <div className='w-full pt-6 pb-2 px-4 sm:px-6 lg:px-8'>
        {sortedMarkets.length > 0 ? (
          <div
            className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-screen-2xl mx-auto justify-items-center'
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}
          >
            {sortedMarkets.map((item) => (
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
