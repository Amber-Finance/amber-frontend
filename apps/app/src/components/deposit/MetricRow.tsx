import Image from 'next/image'

import { Info, LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface MetricRowProps {
  label: string
  value: string | number
  icon?: LucideIcon
  customIcon?: string
  suffix?: string
  brandColor?: string
  variant?: 'default' | 'compact'
  showTooltipForNA?: boolean
  tooltipMessage?: string
}

export default function MetricRow({
  label,
  value,
  icon: Icon,
  customIcon,
  suffix = '',
  brandColor,
  variant = 'default',
  showTooltipForNA = false,
  tooltipMessage = 'This LST doesn&apos;t generate any yield.',
}: MetricRowProps) {
  const isCompact = variant === 'compact'
  const isNA = value === 'N/A'
  const shouldShowTooltip = showTooltipForNA && isNA

  return (
    <div
      className={cn(
        'flex justify-between items-center p-2 rounded-lg bg-muted/20',
        isCompact && 'flex-1 min-w-[200px]',
      )}
    >
      <div className='flex items-center gap-2'>
        {customIcon ? (
          <Image src={customIcon} alt={label} width={12} height={12} />
        ) : Icon ? (
          <Icon className='w-3 h-3 sm:w-4 sm:h-4' style={{ color: brandColor }} />
        ) : null}
        <span className='text-xs font-medium text-muted-foreground'>{label}</span>
      </div>
      <div className='flex items-center gap-1'>
        <span
          className={cn(
            'text-xs font-medium',
            isNA ? 'text-muted-foreground/60' : 'text-foreground',
          )}
        >
          {value}
          {suffix}
        </span>
        {shouldShowTooltip && (
          <div className='relative group/tooltip'>
            <Info className='w-3 h-3 text-muted-foreground/40 hover:text-muted-foreground/60 cursor-help transition-colors' />
            <div className='absolute bottom-full right-0 mb-2 w-64 p-2 bg-background border border-border rounded-md shadow-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 pointer-events-none z-50'>
              <p className='text-xs text-muted-foreground'>
                <span className='font-bold text-foreground'>No underlying yield available.</span>
                <br />
                {tooltipMessage}
              </p>
              <div className='absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-border'></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
