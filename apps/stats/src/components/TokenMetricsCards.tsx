'use client'

import { useMemo } from 'react'

import DistributionCard from '@/components/DistributionCard'
import FlipCard from '@/components/FlipCard'
import useAssetsTvl from '@/hooks/redBank/useAssetsTvl'
import { calculateUsdValueLegacy, formatNumber } from '@/utils/format'

interface TokenMetricsCardsProps {
  selectedToken: TokenInfo
  markets: Market[] | null
}

export default function TokenMetricsCards({ selectedToken, markets }: TokenMetricsCardsProps) {
  const { data: redBankAssetsTvl } = useAssetsTvl()
  const selectedMarket = markets?.find((market) => market.asset.denom === selectedToken.denom)

  const metrics = useMemo(() => {
    if (!selectedMarket || !redBankAssetsTvl) {
      return {
        utilizationRate: 0,
        deposited: 0,
        tvlShare: 0,
      }
    }

    const utilizationRate = parseFloat(selectedMarket.metrics.utilization_rate) * 100
    const depositedAmount = selectedMarket.metrics.collateral_total_amount
    const depositedUsd = selectedMarket.price?.price
      ? calculateUsdValueLegacy(
          depositedAmount,
          selectedMarket.price.price,
          selectedMarket.asset.decimals,
        )
      : 0

    const currentTokenTvlData = redBankAssetsTvl?.assets?.find(
      (asset: any) => asset.denom === selectedToken.denom,
    )
    const tvlShare = currentTokenTvlData?.tvl_share || 0

    return {
      utilizationRate,
      deposited: depositedUsd,
      depositedAmount,
      tvlShare,
    }
  }, [selectedMarket, redBankAssetsTvl, selectedToken.denom])

  return (
    <div className='flex justify-center sm:justify-end items-start gap-4'>
      <div className='flex flex-col gap-4 w-80'>
        <FlipCard
          title='UTILIZATION'
          subtitle='of available liquidity borrowed'
          value={
            <>
              {metrics.utilizationRate.toFixed(1)}
              <span style={{ color: selectedToken.brandColor }}>%</span>
            </>
          }
          backContent={
            <DistributionCard
              selectedTokenDenom={selectedToken.denom}
              markets={markets}
              type='utilization'
            />
          }
        />

        <FlipCard
          title='DEPOSITED'
          subtitle='total value deposited'
          value={
            <>
              <span style={{ color: selectedToken.brandColor }}>$</span>
              {formatNumber(0)(metrics.deposited)}
            </>
          }
          backContent={
            <DistributionCard
              selectedTokenDenom={selectedToken.denom}
              markets={markets}
              type='deposited'
            />
          }
        />

        <FlipCard
          title='TVL SHARE'
          subtitle='of total protocol TVL'
          value={
            <>
              {metrics.tvlShare.toFixed(1)}
              <span style={{ color: selectedToken.brandColor }}>%</span>
            </>
          }
          backContent={
            <DistributionCard
              selectedTokenDenom={selectedToken.denom}
              markets={markets}
              type='tvl'
              redBankAssetsTvl={redBankAssetsTvl}
            />
          }
        />
      </div>
    </div>
  )
}
