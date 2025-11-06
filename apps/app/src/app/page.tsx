'use client'

import { useMemo } from 'react'

import { BigNumber } from 'bignumber.js'

import DepositCard from '@/components/deposit/DepositCard'
import Hero from '@/components/layout/Hero'
import { AuroraText } from '@/components/ui/AuroraText'
import { useLstMarkets, useMarkets } from '@/hooks'
import type { LstMarketData } from '@/hooks/market/useLstMarkets'
import { useUserPositions } from '@/hooks/portfolio'
import useAssetsTvl from '@/hooks/redBank/useAssetsTvl'

const calculateTotalTvl = (redBankAssetsTvl: RedBankAssetsTvl): number | null => {
  if (!redBankAssetsTvl?.assets || redBankAssetsTvl.assets.length === 0) {
    return null
  }

  return redBankAssetsTvl.assets
    .reduce((total, asset) => {
      const assetTvl = new BigNumber(asset.tvl).shiftedBy(-6)
      return total.plus(assetTvl)
    }, new BigNumber(0))
    .toNumber()
}

// TEST: If you see this comment update in browser without refresh, HMR is working!
export default function Home() {
  useMarkets()
  useUserPositions()
  const { data: lstMarkets, isLoading } = useLstMarkets()
  const { data: redBankAssetsTvl, isLoading: isLoadingTvl } = useAssetsTvl()

  const sortedMarkets = useMemo((): LstMarketData[] => {
    if (!lstMarkets) return []

    return [...lstMarkets].sort((a: LstMarketData, b: LstMarketData) => {
      //deposits first
      const aHasDeposits = a.metrics.deposited > 0
      const bHasDeposits = b.metrics.deposited > 0

      if (aHasDeposits && !bHasDeposits) return -1
      if (!aHasDeposits && bHasDeposits) return 1

      //total apy highest to lowest
      return b.metrics.totalApy - a.metrics.totalApy
    })
  }, [lstMarkets])

  const totalValueLocked = useMemo(() => {
    // Return null if loading or if calculateTotalTvl returns null
    if (isLoadingTvl) return null
    return calculateTotalTvl(redBankAssetsTvl)
  }, [redBankAssetsTvl, isLoadingTvl])

  return (
    <>
      <Hero
        title='Liquid Staking.'
        subtitle={<AuroraText>Solid Yields.</AuroraText>}
        description='Bridge your Bitcoin Liquid Staking Tokens and earn maximum yield. Deposit supported assets to earn real yield.'
        stats={[
          {
            value: totalValueLocked,
            label: 'Total Value Locked',
            isCurrency: true,
            prefix: '$',
          },
        ]}
      />

      <div className='w-full pt-6 pb-2 px-4 sm:px-6 lg:px-8'>
        {sortedMarkets.length > 0 ? (
          <div
            className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-screen-2xl mx-auto justify-items-center'
            // style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
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
