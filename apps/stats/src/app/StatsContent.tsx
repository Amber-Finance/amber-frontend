'use client'

import { useMemo } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { BigNumber } from 'bignumber.js'

import TokenIconsRow from '@/components/TokenIconsRow'
import TokenMetricsCards from '@/components/TokenMetricsCards'
import CombinedChartsWithTabs from '@/components/charts/CombinedChartsWithTabs'
import TokenApyLineChart from '@/components/charts/TokenApyLineChart'
import TokenDepositBorrowChart from '@/components/charts/TokenDepositBorrowChart'
import TokenPriceLineChart from '@/components/charts/TokenPriceLineChart'
import Hero from '@/components/layout/Hero'
import { AuroraText } from '@/components/ui/AuroraText'
import tokens from '@/config/tokens'
import useAssetsTvl from '@/hooks/redBank/useAssetsTvl'
import { useMarkets } from '@/hooks/useMarkets'
import { useStore } from '@/store/useStore'

const calculateTotalTvl = (redBankAssetsTvl: RedBankAssetsTvl | null) => {
  if (!redBankAssetsTvl?.assets || redBankAssetsTvl.assets.length === 0) {
    return 0
  }
  return redBankAssetsTvl.assets
    .reduce((total, asset) => {
      const assetTvl = new BigNumber(asset.tvl).shiftedBy(-6)
      return total.plus(assetTvl)
    }, new BigNumber(0))
    .toNumber()
}

export default function StatsContent() {
  useMarkets()
  const { markets } = useStore()
  const { data: redBankAssetsTvl } = useAssetsTvl()
  const searchParams = useSearchParams()
  const router = useRouter()

  // Get selected token from URL params, default to first token
  const selectedTokenSymbol = searchParams.get('token') || tokens[5]?.symbol || 'WBTC'
  const selectedToken = tokens.find((token) => token.symbol === selectedTokenSymbol) || tokens[0]

  const handleTokenSelect = (tokenSymbol: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('token', tokenSymbol)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const totalValueLocked = useMemo(() => calculateTotalTvl(redBankAssetsTvl), [redBankAssetsTvl])

  return (
    <div className='space-y-8'>
      <Hero
        title='Stats'
        subtitle={<AuroraText>Dashboard</AuroraText>}
        description='Analytics and monitoring dashboard of Amber Finance.'
        stats={[
          {
            value: totalValueLocked,
            label: 'Total Value Locked',
            isCurrency: true,
            prefix: '$ ',
          },
        ]}
      />
      <CombinedChartsWithTabs />
      <TokenIconsRow selectedToken={selectedToken} onTokenSelect={handleTokenSelect} />
      <div className='flex flex-col sm:flex-row gap-4 mb-8'>
        <TokenApyLineChart selectedToken={selectedToken} />
        <TokenMetricsCards selectedToken={selectedToken} markets={markets} />
      </div>
      <div className='flex flex-col lg:flex-row gap-4 mb-8'>
        <TokenPriceLineChart selectedToken={selectedToken} />
        <TokenDepositBorrowChart selectedToken={selectedToken} />
      </div>
    </div>
  )
}
