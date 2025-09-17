import Image from 'next/image'

import { useTheme } from '@/components/providers/ThemeProvider'
import { Badge } from '@/components/ui/badge'
import { getProtocolPoints, getProtocolPointsIcon } from '@/utils/depositCardHelpers'

interface EarningPointsRowProps {
  /** The asset symbol to determine which points are earned (e.g., 'solvBTC', 'LBTC', 'eBTC') */
  assetSymbol: string
  /** Layout variant - 'full' shows the full section like on deposit cards, 'compact' shows abbreviated badges */
  variant?: 'full' | 'compact'
  /** Type of position - 'strategy' only shows structured points + Mars, 'deposit' shows all points including Neutron */
  type?: 'strategy' | 'deposit'
  /** Optional custom class name */
  className?: string
}

export function EarningPointsRow({
  assetSymbol,
  variant = 'compact',
  type = 'deposit',
  className = '',
}: EarningPointsRowProps) {
  const { theme } = useTheme()
  const protocolPoints = getProtocolPoints(assetSymbol)
  const protocolPointsIcon = getProtocolPointsIcon(assetSymbol, theme)

  if (variant === 'full') {
    // Full variant - matches the deposits page exactly
    return (
      <div className={`space-y-3 ${className}`}>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-semibold text-foreground'>Earning Points</span>
        </div>
        <div className='flex flex-wrap gap-2'>
          {/* Protocol Points - Show first if they exist */}
          {protocolPoints.protocolPoint && protocolPointsIcon && (
            <Badge variant='secondary' className='text-xs gap-1.5'>
              <div className='w-3 h-3 flex-shrink-0'>
                <Image
                  src={protocolPointsIcon}
                  alt={protocolPoints.protocolPoint}
                  width={12}
                  height={12}
                  className='object-contain w-full h-full'
                  unoptimized={true}
                />
              </div>
              <span>{protocolPoints.protocolPoint}</span>
              <span className='font-semibold'>{protocolPoints.multiplier}</span>
            </Badge>
          )}

          {/* Structured Points - Only show for strategies */}
          {type === 'strategy' && (
            <Badge variant='secondary' className='text-xs gap-1.5'>
              <div className='w-3 h-3 flex-shrink-0'>
                <Image
                  src='/images/structured.svg'
                  alt='Structured Points'
                  width={12}
                  height={12}
                  className='object-contain w-full h-full'
                />
              </div>
              <span>Structured Points</span>
              <span className='font-semibold'>2x</span>
            </Badge>
          )}

          {/* Neutron Rewards - Only show for deposits */}
          {type === 'deposit' && (
            <Badge variant='secondary' className='text-xs gap-1.5'>
              <div className='w-3 h-3 flex-shrink-0'>
                <Image
                  src='/images/neutron/neutron.svg'
                  alt='Neutron'
                  width={12}
                  height={12}
                  className='object-contain w-full h-full'
                />
              </div>
              <span>Neutron</span>
            </Badge>
          )}

          {/* Mars Fragments - Always show */}
          <Badge variant='secondary' className='text-xs gap-1.5'>
            <div className='w-3 h-3 flex-shrink-0'>
              <Image
                src='/points/mars-fragments.svg'
                alt='Mars Fragments'
                width={12}
                height={12}
                className='object-contain w-full h-full'
              />
            </div>
            <span>Mars Fragments</span>
          </Badge>
        </div>
      </div>
    )
  }

  // Compact variant - for portfolio cards above buttons
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <span className='text-xs text-muted-foreground'>Earning Points:</span>
      <div className='flex gap-1'>
        {(() => {
          const badges = []

          // Add protocol points if they exist
          if (protocolPoints.protocolPoint) {
            badges.push(
              <Badge key='protocol' variant='secondary' className='text-xs px-1.5 py-0.5'>
                {protocolPoints.protocolPoint.split(' ')[0]} {protocolPoints.multiplier}
              </Badge>,
            )
          }

          // Add Structured Points only for strategies
          if (type === 'strategy') {
            badges.push(
              <Badge key='structured' variant='secondary' className='text-xs px-1.5 py-0.5'>
                Structured 2x
              </Badge>,
            )
          }

          // Add Neutron only for deposits
          if (type === 'deposit') {
            badges.push(
              <Badge key='neutron' variant='secondary' className='text-xs px-1.5 py-0.5'>
                NTRN
              </Badge>,
            )
          }

          // Always add Mars Fragments
          badges.push(
            <Badge key='mars' variant='secondary' className='text-xs px-1.5 py-0.5'>
              MARS
            </Badge>,
          )

          return badges
        })()}
      </div>
    </div>
  )
}
