import { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface InfoCardProps {
  title: string
  children: ReactNode
  className?: string
}

export default function InfoCard({ title, children, className }: InfoCardProps) {
  return (
    <div className={cn('bg-card/50 backdrop-blur-sm border rounded-lg p-3 sm:p-4', className)}>
      <h3 className='text-sm font-semibold text-foreground mb-3'>{title}</h3>
      {children}
    </div>
  )
}
