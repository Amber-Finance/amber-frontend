import React from 'react'

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import tokens from '@/config/tokens'
import useMarketsData from '@/hooks/redBank/useMarketsData'

interface DailyData {
  date: string
  formattedDate: string
  [key: string]: string | number // Dynamic keys for each token's deposit/borrow values
}

interface MarketData {
  denom: string
  symbol: string
  price_usd: string
  deposit_amount: string
  borrow_amount: string
  deposit_apy: string
  borrow_apy: string
}

interface TokenInfo {
  symbol: string
  color: string
  hasDeposits: boolean
  hasBorrows: boolean
}

export default function AllMarketsBarChart() {
  const [timeRange, setTimeRange] = React.useState('7')
  const { data: marketsData } = useMarketsData(undefined, parseInt(timeRange))

  const { processedData, chartConfig, legendConfig, tokenInfo } = React.useMemo(() => {
    if (!marketsData?.data || !Array.isArray(marketsData.data)) {
      return { processedData: [], chartConfig: {}, legendConfig: {}, tokenInfo: [] }
    }

    const tokenMap = new Map(tokens.map((token) => [token.denom, token]))
    const symbolToTokenMap = new Map<string, TokenInfo>()

    marketsData.data.forEach((dayData: any) => {
      if (dayData.markets) {
        dayData.markets.forEach((market: MarketData) => {
          const token = tokenMap.get(market.denom)
          if (token && !symbolToTokenMap.has(market.symbol)) {
            symbolToTokenMap.set(market.symbol, {
              symbol: token.symbol,
              color: token.brandColor,
              hasDeposits: false,
              hasBorrows: false,
            })
          }
        })
      }
    })

    const tokenInfo: TokenInfo[] = Array.from(symbolToTokenMap.values())

    const processedData: DailyData[] = marketsData.data
      .slice(0, parseInt(timeRange))
      .reverse() // Reverse to show most recent days first
      .map((dayData: any) => {
        const date = new Date(parseInt(dayData.timestamp))
        const formattedDate = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })

        const dayResult: DailyData = {
          date: dayData.timestamp,
          formattedDate,
        }

        tokenInfo.forEach((token) => {
          dayResult[`${token.symbol}_deposit`] = 0
          dayResult[`${token.symbol}_borrow`] = 0
        })

        if (dayData.markets) {
          dayData.markets.forEach((market: MarketData) => {
            const token = tokenMap.get(market.denom)
            if (!token) return

            const priceUsd = parseFloat(market.price_usd || '0')
            const depositAmount = parseFloat(market.deposit_amount || '0')
            const borrowAmount = parseFloat(market.borrow_amount || '0')

            const depositValue = depositAmount * priceUsd
            const borrowValue = borrowAmount * priceUsd

            if (depositValue > 0) {
              dayResult[`${token.symbol}_deposit`] = depositValue
              const tokenInfoItem = symbolToTokenMap.get(market.symbol)
              if (tokenInfoItem) tokenInfoItem.hasDeposits = true
            }

            if (borrowValue > 0) {
              dayResult[`${token.symbol}_borrow`] = -borrowValue // Borrows are negative
              const tokenInfoItem = symbolToTokenMap.get(market.symbol)
              if (tokenInfoItem) tokenInfoItem.hasBorrows = true
            }
          })
        }

        return dayResult
      })

    const chartConfig: Record<string, { label: string; color: string }> = {}
    tokenInfo.forEach((token) => {
      if (token.hasDeposits) {
        chartConfig[`${token.symbol}_deposit`] = {
          label: token.symbol,
          color: token.color,
        }
      }
      if (token.hasBorrows) {
        chartConfig[`${token.symbol}_borrow`] = {
          label: token.symbol,
          color: token.color,
        }
      }
    })

    const legendConfig: Record<string, { label: string; color: string }> = {}
    tokenInfo.forEach((token) => {
      legendConfig[token.symbol] = {
        label: token.symbol,
        color: token.color,
      }
    })

    return { processedData, chartConfig, legendConfig, tokenInfo }
  }, [marketsData, timeRange])

  const renderBars = () => {
    const bars: React.ReactElement[] = []

    // Render all deposits and borrows as separate bars (grouped by date)
    tokenInfo.forEach((token) => {
      if (token.hasDeposits) {
        bars.push(
          <Bar
            key={`${token.symbol}_deposit`}
            dataKey={`${token.symbol}_deposit`}
            fill={token.color}
            name={`${token.symbol} Deposit`}
            radius={[2, 2, 0, 0]}
          />,
        )
      }
      if (token.hasBorrows) {
        bars.push(
          <Bar
            key={`${token.symbol}_borrow`}
            dataKey={`${token.symbol}_borrow`}
            fill={token.color} // Same color as deposits, but negative values
            name={`${token.symbol} Borrow`}
            radius={[2, 2, 0, 0]}
          />,
        )
      }
    })

    return bars
  }

  return (
    <Card className='bg-card/20'>
      <CardHeader className='flex items-center border-b border-border/40'>
        <CardTitle className='text-sm font-bold text-foreground'>Deposits and Borrows</CardTitle>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className='w-[160px] rounded-lg ml-auto' aria-label='Select a value'>
            <SelectValue placeholder='Last 7 days' />
          </SelectTrigger>
          <SelectContent className='rounded-xl'>
            <SelectItem value='7' className='rounded-lg'>
              Last 7 days
            </SelectItem>
            <SelectItem value='30' className='rounded-lg'>
              Last 30 days
            </SelectItem>
            <SelectItem value='90' className='rounded-lg'>
              Last 3 months
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {/* Custom Legend */}
        <div className='flex flex-wrap gap-4 mb-4 justify-center'>
          {tokenInfo.map((token) => (
            <div key={token.symbol} className='flex items-center gap-2'>
              <div className='w-1 h-2.5 rounded-[2px]' style={{ backgroundColor: token.color }} />
              <span className='text-sm text-muted-foreground'>{token.symbol}</span>
            </div>
          ))}
        </div>
        <div className='w-full h-[350px] overflow-hidden'>
          {!processedData.length ? (
            <div className='flex h-64 items-center justify-center text-muted-foreground'>
              Loading...
            </div>
          ) : (
            <ChartContainer config={chartConfig} className='h-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart
                  data={processedData}
                  margin={{
                    top: 10,
                    right: -10,
                    left: -10,
                    bottom: 5,
                  }}
                  barCategoryGap='10%'
                  barGap={2}
                >
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis
                    dataKey='formattedDate'
                    fontSize={10}
                    dy={10}
                    stroke='rgba(255, 255, 255, 0.06)'
                    interval={Math.ceil(processedData.length / 8)}
                  />
                  <YAxis
                    fontSize={10}
                    stroke='rgba(255, 255, 255, 0.06)'
                    tickFormatter={(value) => {
                      const absValue = Math.abs(value)
                      const sign = value < 0 ? '-' : ''
                      return `${sign}$${(absValue / 1000).toFixed(0)}K`
                    }}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        labelFormatter={(label) => `Date: ${label}`}
                        isCurrency
                        indicator='line'
                      />
                    }
                  />
                  {renderBars()}
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
