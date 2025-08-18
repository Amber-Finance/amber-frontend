import React from 'react'

import { cn } from '@/lib/utils'

interface HoverBaseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
}

export const HoverBaseButton = React.forwardRef<HTMLButtonElement, HoverBaseButtonProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'group relative tracking-wider flex items-center px-5 text-xs rounded-md transition-all duration-300 border border-transparent text-muted-foreground hover:text-foreground cursor-pointer overflow-hidden',
          className,
        )}
        {...props}
      >
        {children}
      </button>
    )
  },
)

HoverBaseButton.displayName = 'InteractiveHoverButton'
