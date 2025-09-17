import { StrategyCard } from '@/app/strategies/StrategyCard'

interface StrategiesContentProps {
  marketsLoading: boolean
  marketsError: any
  strategies: StrategyData[]
}

export const StrategiesContent = ({
  marketsLoading,
  marketsError,
  strategies,
}: StrategiesContentProps) => {
  if (marketsLoading) {
    return (
      <div className='text-center py-12'>
        <div className='max-w-md mx-auto space-y-3'>
          <div className='w-12 h-12 mx-auto bg-muted/20 rounded-full flex items-center justify-center'>
            <div className='w-6 h-6 bg-muted/40 rounded-full animate-pulse' />
          </div>
          <h3 className='text-base font-semibold text-foreground'>Loading Strategies...</h3>
          <p className='text-sm text-muted-foreground'>
            Fetching market data to generate looping strategies...
          </p>
        </div>
      </div>
    )
  }

  if (marketsError) {
    return (
      <div className='text-center py-12'>
        <div className='max-w-md mx-auto space-y-3'>
          <div className='w-12 h-12 mx-auto bg-red-500/20 rounded-full flex items-center justify-center'>
            <div className='w-6 h-6 bg-red-500/40 rounded-full' />
          </div>
          <h3 className='text-base font-semibold text-red-500'>Error Loading Strategies</h3>
          <p className='text-sm text-muted-foreground'>
            Failed to fetch market data: {marketsError.message}
          </p>
        </div>
      </div>
    )
  }

  if (strategies.length > 0) {
    return (
      <div
        className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-screen-2xl mx-auto justify-items-center'
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}
      >
        {strategies.map((strategy) => (
          <StrategyCard key={strategy.id} strategy={strategy as Strategy} />
        ))}
      </div>
    )
  }

  return (
    <div className='text-center py-12'>
      <div className='max-w-md mx-auto space-y-3'>
        <div className='w-12 h-12 mx-auto bg-muted/20 rounded-full flex items-center justify-center'>
          <div className='w-6 h-6 bg-muted/40 rounded-full' />
        </div>
        <h3 className='text-base font-semibold text-foreground'>No Strategies Available</h3>
        <p className='text-sm text-muted-foreground'>
          No looping strategies available with current market data.
        </p>
      </div>
    </div>
  )
}
