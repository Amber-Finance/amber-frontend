import { LucideIcon } from 'lucide-react'

interface BalanceRowProps {
  icon: LucideIcon
  label: string
  value: string
  usdValue?: string
  brandColor?: string
}

export default function BalanceRow({
  icon: Icon,
  label,
  value,
  usdValue,
  brandColor,
}: BalanceRowProps) {
  return (
    <div className='flex justify-between items-center p-2 rounded-lg bg-muted/20'>
      <div className='flex items-center gap-2'>
        <Icon className='w-3 h-3 sm:w-4 sm:h-4' style={{ color: brandColor }} />
        <span className='text-xs sm:text-sm font-medium'>{label}</span>
      </div>
      <div className='text-right'>
        <div className='text-xs sm:text-sm text-foreground font-baloo'>{value}</div>
        {usdValue && <div className='text-xs text-muted-foreground/80'>{usdValue}</div>}
      </div>
    </div>
  )
}
