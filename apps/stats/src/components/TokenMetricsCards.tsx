'use client'

import { useMemo } from 'react'

import FlipCard from '@/components/FlipCard'
import FlipCardBackContent from '@/components/FlipCardBackContent'
import { MAXBTC_DENOM } from '@/constants/query'
import useAssetsTvl from '@/hooks/redBank/useAssetsTvl'
import useMaxBtcData from '@/hooks/useMaxBtcData'
import { calculateUsdValueLegacy, formatNumber } from '@/utils/format'

interface Props {
  selectedToken: TokenInfo
  markets: Market[] | null
}

export default function TokenMetricsCards({ selectedToken, markets }: Props) {
  const { data: redBankAssetsTvl } = useAssetsTvl()
  const { latestData: maxBtcLatestData } = useMaxBtcData()
  const selectedMarket = markets?.find((market) => market.asset.denom === selectedToken.denom)

  const isMaxBtc = selectedToken.denom === MAXBTC_DENOM

  const metrics = useMemo(() => {
    if (isMaxBtc) {
      // For maxBTC, use the latest data from the hook
      const depositedUsd = maxBtcLatestData?.depositAmountUsd || 0
      const depositedAmount = maxBtcLatestData?.depositAmount || 0

      return {
        utilizationRate: 0,
        deposited: depositedUsd,
        depositedAmount: depositedAmount,
        tvlShare: 0,
      }
    }

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
  }, [selectedMarket, redBankAssetsTvl, selectedToken.denom, isMaxBtc, maxBtcLatestData])

  return (
    <div className='flex justify-center sm:justify-end items-start gap-4'>
      <div className='flex flex-col gap-4 w-80'>
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
            <FlipCardBackContent
              selectedTokenDenom={selectedToken.denom}
              markets={markets}
              type='deposited'
            />
          }
        />

        {!isMaxBtc && (
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
              <FlipCardBackContent
                selectedTokenDenom={selectedToken.denom}
                markets={markets}
                type='utilization'
              />
            }
          />
        )}

        {!isMaxBtc && (
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
              <FlipCardBackContent
                selectedTokenDenom={selectedToken.denom}
                markets={markets}
                type='tvl'
                redBankAssetsTvl={redBankAssetsTvl}
              />
            }
          />
        )}
      </div>
    </div>
  )
}
