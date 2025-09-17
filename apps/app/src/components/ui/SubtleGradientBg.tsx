import React from 'react'

import { cn } from '@/lib/utils'

interface SubtleGradientBgProps {
  variant?: 'purple' | 'blue' | 'secondary' | 'primary'
  className?: string
}

export const SubtleGradientBg: React.FC<SubtleGradientBgProps> = ({
  variant = 'primary',
  className,
}) => {
  const getGradientClass = (variant: string) => {
    switch (variant) {
      case 'purple':
        return 'bg-gradient-to-br from-purple-500/10 via-purple-600/5 to-transparent'
      case 'blue':
        return 'bg-gradient-to-br from-blue-500/10 via-blue-600/5 to-transparent'
      case 'secondary':
        return 'bg-gradient-to-br from-secondary/20 via-secondary/10 to-transparent'
      case 'primary':
      default:
        return 'bg-gradient-to-br from-primary/10 via-primary/5 to-transparent'
    }
  }

  return (
    <div
      className={cn('absolute inset-0 pointer-events-none', getGradientClass(variant), className)}
    />
  )
}
