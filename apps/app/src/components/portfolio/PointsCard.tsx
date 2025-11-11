import Image from 'next/image'

import BigNumber from 'bignumber.js'

import { CountingNumber } from '@/components/ui/CountingNumber'
import { Card, CardContent } from '@/components/ui/card'
import { useStructuredPoints } from '@/hooks/portfolio'

interface PointsCardProps {
  address: string
}

export function PointsCard({ address }: PointsCardProps) {
  const { data: pointsData, isLoading } = useStructuredPoints(address)

  // Parse balance from CW20 contract (stored as whole numbers, no decimal shift needed)
  const balanceRaw = pointsData?.balance || '0'
  const points = new BigNumber(balanceRaw).toNumber()

  return (
    <Card className='group relative overflow-hidden bg-card border border-border/50 backdrop-blur-xl transition-all duration-300 col-span-full'>
      <CardContent>
        <div className='flex items-center justify-between gap-4'>
          {/* Left side: Icon + Label */}
          <div className='flex items-center gap-3'>
            <Image
              src='/images/structured.svg'
              alt='Structured Points'
              width={24}
              height={24}
              className='opacity-90'
            />
            <p className='text-sm font-medium text-muted-foreground uppercase tracking-wider'>
              Structured Points
            </p>
          </div>

          {/* Right side: Points value */}
          <div className='flex items-center'>
            {isLoading ? (
              <div className='h-7 w-32 bg-muted/20 animate-pulse rounded' />
            ) : (
              <div className='flex flex-row items-baseline gap-1 text-xl sm:text-2xl font-funnel text-foreground'>
                <CountingNumber value={points} decimalPlaces={0} />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
