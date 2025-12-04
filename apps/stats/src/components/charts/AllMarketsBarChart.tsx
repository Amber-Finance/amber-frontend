import React from 'react'

import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'

import { useTheme } from '@/components/providers/ThemeProvider'
import { ChartContainer, ChartTooltip } from '@/components/ui/chart'
import tokens from '@/config/tokens'
import { MAXBTC_DENOM } from '@/constants/query'
import useMarketsData from '@/hooks/redBank/useMarketsData'
import useMaxBtcData from '@/hooks/useMaxBtcData'
import { formatChartDate } from '@/utils/chartDateFormatter'
import { formatCompactCurrency, formatCurrency } from '@/utils/format'

interface DailyData {
  date: string
  formattedDate: string
  [key: string]: string | number // Dynamic keys for each token's deposit/borrow values
}

interface TokenInfo {
  symbol: string
  color: string
  hasDeposits: boolean
  hasBorrows: boolean
}

interface Props {
  timeRange: string
}

export default function AllMarketsBarChart({ timeRange }: Props) {
  const { resolvedTheme } = useTheme()
  const tickColor = resolvedTheme === 'dark' ? 'rgb(156, 156, 156)' : 'rgb(120, 85, 50)'
  const { data: marketsData } = useMarketsData(undefined, parseInt(timeRange))
  const { data: maxBtcData } = useMaxBtcData(parseInt(timeRange))

  const { processedData, chartConfig, tokenInfo } = React.useMemo(() => {
    if (!marketsData?.data || !Array.isArray(marketsData.data)) {
      return { processedData: [], chartConfig: {}, legendConfig: {}, tokenInfo: [] }
    }

    const tokenMap = new Map(tokens.map((token) => [token.denom, token]))
    const symbolToTokenMap = new Map<string, TokenInfo>()

    const maxBtcDepositsMap = new Map<string, number>()
    if (maxBtcData) {
      maxBtcData.forEach((item) => {
        const formattedDate = formatChartDate(item.timestamp)
        maxBtcDepositsMap.set(formattedDate, item.depositAmountUsd)
      })
    }

    // Add maxBTC token to symbol map if it exists and has data
    const maxBtcToken = tokens.find((token) => token.denom === MAXBTC_DENOM)
    if (maxBtcToken && maxBtcDepositsMap.size > 0) {
      symbolToTokenMap.set(maxBtcToken.symbol, {
        symbol: maxBtcToken.symbol,
        color: maxBtcToken.brandColor,
        hasDeposits: false,
        hasBorrows: false,
      })
    }

    marketsData.data.forEach((dayData: DailyMarketData) => {
      if (dayData.markets) {
        dayData.markets.forEach((market: MarketData) => {
          // Filter out max BTC denom data
          if (market.denom === MAXBTC_DENOM) {
            return
          }

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
      .map((dayData: DailyMarketData) => {
        const formattedDate = formatChartDate(dayData.timestamp)

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
            // Filter out max BTC denom data
            if (market.denom === MAXBTC_DENOM) {
              return
            }

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
        // Add max BTC deposits for this day - match by date
        const marketsDate = formatChartDate(dayData.timestamp)
        let maxBtcValueUsd = 0

        // Find maxBTC data for the same date
        for (const [maxBtcDate, amount] of maxBtcDepositsMap.entries()) {
          if (maxBtcDate === marketsDate) {
            maxBtcValueUsd = amount
            break
          }
        }

        if (maxBtcValueUsd > 0) {
          dayResult['maxBTC_deposit'] = maxBtcValueUsd
          const maxBtcTokenInfo = symbolToTokenMap.get('maxBTC')
          if (maxBtcTokenInfo) maxBtcTokenInfo.hasDeposits = true
        }

        return dayResult
      })

    const chartConfig: Record<string, { label: string; color: string }> = {}
    tokenInfo.forEach((token) => {
      if (token.hasDeposits) {
        chartConfig[`${token.symbol}_deposit`] = {
          label: `${token.symbol} Deposit`,
          color: token.color,
        }
      }
      if (token.hasBorrows) {
        chartConfig[`${token.symbol}_borrow`] = {
          label: `${token.symbol} Borrow`,
          color: token.color,
        }
      }
      // Add simplified legend entries for each token
      chartConfig[token.symbol] = {
        label: token.symbol,
        color: token.color,
      }
    })

    return { processedData, chartConfig, tokenInfo }
  }, [marketsData, timeRange, maxBtcData])

  const renderBars = () => {
    const bars: React.ReactElement[] = []

    // Sort tokens by their average deposit value (largest to smallest)
    const sortedTokens = [...tokenInfo].sort((a, b) => {
      const aDepositKey = `${a.symbol}_deposit`
      const bDepositKey = `${b.symbol}_deposit`

      // Calculate average deposit value for each token
      let aAvgDeposit = 0
      let bAvgDeposit = 0

      if (processedData.length > 0) {
        aAvgDeposit =
          processedData.reduce((sum, day) => sum + ((day[aDepositKey] as number) || 0), 0) /
          processedData.length
        bAvgDeposit =
          processedData.reduce((sum, day) => sum + ((day[bDepositKey] as number) || 0), 0) /
          processedData.length
      }
      return bAvgDeposit - aAvgDeposit // Sort largest to smallest
    })

    // Render all deposits and borrows as separate bars (grouped by date)
    sortedTokens.forEach((token) => {
      if (token.hasDeposits) {
        bars.push(
          <Bar
            key={`${token.symbol}_deposit`}
            dataKey={`${token.symbol}_deposit`}
            fill={`url(#depositGradient-${token.symbol})`}
            name={`${token.symbol} Deposit`}
            stackId='deposits'
            radius={[2, 2, 2, 2]}
            stroke={token.color}
            strokeWidth={1}
            color={token.color}
          />,
        )
      }
      if (token.hasBorrows) {
        bars.push(
          <Bar
            key={`${token.symbol}_borrow`}
            dataKey={`${token.symbol}_borrow`}
            fill={`url(#borrowGradient-${token.symbol})`}
            name={`${token.symbol} Borrow`}
            stackId='borrows'
            radius={[2, 2, 2, 2]}
            stroke={token.color}
            strokeWidth={1}
            color={token.color}
          />,
        )
      }
    })

    return bars
  }

  return (
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
              barCategoryGap='25%'
              barGap={6}
              stackOffset='sign'
            >
              <defs>
                {tokenInfo.map((token) => (
                  <g key={token.symbol}>
                    <linearGradient
                      id={`depositGradient-${token.symbol}`}
                      x1='0'
                      y1='0'
                      x2='0'
                      y2='1'
                    >
                      <stop offset='0%' stopColor={token.color} stopOpacity={0.7} />
                      <stop offset='100%' stopColor={token.color} stopOpacity={0.3} />
                    </linearGradient>
                    <linearGradient
                      id={`borrowGradient-${token.symbol}`}
                      x1='0'
                      y1='0'
                      x2='0'
                      y2='1'
                    >
                      <stop offset='0%' stopColor={token.color} stopOpacity={0.5} />
                      <stop offset='100%' stopColor={token.color} stopOpacity={0.7} />
                    </linearGradient>
                  </g>
                ))}
              </defs>
              <CartesianGrid
                strokeDasharray='1 3'
                stroke='rgba(255, 255, 255, 0.08)'
                vertical={false}
              />
              <XAxis
                dataKey='formattedDate'
                fontSize={10}
                dy={10}
                stroke='rgba(255, 255, 255, 0.06)'
                interval={Math.ceil(processedData.length / 8)}
                tickLine={false}
                axisLine={false}
                tick={{ fill: tickColor }}
              />
              <YAxis
                fontSize={10}
                dy={10}
                stroke='rgba(255, 255, 255, 0.06)'
                tickLine={false}
                axisLine={false}
                tickFormatter={formatCompactCurrency}
                tick={{ fill: tickColor }}
              />
              <ChartTooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className='grid min-w-32 items-start gap-1.5 rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl'>
                        <p className='font-medium'>{label}</p>
                        <div className='grid gap-1.5'>
                          {payload.map((entry, index) => {
                            const config = (
                              chartConfig as Record<string, { label: string; color: string }>
                            )[entry.dataKey as string]
                            const color = config?.color || entry.color
                            return (
                              <div
                                key={index}
                                className='flex w-full flex-wrap items-stretch gap-2'
                              >
                                <div
                                  className='w-1 h-2.5 rounded-[2px] shrink-0'
                                  style={{ backgroundColor: color }}
                                />
                                <div className='flex flex-1 justify-between leading-none gap-4 items-center'>
                                  <span className='text-muted-foreground'>
                                    {config?.label || entry.dataKey}
                                  </span>
                                  <span className='font-medium tabular-nums text-foreground'>
                                    {entry.value && typeof entry.value === 'number'
                                      ? formatCurrency()(entry.value)
                                      : entry.value}
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
                cursor={{
                  opacity: 0.2,
                  stroke: 'rgba(255, 255, 255, 0.2)',
                  strokeWidth: 1,
                }}
              />
              {renderBars()}

              <ReferenceLine y={0} stroke='rgba(255, 255, 255, 0.2)' strokeWidth={1} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}

      {/* Chart Legend */}
      <div className='mt-4 flex flex-wrap gap-4 justify-center'>
        {tokenInfo.map((token) => (
          <div key={token.symbol} className='flex items-center gap-2 text-sm'>
            <div
              className='h-2 w-2 shrink-0 rounded-[2px] opacity-70'
              style={{ backgroundColor: token.color }}
            />
            <span className='text-foreground/60'>{token.symbol}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
