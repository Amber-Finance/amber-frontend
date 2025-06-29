import React from 'react'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HoverBaseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
  dotColor?: string
}

export const HoverBaseButton = React.forwardRef<HTMLButtonElement, HoverBaseButtonProps>(
  ({ children, className, dotColor = 'bg-primary', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'group relative w-auto cursor-pointer overflow-hidden rounded-full border bg-background p-2 px-6 text-center font-semibold',
          className,
        )}
        {...props}
      >
        <div className='flex items-center gap-2'>
          <div
            className={cn(
              'h-2 w-2 rounded-full transition-all duration-300 group-hover:scale-[100.8]',
              dotColor,
            )}
          ></div>
          <span className='inline-block transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0'>
            {children}
          </span>
        </div>
        <div className='absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 text-foreground opacity-0 transition-all duration-300 group-hover:-translate-x-5 group-hover:opacity-100'>
          <span>{children}</span>
          <ArrowRight />
        </div>
      </button>
    )
  },
)

HoverBaseButton.displayName = 'InteractiveHoverButton'
