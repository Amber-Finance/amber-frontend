'use client'

import EarningsCard from '@/components/earn/EarningsCard'
import { useMarkets } from '@/hooks/useMarkets'
import { useStore } from '@/store/useStore'
import { convertAprToApy } from '@/utils/finance'
import { BigNumber } from 'bignumber.js'

export default function Home() {
  // Get market data
  useMarkets()
  const { markets } = useStore()

  // Process markets for display
  const processedMarkets =
    markets?.map((market) => {
      // Calculate APY from APR
      const apy = convertAprToApy(new BigNumber(market.metrics.liquidity_rate || '0').toString())

      return {
        asset: market.asset.symbol,
        icon: market.asset.icon,
        balance: 0, // Default balance for now
        apr: parseFloat(apy),
      }
    }) || []

  return (
    <div className='w-full px-0 lg:container lg:px-8 py-4 mx-auto'>
      <div className='w-full mt-12 flex flex-col gap-4'>
        {processedMarkets.length > 0 && (
          <>
            {/* First row - first 4 markets */}
            <div className='flex gap-6 justify-center items-center'>
              {processedMarkets.slice(0, 4).map((market) => (
                <EarningsCard
                  key={market.asset}
                  asset={market.asset}
                  icon={market.icon}
                  balance={market.balance}
                  apr={market.apr}
                />
              ))}
            </div>
            {/* Second row - remaining markets */}
            {processedMarkets.length > 4 && (
              <div className='flex gap-6 justify-center items-center'>
                {processedMarkets.slice(4, 8).map((market) => (
                  <EarningsCard
                    key={market.asset}
                    asset={market.asset}
                    icon={market.icon}
                    balance={market.balance}
                    apr={market.apr}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
