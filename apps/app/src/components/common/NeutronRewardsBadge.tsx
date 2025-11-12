import Image from 'next/image'

import { Info } from 'lucide-react'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
import { getNeutronApyForSymbol, useNeutronRewardsApy } from '@/hooks/portfolio'
import { cn } from '@/lib/utils'

interface NeutronRewardsBadgeProps {
  symbol: string // Token symbol (e.g., 'wbtc', 'unibtc', 'maxbtc-wbtc')
  variant?: 'compact' | 'default' | 'inline' // Display variant
  className?: string
}

export function NeutronRewardsBadge({
  symbol,
  variant = 'default',
  className = '',
}: NeutronRewardsBadgeProps) {
  const { data: neutronRewardsData } = useNeutronRewardsApy()

  // Get APY for the specific symbol
  const apy = getNeutronApyForSymbol(neutronRewardsData, symbol)

  // Don't render if APY is 0 or not available
  if (!apy || apy === 0) {
    return null
  }

  const tooltipContent = (
    <div className='max-w-xs'>
      <p className='font-semibold mb-2'>Additional Neutron (NTRN) Rewards</p>
      <p className='text-xs leading-relaxed'>
        Your deposit will earn additional Neutron (NTRN) Rewards.{' '}
        <span className='font-semibold text-amber-400'>ATTENTION:</span> Don't reduce or withdraw
        your position after depositing, as this would forfeit your NTRN rewards. You can still add
        to your position safely.
      </p>
      <p className='text-xs mt-2 font-medium text-primary'>Current APY: {apy.toFixed(2)}%</p>
    </div>
  )

  // Compact variant - just the icon with tooltip
  if (variant === 'compact') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('flex items-center gap-1 cursor-help', className)}>
            <Image
              src='/images/neutron/neutron.svg'
              alt='Neutron Rewards'
              width={16}
              height={16}
              className='opacity-90'
            />
            <Info className='w-3 h-3 text-muted-foreground' />
          </div>
        </TooltipTrigger>
        <TooltipContent side='top' className='max-w-xs'>
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    )
  }

  // Inline variant - small badge style
  if (variant === 'inline') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 border border-primary/20 cursor-help',
              className,
            )}
          >
            <Image
              src='/images/neutron/neutron.svg'
              alt='Neutron Rewards'
              width={14}
              height={14}
              className='opacity-90'
            />
            <span className='text-xs font-medium text-foreground'>+{apy.toFixed(2)}% NTRN</span>
            <Info className='w-3 h-3 text-muted-foreground' />
          </div>
        </TooltipTrigger>
        <TooltipContent side='top' className='max-w-xs'>
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    )
  }

  // Default variant - full display
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            'flex items-center justify-between gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 cursor-help hover:bg-primary/10 transition-colors',
            className,
          )}
        >
          <div className='flex items-center gap-2'>
            <Image
              src='/images/neutron/neutron.svg'
              alt='Neutron Rewards'
              width={20}
              height={20}
              className='opacity-90'
            />
            <div className='flex flex-col'>
              <span className='text-xs font-medium text-muted-foreground'>Neutron Rewards</span>
              <span className='text-sm font-semibold text-foreground'>+{apy.toFixed(2)}% APY</span>
            </div>
          </div>
          <Info className='w-4 h-4 text-muted-foreground flex-shrink-0' />
        </div>
      </TooltipTrigger>
      <TooltipContent side='top' className='max-w-xs'>
        {tooltipContent}
      </TooltipContent>
    </Tooltip>
  )
}
