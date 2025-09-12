import { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface InfoAlertProps {
  title: string
  children: ReactNode
  variant?: 'default' | 'blue' | 'green' | 'yellow' | 'red'
  className?: string
}

const variantStyles = {
  default: 'bg-muted/20 border-border/50',
  blue: 'bg-blue-500/10 border-blue-500/20 dark:bg-blue-900/20 dark:border-blue-700/30',
  green: 'bg-green-500/10 border-green-500/20 dark:bg-green-900/20 dark:border-green-700/30',
  yellow: 'bg-yellow-500/10 border-yellow-500/20 dark:bg-yellow-900/20 dark:border-yellow-700/30',
  red: 'bg-red-500/10 border-red-500/20 dark:bg-red-900/20 dark:border-red-700/30',
}

const variantTitleStyles = {
  default: 'text-foreground',
  blue: 'text-blue-700 dark:text-blue-400',
  green: 'text-green-700 dark:text-green-400',
  yellow: 'text-yellow-700 dark:text-yellow-400',
  red: 'text-red-700 dark:text-red-400',
}

const variantContentStyles = {
  default: 'text-muted-foreground',
  blue: 'text-blue-700/80 dark:text-blue-400/80',
  green: 'text-green-700/80 dark:text-green-400/80',
  yellow: 'text-yellow-700/80 dark:text-yellow-400/80',
  red: 'text-red-700/80 dark:text-red-400/80',
}

export function InfoAlert({ title, children, variant = 'default', className }: InfoAlertProps) {
  return (
    <div className={cn('p-2 rounded-lg border', variantStyles[variant], className)}>
      <div className={cn('text-xs font-medium mb-1', variantTitleStyles[variant])}>{title}</div>
      <div className={cn('text-xs', variantContentStyles[variant])}>{children}</div>
    </div>
  )
}
