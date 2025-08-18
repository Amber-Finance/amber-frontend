import { Info } from 'lucide-react'

import { useTheme } from '@/components/providers/ThemeProvider'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip'
import {
  getNeutronIcon,
  getProtocolPoints,
  getProtocolPointsIcon,
} from '@/utils/depositCardHelpers'

interface PointsCampaignTooltipProps {
  token: {
    symbol: string
  }
}

export default function PointsCampaignTooltip({ token }: PointsCampaignTooltipProps) {
  const { theme } = useTheme()
  type ProtocolPoints = {
    multiplier: string
    protocolPoint?: string
    protocolIconLight?: string
    protocolIconDark?: string
  }
  const protocolPoints: ProtocolPoints = token
    ? getProtocolPoints(token.symbol)
    : { multiplier: '1X' }
  const protocolPointsIcon = token && theme ? getProtocolPointsIcon(token.symbol, theme) : null
  const neutronIcon = theme ? getNeutronIcon(theme) : null

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className='w-3 h-3 text-muted-foreground/40 hover:text-muted-foreground/60 cursor-help transition-colors' />
      </TooltipTrigger>
      <TooltipContent>
        <div className='space-y-2'>
          <div className='flex items-center gap-2 px-1'>
            <span className='text-sm font-bold text-foreground'>Points Campaign</span>
          </div>
          <div className='text-xs text-muted-foreground space-y-1 px-1'>
            {protocolPoints.protocolPoint && protocolPointsIcon && (
              <p className='flex items-center gap-2'>
                <span className='inline-flex w-3 h-3 items-center'>
                  <img
                    src={protocolPointsIcon}
                    alt={protocolPoints.protocolPoint}
                    width={12}
                    height={12}
                    className='object-contain w-full h-full'
                    style={{ display: 'inline-block' }}
                  />
                </span>
                <span>{protocolPoints.protocolPoint}</span>
                {protocolPoints.multiplier && (
                  <span className='font-bold'>({protocolPoints.multiplier})</span>
                )}
              </p>
            )}
            <p className='flex items-center gap-2'>
              <span className='inline-flex w-3 h-3 items-center'>
                <img
                  src={neutronIcon || ''}
                  alt='Neutron Points'
                  width={12}
                  height={12}
                  className='object-contain w-full h-full'
                  style={{ display: 'inline-block' }}
                />
              </span>
              <span>Neutron Points</span>
            </p>
            <p className='flex items-center gap-2'>
              <span className='inline-flex w-3 h-3 items-center'>
                <img
                  src='/points/mars-fragments.svg'
                  alt='Mars Fragments'
                  width={12}
                  height={12}
                  className='object-contain w-full h-full'
                  style={{ display: 'inline-block' }}
                />
              </span>
              <span>Mars Fragments</span>
            </p>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
