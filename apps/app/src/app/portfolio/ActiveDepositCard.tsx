import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { EarningPointsRow } from '@/components/common/EarningPointsRow'
import { Button } from '@/components/ui/Button'
import { CountingNumber } from '@/components/ui/CountingNumber'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import tokens from '@/config/tokens'

interface DepositPosition {
  denom: string
  symbol: string
  amount: string
  amountFormatted: number
  usdValue: number
  apy: number
  actualPnl: number
  actualPnlPercent: number
}

interface ActiveDepositCardProps {
  deposit: DepositPosition
  index: number
}

export function ActiveDepositCard({ deposit, index }: ActiveDepositCardProps) {
  const router = useRouter()

  // Get token information from config
  const token = tokens.find((t) => t.denom === deposit.denom)

  // Format amounts for display with appropriate precision
  const formatAmount = (amount: number, tokenDecimals: number = 6, displayDecimals = 6): string => {
    if (typeof amount !== 'number' || isNaN(amount) || amount === 0) {
      return '0.' + '0'.repeat(tokenDecimals)
    }

    // For tokens with high decimals (like eBTC with 18), show more precision for small amounts
    const effectiveDecimals =
      tokenDecimals && tokenDecimals > 8 ? Math.min(displayDecimals + 2, 8) : displayDecimals

    if (amount < Math.pow(10, -effectiveDecimals))
      return `<${Math.pow(10, -effectiveDecimals).toFixed(effectiveDecimals)}`
    return amount.toFixed(effectiveDecimals)
  }

  const formatUsdValue = (value: number): string => {
    if (typeof value !== 'number' || isNaN(value) || value === 0) return '$0.00'
    if (value < 0.01) return '<$0.01'
    return `$${value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  return (
    <Card className='group relative bg-card border border-border/20 backdrop-blur-xl hover:border-border/40 transition-all duration-500 hover:shadow-lg @container'>
      {/* Card Header */}

      <CardHeader className='relative z-20'>
        {/* below 350px width, show columns, above 350px width, show rows */}
        <div className='flex flex-col @[350px]:flex-row @[350px]:items-center @[350px]:justify-between gap-4 mb-4'>
          <div className='flex items-center gap-4'>
            <div className='relative'>
              <div className='relative w-12 h-12 @[350px]:w-16 @[350px]:h-16'>
                <Image
                  src={token?.icon || ''}
                  alt={deposit.symbol}
                  fill
                  sizes='(min-width: 350px) 64px, 48px'
                  className='w-full h-full object-contain'
                />
              </div>
            </div>

            <div>
              <div className='flex flex-col'>
                <CardTitle className='text-base @[350px]:text-lg font-semibold'>
                  {token?.symbol}
                </CardTitle>
                <CardDescription className='text-xs @[350px]:text-sm text-muted-foreground'>
                  {token?.protocol}
                </CardDescription>
              </div>
            </div>
          </div>

          <div className='text-center '>
            <div
              className='text-3xl @[350px]:text-4xl font-funnel font-bold flex flex-row justify-center @[350px]:justify-end'
              style={{ color: token?.brandColor }}
            >
              <CountingNumber value={deposit.apy} decimalPlaces={2} />
              <span
                className={`text-lg @[350px]:text-xl self-end`}
                style={{ color: (token as TokenInfo)?.brandColor || '#F97316' }}
              >
                %
              </span>
            </div>
            <p className='text-muted-foreground uppercase tracking-wider text-xs font-medium mt-1'>
              APY
            </p>
          </div>
        </div>
      </CardHeader>

      {/* Main Content */}
      <CardContent className='relative space-y-6'>
        {/* Metrics Grid */}
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <p className='text-xs text-muted-foreground uppercase tracking-wider mb-2'>
              Position Value
            </p>
            <p className='text-2xl font-funnel font-bold text-foreground'>
              <span className='text-primary'>$ </span>
              <CountingNumber value={deposit.usdValue} decimalPlaces={2} />
            </p>
            <p className='text-sm text-muted-foreground font-medium mt-1'>
              {formatAmount(deposit.amountFormatted, token?.decimals)} {deposit.symbol}
            </p>
          </div>
          <div>
            <p className='text-xs text-muted-foreground uppercase tracking-wider mb-2'>P&L</p>
            <p
              className={`text-2xl font-funnel font-bold ${
                deposit.actualPnl >= 0 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {deposit.actualPnl >= 0 ? '+' : '-'}${Math.abs(deposit.actualPnl || 0).toFixed(2)}
            </p>
            <p
              className={`text-sm font-medium mt-1 ${
                deposit.actualPnlPercent >= 0 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {deposit.actualPnlPercent >= 0 ? '+' : ''}
              {typeof deposit.actualPnlPercent === 'number' && !isNaN(deposit.actualPnlPercent)
                ? deposit.actualPnlPercent.toFixed(2)
                : '0.00'}
              %
            </p>
          </div>
        </div>

        {/* Earning Points Section */}
        <div className='pt-3 border-t border-border/20'>
          <EarningPointsRow assetSymbol={deposit.symbol} variant='full' type='deposit' />
        </div>

        {/* Action Button */}
        <div className='flex pt-4 border-t border-border/20'>
          <Button
            variant='default'
            size='sm'
            className='w-full'
            onClick={() => router.push(`/deposit?token=${deposit.symbol}`)}
          >
            Modify
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
