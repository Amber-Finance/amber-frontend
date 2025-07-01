import { AnimatedCircularProgressBar } from '@/components/ui/AnimatedCircularProgress'
import { cn } from '@/lib/utils'

interface ProgressCardProps {
  value: number
  label: string
  subtitle?: string
  brandColor: string
  max?: number
  min?: number
  className?: string
}

export default function ProgressCard({
  value,
  label,
  subtitle,
  brandColor,
  max = 100,
  min = 0,
  className = 'size-12 sm:size-16',
}: ProgressCardProps) {
  return (
    <div className='flex-1 flex flex-col items-center gap-2'>
      <AnimatedCircularProgressBar
        max={max}
        min={min}
        value={value}
        gaugePrimaryColor={brandColor}
        gaugeSecondaryColor={`${brandColor}20`}
        className={cn(className, 'text-[8px] sm:text-xs')}
      />
      <div className='text-center'>
        <div className='text-xs font-medium text-foreground'>{label}</div>
        {subtitle && <div className='text-xs text-muted-foreground/80'>{subtitle}</div>}
      </div>
    </div>
  )
}
