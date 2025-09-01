import Image from 'next/image'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface MarketInfoCardProps {
  strategy: Strategy
  displayValues: {
    supplyApy: string
    borrowApy: string
  }
  getAvailableLiquidityDisplay: () => string
}

export function MarketInfoCard({
  strategy,
  displayValues,
  getAvailableLiquidityDisplay,
}: MarketInfoCardProps) {
  return (
    <Card>
      <CardHeader className='pb-1'>
        <CardTitle className='text-sm font-semibold'>Market</CardTitle>
      </CardHeader>
      <CardContent className='space-y-2'>
        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            <Image
              src={strategy.collateralAsset.icon}
              alt={strategy.collateralAsset.symbol}
              width={16}
              height={16}
            />
            <span className='font-medium text-foreground text-sm'>
              {strategy.collateralAsset.symbol}
            </span>
          </div>

          <div className='space-y-1 text-xs'>
            <div className='flex justify-between items-center'>
              <span className='text-muted-foreground'>Supply APY</span>
              <span className='font-medium text-accent-foreground'>{displayValues.supplyApy}</span>
            </div>
          </div>
        </div>

        <Separator />

        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            <Image
              src={strategy.debtAsset.icon}
              alt={strategy.debtAsset.symbol}
              width={16}
              height={16}
            />
            <span className='font-medium text-foreground text-sm'>{strategy.debtAsset.symbol}</span>
          </div>

          <div className='space-y-1 text-xs'>
            <div className='flex justify-between items-center'>
              <span className='text-muted-foreground'>Borrow APY</span>
              <span className='font-medium text-orange-600 dark:text-orange-400'>
                {displayValues.borrowApy}
              </span>
            </div>

            <div className='flex justify-between items-center'>
              <span className='text-muted-foreground'>Available</span>
              <span className='font-medium text-foreground'>{getAvailableLiquidityDisplay()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
