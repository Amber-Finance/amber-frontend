import * as React from 'react'
import { cn } from '@/lib/utils'
import GlowingBorderTop from '@/components/ui/GlowingBorderTop'

interface GlassCardProps extends React.ComponentProps<'div'> {
  children: React.ReactNode
  className?: string
}

export default function GlassCard({ children, className, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        'w-full max-w-xs z-20 bg-white/5 backdrop-blur-3xl border border-white/5 flex flex-col p-4 rounded-2xl relative overflow-hidden group hover:bg-white/3 transition-all duration-300 shadow-2xl',
        className,
      )}
      {...props}
    >
      <GlowingBorderTop />

      <div className='absolute inset-0 rounded-2xl bg-gradient-to-br from-white/3 to-white/0 border border-white/10' />
      <div className='absolute inset-0 rounded-2xl bg-gradient-to-br from-card-accent via-transparent to-transparent' />
      <div className='absolute inset-0 rounded-2xl bg-gradient-to-tl from-white/1 to-transparent' />

      <div className='relative z-10 w-full h-full'>{children}</div>
    </div>
  )
}
