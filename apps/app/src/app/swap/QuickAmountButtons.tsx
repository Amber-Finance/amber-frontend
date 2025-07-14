import React from 'react'

import { cn } from '@/lib/utils'

interface QuickAmountButtonsProps {
  onSelect: (percent: number) => void
  disabled?: boolean
  className?: string
}

const QUICK_AMOUNTS = [0.25, 0.5, 0.75, 1]
const LABELS = ['25%', '50%', '75%', 'Max']

export const QuickAmountButtons: React.FC<QuickAmountButtonsProps> = ({
  onSelect,
  disabled,
  className,
}) => {
  return (
    <div className={cn('absolute right-2 top-2 flex gap-1 z-10', className)}>
      {QUICK_AMOUNTS.map((percent, idx) => (
        <button
          key={percent}
          type='button'
          className='px-2.5 py-0.5 rounded-lg border text-xs font-medium transition-colors bg-muted/30 border-border hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
          onClick={() => onSelect(percent)}
          disabled={disabled}
        >
          {LABELS[idx]}
        </button>
      ))}
    </div>
  )
}

export default QuickAmountButtons
