import Image from 'next/image'

import BigNumber from 'bignumber.js'

import { getProtocolPoints, getProtocolPointsIcon } from '@/components/deposit/helpers'
import { useTheme } from '@/components/providers/ThemeProvider'
import { useFragments, useStructuredPoints } from '@/hooks/portfolio'

interface EarningPointsRowProps {
  /** The asset symbol to determine which points are earned (e.g., 'solvBTC', 'LBTC', 'eBTC') */
  assetSymbol: string
  /** Layout variant - 'full' shows the full section like on deposit cards, 'compact' shows abbreviated badges */
  variant?: 'full' | 'compact'
  /** Type of position - 'strategy' only shows structured points + Mars, 'deposit' shows protocol points + Mars */
  type?: 'strategy' | 'deposit'
  /** Optional custom class name */
  className?: string
  /** Optional wallet address to fetch actual points data */
  address?: string
}

export function EarningPointsRow({
  assetSymbol,
  variant = 'compact',
  type = 'deposit',
  className = '',
  address,
}: EarningPointsRowProps) {
  const { theme } = useTheme()
  const protocolPoints = getProtocolPoints(assetSymbol)
  const protocolPointsIcon = getProtocolPointsIcon(assetSymbol, theme)

  // Fetch actual points data if address is provided
  const { data: structuredPointsData } = useStructuredPoints(address)
  const { data: fragmentsData } = useFragments(address)

  // Parse structured points
  const structuredPointsRaw = structuredPointsData?.balance || '0'
  const structuredPoints = new BigNumber(structuredPointsRaw).toNumber()

  // Parse Mars fragments
  const fragmentsRaw = fragmentsData?.total_fragments?.total_accumulated || '0'
  const fragments = new BigNumber(fragmentsRaw).toNumber()

  // Format numbers with commas
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(num)
  }

  if (variant === 'full') {
    // Full variant - matches the deposits page exactly
    return (
      <div className={`space-y-3 ${className}`}>
        <div className='flex items-center justify-between'>
          <span className='text-sm text-foreground'>Earning Points</span>
          <div className='flex -space-x-2'>
            {(() => {
              const pointsData = []

              if (type === 'strategy') {
                // Strategy points: Structured Points 2x, Mars Fragments
                pointsData.push({
                  icon: '/images/structured.svg',
                  alt: 'Structured Points',
                  tooltip: address
                    ? `Structured Points: ${formatNumber(structuredPoints)}`
                    : 'Structured Points 2x',
                })
                pointsData.push({
                  icon: '/points/mars-fragments.svg',
                  alt: 'Mars Fragments',
                  tooltip: address
                    ? `Mars Fragments: ${formatNumber(fragments)}`
                    : 'Mars Fragments Points',
                })
              } else {
                // Deposit points: Protocol-specific, Mars Fragments
                // Protocol Points - Show first if they exist
                if (protocolPoints.protocolPoint && protocolPointsIcon) {
                  pointsData.push({
                    icon: protocolPointsIcon,
                    alt: protocolPoints.protocolPoint,
                    tooltip: `${protocolPoints.protocolPoint} Points ${protocolPoints.multiplier}`,
                  })
                }

                // Mars Fragments
                pointsData.push({
                  icon: '/points/mars-fragments.svg',
                  alt: 'Mars Fragments',
                  tooltip: address
                    ? `Mars Fragments: ${formatNumber(fragments)}`
                    : 'Mars Fragments Points',
                })
              }

              return pointsData.map((point) => (
                <div key={point.alt} className='group/icon relative inline-block'>
                  <div className='relative inline-block size-8 rounded-full ring-2 ring-card group-hover/icon:ring-primary/20 bg-secondary border border-border group-hover/icon:border-primary/40 p-1.5 transition-all duration-200 group-hover/icon:z-10 cursor-pointer'>
                    <Image
                      src={point.icon}
                      alt={point.alt}
                      width={20}
                      height={20}
                      className='object-contain w-full h-full'
                      unoptimized={true}
                    />
                  </div>
                  <div className='opacity-0 group-hover/icon:opacity-100 invisible group-hover/icon:visible absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 py-1.5 px-2.5 bg-card text-popover-foreground text-xs rounded-lg border border-border shadow-lg transition-all duration-200 whitespace-nowrap pointer-events-none'>
                    {point.tooltip}
                  </div>
                </div>
              ))
            })()}
          </div>
        </div>
      </div>
    )
  }

  // Compact variant - for portfolio cards above buttons
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <span className='text-xs text-muted-foreground'>Earning Points:</span>
      <div className='flex -space-x-2'>
        {(() => {
          const pointsData = []

          if (type === 'strategy') {
            // Strategy points: Structured Points 2x, Mars Fragments
            pointsData.push({
              icon: '/images/structured.svg',
              alt: 'Structured Points',
              tooltip: address
                ? `Structured Points: ${formatNumber(structuredPoints)}`
                : 'Structured Points 2x',
            })
            pointsData.push({
              icon: '/points/mars-fragments.svg',
              alt: 'Mars Fragments',
              tooltip: address
                ? `Mars Fragments: ${formatNumber(fragments)}`
                : 'Mars Fragments Points',
            })
          } else {
            // Deposit points: Protocol-specific, Mars Fragments
            // Protocol Points - Show first if they exist
            if (protocolPoints.protocolPoint && protocolPointsIcon) {
              pointsData.push({
                icon: protocolPointsIcon,
                alt: protocolPoints.protocolPoint,
                tooltip: `${protocolPoints.protocolPoint} Points ${protocolPoints.multiplier}`,
              })
            }

            // Mars Fragments
            pointsData.push({
              icon: '/points/mars-fragments.svg',
              alt: 'Mars Fragments',
              tooltip: address
                ? `Mars Fragments: ${formatNumber(fragments)}`
                : 'Mars Fragments Points',
            })
          }

          return pointsData.map((point) => (
            <div key={point.alt} className='group/icon relative inline-block'>
              <div className='relative inline-block size-6 rounded-full ring-2 ring-card group-hover/icon:ring-primary/20 bg-secondary border border-border group-hover/icon:border-primary/40 p-1 transition-all duration-200 group-hover/icon:z-10 cursor-pointer'>
                <Image
                  src={point.icon}
                  alt={point.alt}
                  width={16}
                  height={16}
                  className='object-contain w-full h-full'
                  unoptimized={true}
                />
              </div>
              <div className='opacity-0 group-hover/icon:opacity-100 invisible group-hover/icon:visible absolute z-20 bottom-full left-1/2 transform -translate-x-1/2 mb-2 py-1.5 px-2.5 bg-popover text-popover-foreground text-xs rounded-lg border border-border shadow-lg transition-all duration-200 whitespace-nowrap pointer-events-none'>
                {point.tooltip}
              </div>
            </div>
          ))
        })()}
      </div>
    </div>
  )
}
