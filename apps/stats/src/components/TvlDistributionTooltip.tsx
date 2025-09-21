'use client'

import { useMemo } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import tokens from '@/config/tokens'
import useAssetsTvl from '@/hooks/redBank/useAssetsTvl'
import { cn } from '@/utils/ui'

interface TvlDistributionTooltipProps {
  selectedTokenDenom: string
  className?: string
}

export default function TvlDistributionTooltip({
  selectedTokenDenom,
  className = '',
}: TvlDistributionTooltipProps) {
  const { data: redBankAssetsTvl } = useAssetsTvl()

  const tvlData = useMemo(() => {
    if (!redBankAssetsTvl?.assets) {
      return []
    }

    // Create a map of denom to token info for quick lookup
    const tokenMap = new Map(tokens.map((token) => [token.denom, token]))

    // Filter and process TVL data
    const data = redBankAssetsTvl.assets
      .filter((asset: any) => asset.tvl_share > 0)
      .map((asset: any) => {
        const token = tokenMap.get(asset.denom)
        return {
          name: token?.symbol || 'Unknown',
          value: parseFloat(asset.tvl_share.toString()),
          color: token?.brandColor || '#888888',
          denom: asset.denom,
          isSelected: asset.denom === selectedTokenDenom,
        }
      })
      .sort((a: any, b: any) => b.value - a.value) // Sort by TVL share descending

    return data
  }, [redBankAssetsTvl, selectedTokenDenom])

  if (tvlData.length === 0) {
    return (
      <Card className='bg-secondary/20 w-full h-full'>
        <CardContent className='p-2 h-full flex items-center justify-center'>
          <div className='text-muted-foreground text-xs text-center'>
            {redBankAssetsTvl ? 'No TVL data available' : 'Loading...'}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='bg-secondary/20 w-full h-full'>
      <CardContent className='p-5 h-full flex flex-col justify-center'>
        <div className='space-y-1'>
          {tvlData
            .slice(0, 5)
            .map(
              (token: {
                name: string
                value: number
                color: string
                denom: string
                isSelected: boolean
              }) => (
                <div key={token.denom} className='flex items-center justify-between'>
                  <div className='flex items-center gap-2 flex-1 min-w-0'>
                    <div
                      className='w-2 h-2 rounded-full flex-shrink-0'
                      style={{ backgroundColor: token.color }}
                    />
                    <span
                      className={cn(
                        'text-xs truncate',
                        token.isSelected ? 'font-bold' : 'text-muted-foreground',
                      )}
                    >
                      {token.name}
                    </span>
                  </div>
                  <div className='flex items-center gap-2 flex-shrink-0'>
                    <div className='w-12 bg-muted/20 rounded-full h-1.5'>
                      <div
                        className='h-1.5 rounded-full transition-all duration-300'
                        style={{
                          width: `${token.value}%`,
                          backgroundColor: token.color,
                          opacity: token.isSelected ? 1 : 0.7,
                        }}
                      />
                    </div>
                    <span
                      className={cn(
                        'text-xs font-mono w-12 text-right',
                        token.isSelected ? 'font-bold' : 'text-muted-foreground',
                      )}
                    >
                      {token.value.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ),
            )}
        </div>
      </CardContent>
    </Card>
  )
}
