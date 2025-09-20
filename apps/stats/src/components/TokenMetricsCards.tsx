'use client'

import { useMemo } from 'react'

import { Card, CardContent } from '@/components/ui/card'
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
      tvlShare,
    }
  }, [selectedMarket, redBankAssetsTvl, selectedToken.denom])

  return (
    <div className='flex justify-end items-start gap-4 p-6'>
      <div className='flex flex-col gap-4 w-80'>
        {/* Utilization Rate Card */}
        <Card className='bg-secondary/20 border border-border/40 hover:border-border/60 transition-all duration-200'>
          <CardContent className='p-4 text-center'>
            <div className='text-muted-foreground text-xs uppercase tracking-wider mb-2'>
              UTILIZATION
            </div>
            <div className='text-2xl font-bold text-white'>
              {metrics.utilizationRate.toFixed(1)}
              <span style={{ color: selectedToken.brandColor }}>%</span>
            </div>
            <div className='text-xs text-muted-foreground mt-1'>
              of available liquidity borrowed
            </div>
          </CardContent>
        </Card>

        {/* Deposited Card */}
        <Card className='bg-secondary/20 border border-border/40 hover:border-border/60 transition-all duration-200'>
          <CardContent className='p-4 text-center'>
            <div className='text-muted-foreground text-xs uppercase tracking-wider mb-2'>
              DEPOSITED
            </div>
            <div className='text-2xl font-bold text-white'>
              <span style={{ color: selectedToken.brandColor }}>$</span>
              {formatNumber(0)(metrics.deposited)}
            </div>
            <div className='text-xs text-muted-foreground mt-1'>total value deposited</div>
          </CardContent>
        </Card>

        {/* TVL Share Card */}
        <Card className='bg-secondary/20 border border-border/40 hover:border-border/60 transition-all duration-200'>
          <CardContent className='p-4 text-center'>
            <div className='text-muted-foreground text-xs uppercase tracking-wider mb-2'>
              TVL SHARE
            </div>
            <div className='text-2xl font-bold text-white'>
              {metrics.tvlShare.toFixed(1)}
              <span style={{ color: selectedToken.brandColor }}>%</span>
            </div>
            <div className='text-xs text-muted-foreground mt-1'>of total protocol TVL</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
