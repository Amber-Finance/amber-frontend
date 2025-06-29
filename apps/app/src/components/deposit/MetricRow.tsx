import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface MetricRowProps {
  label: string
  value: string | number
  icon?: LucideIcon
  suffix?: string
  brandColor?: string
  variant?: 'default' | 'compact'
}

export default function MetricRow({
  label,
  value,
  icon: Icon,
  suffix = '',
  brandColor,
  variant = 'default',
}: MetricRowProps) {
  const isCompact = variant === 'compact'

  return (
    <div
      className={cn(
        'flex justify-between items-center p-2 rounded-lg bg-muted/20',
        isCompact && 'flex-1 min-w-[200px]',
      )}
    >
      <div className='flex items-center gap-2'>
        {Icon && <Icon className='w-3 h-3 sm:w-4 sm:h-4' style={{ color: brandColor }} />}
        <span className='text-xs font-medium text-muted-foreground'>{label}</span>
      </div>
      <span className='text-xs font-medium text-foreground'>
        {value}
        {suffix}
      </span>
    </div>
  )
}
