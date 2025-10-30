import { ComponentPropsWithoutRef } from 'react'

import { cn } from '@/utils/ui'

export function Skeleton({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  return <div className={cn('animate-pulse rounded-md bg-muted/40', className)} {...props} />
}
