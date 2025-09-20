import Image from 'next/image'
import { useRouter } from 'next/navigation'

import { EarningPointsRow } from '@/components/common/EarningPointsRow'
import { Button } from '@/components/ui/Button'
import { SubtleGradientBg } from '@/components/ui/SubtleGradientBg'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import tokens from '@/config/tokens'

interface DepositPosition {
  denom: string
  symbol: string
  amount: string
  amountFormatted: number
  usdValue: number
  apy: number
  ytdEarnings: number
  ytdEarningsPercent: number
}

interface ActiveDepositCardProps {
  deposit: DepositPosition
  index: number
}

export function ActiveDepositCard({ deposit, index }: ActiveDepositCardProps) {
  const router = useRouter()
  const gradientVariants: ('purple' | 'blue' | 'secondary')[] = ['purple', 'blue', 'secondary']
  const gradientClass = gradientVariants[index % gradientVariants.length]

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
    <Card className='group relative  bg-card border border-border/20 backdrop-blur-xl hover:border-border/40 transition-all duration-500 hover:shadow-lg'>
      {/* Subtle Gradient Background */}
      {/* <SubtleGradientBg variant={gradientClass} className='opacity-40' /> */}

      {/* Card Header */}
      <CardHeader className='relative pb-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <div className='w-12 h-12 rounded-2xl overflow-hidden bg-gradient-to-br from-secondary/30 to-secondary/20 p-3 border border-secondary/30'>
              {token?.icon ? (
                <Image
                  src={token.icon}
                  alt={deposit.symbol}
                  width={24}
                  height={24}
                  className='w-full h-full object-contain'
                />
              ) : (
                <div className='w-full h-full bg-primary/30 rounded-xl flex items-center justify-center text-xs font-bold text-primary'>
                  {deposit.symbol}
                </div>
              )}
            </div>
            <div>
              <h3 className='font-funnel font-semibold text-foreground text-lg mb-1'>
                {deposit.symbol}
              </h3>
              <p className='text-muted-foreground font-medium'>
                {typeof deposit.apy === 'number' && !isNaN(deposit.apy)
                  ? deposit.apy.toFixed(2)
                  : '0.00'}
                % APY
              </p>
            </div>
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
              {formatUsdValue(Number(deposit.usdValue.toFixed(2)))}
            </p>
            <p className='text-sm text-muted-foreground font-medium mt-1'>
              {formatAmount(deposit.amountFormatted, token?.decimals)} {deposit.symbol}
            </p>
          </div>
          <div>
            <p className='text-xs text-muted-foreground uppercase tracking-wider mb-2'>
              YTD Earnings
            </p>
            <p className='text-2xl font-funnel font-bold text-green-500'>
              {deposit.ytdEarnings >= 0 ? '+' : '-'}${Math.abs(deposit.ytdEarnings || 0).toFixed(2)}
            </p>
            <p className='text-sm text-green-500 font-medium mt-1'>
              {(deposit.ytdEarningsPercent || 0) >= 0 ? '+' : '-'}
              {typeof deposit.ytdEarningsPercent === 'number' && !isNaN(deposit.ytdEarningsPercent)
                ? deposit.ytdEarningsPercent.toFixed(2)
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
            className='w-full border-border/40 hover:bg-foreground/5 font-medium'
            onClick={() => router.push(`/deposit?token=${deposit.symbol}`)}
          >
            Modify
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
