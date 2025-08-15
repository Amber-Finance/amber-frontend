import * as React from 'react'

import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'gradient-button text-white shadow disabled:opacity-50 font-bold hover:shadow-lg hover:scale-105 transition-all duration-300 ease-in-out',
        outline:
          'bg-card text-foreground border border-border hover:bg-secondary hover:text-foreground disabled:bg-muted/30 disabled:text-muted-foreground disabled:border-muted-foreground/20 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-300 ease-in-out',
        'outline-gradient':
          'bg-card text-foreground hover:bg-card/90 transition-all duration-300 ease-in-out',
        secondary:
          'bg-card text-foreground border border-border hover:bg-muted/50 hover:text-foreground disabled:bg-muted/30 disabled:text-muted-foreground disabled:border-muted-foreground/20 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 ease-in-out',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  gradientColor?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, gradientColor, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'

    if (variant === 'outline-gradient') {
      const defaultGradient = 'bg-gradient-to-r from-gradient-start to-gradient-end'
      const gradientStyle = gradientColor ? { background: gradientColor } : {}

      return (
        <div
          className={cn(
            'p-[1px] inline-block rounded-md transition-all duration-1000 ease-in-out hover:shadow-lg',
            !gradientColor && defaultGradient,
            disabled && 'opacity-40 grayscale',
            className,
          )}
          style={gradientStyle}
        >
          <Comp
            className={cn(
              buttonVariants({ variant, size }),
              'w-full h-full',
              disabled && 'opacity-60 text-muted-foreground cursor-not-allowed',
            )}
            ref={ref}
            disabled={disabled}
            {...props}
          />
        </div>
      )
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
