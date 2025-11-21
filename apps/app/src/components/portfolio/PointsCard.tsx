import Image from 'next/image'

import BigNumber from 'bignumber.js'

import { CountingNumber } from '@/components/ui/CountingNumber'
import { Card, CardContent } from '@/components/ui/card'
import { useFragments, useStructuredPoints } from '@/hooks/portfolio'

interface PointsCardProps {
  address: string
}

// Structured Points Card
export function StructuredPointsCard({ address }: PointsCardProps) {
  const { data: structuredPointsData, isLoading } = useStructuredPoints(address)

  // Parse balance from CW20 contract (stored as whole numbers, no decimal shift needed)
  const structuredPointsRaw = structuredPointsData?.balance || '0'
  const structuredPoints = new BigNumber(structuredPointsRaw).toNumber()

  return (
    <Card className='group relative overflow-hidden bg-card border border-border/50 backdrop-blur-xl transition-all duration-300 py-0'>
      <CardContent className='p-4'>
        <div className='space-y-1'>
          <div className='flex items-center gap-2'>
            <Image
              src='/images/structured.svg'
              alt='Structured Points'
              width={20}
              height={20}
              className='opacity-90'
            />
            <p className='text-xs text-muted-foreground uppercase tracking-wider font-medium'>
              Structured Points
            </p>
          </div>
          <div className='flex items-center'>
            {isLoading ? (
              <div className='h-6 w-24 bg-muted/20 animate-pulse rounded' />
            ) : (
              <div className='flex flex-row items-baseline gap-1 text-lg font-funnel text-foreground'>
                <CountingNumber value={structuredPoints} decimalPlaces={0} />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Mars Fragments Card
export function MarsFragmentsCard({ address }: PointsCardProps) {
  const { data: fragmentsData, isLoading } = useFragments(address)

  // Parse fragments from API response (nested in total_fragments.total_accumulated)
  const fragmentsRaw = fragmentsData?.total_fragments?.total_accumulated || '0'
  const fragments = new BigNumber(fragmentsRaw).toNumber()

  return (
    <Card className='group relative overflow-hidden bg-card border border-border/50 backdrop-blur-xl transition-all duration-300 py-0'>
      <CardContent className='p-4'>
        <div className='space-y-1'>
          <div className='flex items-center gap-2'>
            <Image
              src='/points/mars-fragments.svg'
              alt='Mars Fragments'
              width={20}
              height={20}
              className='opacity-90'
            />
            <p className='text-xs text-muted-foreground uppercase tracking-wider font-medium'>
              Mars Fragments
            </p>
          </div>
          <div className='flex items-center'>
            {isLoading ? (
              <div className='h-6 w-24 bg-muted/20 animate-pulse rounded' />
            ) : (
              <div className='flex flex-row items-baseline gap-1 text-lg font-funnel text-foreground'>
                <CountingNumber value={fragments} decimalPlaces={0} />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Legacy export for backward compatibility
export function PointsCard({ address }: PointsCardProps) {
  return (
    <>
      <StructuredPointsCard address={address} />
      <MarsFragmentsCard address={address} />
    </>
  )
}
