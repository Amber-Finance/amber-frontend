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

  // Helper function to get multipliers based on asset and type
  const getMultipliers = () => {
    const assetLower = assetSymbol.toLowerCase()

    if (type === 'deposit') {
      if (assetLower === 'wbtc') {
        return {
          neutron: '3x',
          mars: '', // No multiplier shown for 1x
          showStructured: false,
        }
      } else {
        return {
          neutron: '2x',
          mars: '', // No multiplier shown for 1x
          showStructured: false,
        }
      }
    } else {
      // strategy
      return {
        neutron: '', // No multiplier shown for 1x
        mars: '', // No multiplier shown for 1x
        showStructured: true,
      }
    }
  }

  const multipliers = getMultipliers()

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

          {/* Structured Points - Show for strategies and WBTC deposits */}
          {multipliers.showStructured && (
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
              {type === 'strategy' && <span className='font-semibold'>2x</span>}
            </Badge>
          )}

          {/* Neutron Rewards - Show for deposits and strategies */}
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
            {multipliers.neutron && <span className='font-semibold'>{multipliers.neutron}</span>}
          </Badge>

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
            {multipliers.mars && <span className='font-semibold'>{multipliers.mars}</span>}
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

          // Add Structured Points for strategies and WBTC deposits
          if (multipliers.showStructured) {
            badges.push(
              <Badge key='structured' variant='secondary' className='text-xs px-1.5 py-0.5'>
                Structured{type === 'strategy' ? ' 2x' : ''}
              </Badge>,
            )
          }

          // Add Neutron for both deposits and strategies
          badges.push(
            <Badge key='neutron' variant='secondary' className='text-xs px-1.5 py-0.5'>
              NTRN{multipliers.neutron ? ` ${multipliers.neutron}` : ''}
            </Badge>,
          )

          // Always add Mars Fragments
          badges.push(
            <Badge key='mars' variant='secondary' className='text-xs px-1.5 py-0.5'>
              MARS{multipliers.mars ? ` ${multipliers.mars}` : ''}
            </Badge>,
          )

          return badges
        })()}
      </div>
    </div>
  )
}
