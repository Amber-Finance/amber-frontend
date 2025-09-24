import { useMemo } from 'react'

import { BigNumber } from 'bignumber.js'

import { PRICE_DECIMALS } from '@/constants/query'
import useMarketsData from '@/hooks/redBank/useMarketsData'
import useMaxBtcDeposits from '@/hooks/useMaxBtcDeposits'

export default function useMaxBtcData(timeRange: number = 7) {
  const { data: maxBtcDeposits } = useMaxBtcDeposits()
  const { data: marketsData } = useMarketsData(undefined, timeRange)

  const maxBtcData = useMemo(() => {
    if (!maxBtcDeposits?.data) {
      return []
    }

    const timestamps = Object.keys(maxBtcDeposits.data).sort()

    return timestamps
      .map((timestamp) => {
        const deposits = maxBtcDeposits.data[timestamp]

        const depositAmount =
          deposits && deposits.length > 0 ? parseFloat(deposits[0].amount || '0') : 0

        // Convert to BTC units
        const maxBtcAmountInBtc = new BigNumber(depositAmount).shiftedBy(-PRICE_DECIMALS).toNumber()

        // Get maxBTC price from markets data
        let btcPriceUsd = 0
        if (marketsData?.data) {
          const depositDate = new Date(parseInt(timestamp)).toDateString()
          const marketData = marketsData.data.find((item: any) => {
            const marketDate = new Date(parseInt(item.timestamp)).toDateString()
            return marketDate === depositDate
          })

          if (marketData?.markets) {
            for (const market of marketData.markets) {
              if (market.symbol.toLowerCase() === 'maxbtc') {
                btcPriceUsd = parseFloat(market.price_usd || '0')
                break
              }
            }
          }
        }

        const depositAmountUsd = maxBtcAmountInBtc * btcPriceUsd

        return {
          timestamp,
          depositAmount: maxBtcAmountInBtc,
          depositAmountUsd,
          btcPriceUsd,
        }
      })
      .reverse()
  }, [maxBtcDeposits, marketsData])

  // Get latest data for metrics
  const latestData = maxBtcData.length > 0 ? maxBtcData[0] : null

  return {
    data: maxBtcData,
    latestData,
    isLoading: !maxBtcDeposits && !marketsData,
  }
}
