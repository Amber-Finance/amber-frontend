'use client'

import { useMemo } from 'react'

import DistributionCard from '@/components/DistributionCard'
import FlipCard from '@/components/FlipCard'
import { MAXBTC_DENOM } from '@/constants/query'
import useAssetsTvl from '@/hooks/redBank/useAssetsTvl'
import useMaxBtcDeposits from '@/hooks/useMaxBtcDeposits'
import { calculateUsdValueLegacy, formatNumber } from '@/utils/format'

interface TokenMetricsCardsProps {
  selectedToken: TokenInfo
  markets: Market[] | null
}

export default function TokenMetricsCards({ selectedToken, markets }: TokenMetricsCardsProps) {
  const { data: redBankAssetsTvl } = useAssetsTvl()
  const { data: maxBtcDeposits } = useMaxBtcDeposits()
  const selectedMarket = markets?.find((market) => market.asset.denom === selectedToken.denom)

  const isMaxBtc = selectedToken.denom === MAXBTC_DENOM

  const metrics = useMemo(() => {
    if (isMaxBtc) {
      // For maxBTC, get the latest deposit data from the API response
      let depositedUsd = 0
      let depositedAmount = 0

      if (maxBtcDeposits?.data) {
        // Get the latest timestamp (last entry in the data object)
        const timestamps = Object.keys(maxBtcDeposits.data).sort()
        const latestTimestamp = timestamps[timestamps.length - 1]
        const latestData = maxBtcDeposits.data[latestTimestamp]

        if (latestData && latestData.length > 0) {
          // Sum up all deposits for the latest timestamp
          depositedAmount = latestData.reduce((total: number, deposit: any) => {
            return total + parseFloat(deposit.amount || '0')
          }, 0)

          // Get BTC price from other BTC tokens in markets
          let btcPriceUsd = 0
          if (markets) {
            for (const market of markets) {
              if (
                market.asset.symbol === 'WBTC' ||
                market.asset.symbol === 'LBTC' ||
                market.asset.symbol === 'eBTC'
              ) {
                btcPriceUsd = parseFloat(market.price?.price || '0')
                break
              }
            }
          }

          // Convert maxBTC amount to USD using BTC price
          if (btcPriceUsd > 0) {
            // Convert from satoshis to BTC units (maxBTC has 8 decimals)
            const maxBtcAmountInBtc = depositedAmount / Math.pow(10, 8)
            depositedUsd = maxBtcAmountInBtc * btcPriceUsd
          }
        }
      }

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
  }, [selectedMarket, redBankAssetsTvl, selectedToken.denom, isMaxBtc, maxBtcDeposits])

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
            <DistributionCard
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
              <DistributionCard
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
              <DistributionCard
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
