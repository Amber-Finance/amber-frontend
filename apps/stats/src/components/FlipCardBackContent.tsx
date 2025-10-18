'use client'

import { useMemo } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import tokens from '@/config/tokens'
import { calculateUsdValueLegacy, formatCurrency, formatNumber } from '@/utils/format'
import { cn } from '@/utils/ui'

interface DistributionItem {
  name: string
  value: number
  color: string
  denom: string
  isSelected: boolean
}

interface Props {
  selectedTokenDenom: string
  markets: Market[] | null
  type: 'utilization' | 'deposited' | 'tvl'
  redBankAssetsTvl?: RedBankAssetsTvl
}

export default function FlipCardBackContent({
  selectedTokenDenom,
  markets,
  type,
  redBankAssetsTvl,
}: Props) {
  const { distributionData, showProgressBar, formatValue } = useMemo(() => {
    if (!markets) {
      return {
        distributionData: [],
        showProgressBar: false,
        formatValue: (val: number) => val.toString(),
      }
    }

    const tokenMap = new Map(tokens.map((token) => [token.denom, token]))

    let distributionData: DistributionItem[] = []
    let showProgressBar = false
    let formatValue = (val: number) => val.toString()

    if (type === 'utilization') {
      showProgressBar = true
      formatValue = (val: number) => `${formatNumber(1)(val)}%`

      distributionData = markets
        .filter((market) => {
          const utilizationRate = parseFloat(market.metrics.utilization_rate)
          return utilizationRate > 0
        })
        .map((market) => {
          const token = tokenMap.get(market.asset.denom)
          const utilizationRate = parseFloat(market.metrics.utilization_rate) * 100

          return {
            name: token?.symbol || market.asset.symbol,
            value: utilizationRate,
            color: token?.brandColor || '#888888',
            denom: market.asset.denom,
            isSelected: market.asset.denom === selectedTokenDenom,
          }
        })
        .sort((a: DistributionItem, b: DistributionItem) => b.value - a.value)
    } else if (type === 'deposited') {
      showProgressBar = false
      formatValue = (val: number) => formatCurrency(0)(val)

      distributionData = markets
        .filter((market) => {
          const depositedAmount = parseFloat(market.metrics.collateral_total_amount)
          return depositedAmount > 0
        })
        .map((market) => {
          const token = tokenMap.get(market.asset.denom)
          const depositedAmount = parseFloat(market.metrics.collateral_total_amount)
          const price = market.price?.price ? parseFloat(market.price.price) : 0
          const depositedUsd = calculateUsdValueLegacy(
            depositedAmount,
            price,
            market.asset.decimals,
          )

          return {
            name: token?.symbol || market.asset.symbol,
            value: depositedUsd,
            color: token?.brandColor || '#888888',
            denom: market.asset.denom,
            isSelected: market.asset.denom === selectedTokenDenom,
          }
        })
        .sort((a: DistributionItem, b: DistributionItem) => b.value - a.value)
    } else if (type === 'tvl') {
      showProgressBar = true
      formatValue = (val: number) => `${formatNumber(1)(val)}%`

      if (!redBankAssetsTvl?.assets) {
        return { distributionData: [], showProgressBar, formatValue }
      }

      distributionData = redBankAssetsTvl.assets
        .filter((asset: TvlAsset) => asset.tvl_share > 0)
        .map((asset: TvlAsset) => {
          const token = tokenMap.get(asset.denom)
          return {
            name: token?.symbol || 'Asset',
            value: parseFloat(asset.tvl_share.toString()),
            color: token?.brandColor || '#888888',
            denom: asset.denom,
            isSelected: asset.denom === selectedTokenDenom,
          }
        })
        .sort((a: DistributionItem, b: DistributionItem) => b.value - a.value)
    }

    return { distributionData, showProgressBar, formatValue }
  }, [markets, selectedTokenDenom, type, redBankAssetsTvl])

  if (distributionData.length === 0) {
    return (
      <Card className='bg-background w-full h-full'>
        <CardContent className='p-2 h-full flex items-center justify-center'>
          <div className='text-muted-foreground text-xs text-center'>
            {markets ? `No ${type} data available` : 'Loading...'}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='bg-background w-full h-full'>
      <CardContent className='p-10 h-full flex flex-col justify-center'>
        <div className='space-y-1'>
          {distributionData.slice(0, 5).map((item: DistributionItem) => (
            <div key={item.denom} className='flex items-center justify-between'>
              <div className='flex items-center gap-2 flex-1 min-w-0'>
                <div
                  className='w-2 h-2 rounded-full flex-shrink-0'
                  style={{ backgroundColor: item.color }}
                />
                <span
                  className={cn(
                    'text-xs truncate',
                    item.isSelected ? 'font-bold' : 'text-muted-foreground',
                  )}
                >
                  {item.name}
                </span>
              </div>
              <div className='flex items-center gap-2 flex-shrink-0'>
                {showProgressBar && (
                  <div className='w-12 bg-muted/20 rounded-full h-1.5'>
                    <div
                      className='h-1.5 rounded-full transition-all duration-300'
                      style={{
                        width: `${Math.min(item.value, 100)}%`,
                        backgroundColor: item.color,
                        opacity: item.isSelected ? 1 : 0.7,
                      }}
                    />
                  </div>
                )}
                <span
                  className={cn(
                    'text-xs font-mono text-right',
                    showProgressBar ? 'w-20' : 'w-24',
                    item.isSelected ? 'font-bold' : 'text-muted-foreground',
                  )}
                >
                  {formatValue(item.value)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
