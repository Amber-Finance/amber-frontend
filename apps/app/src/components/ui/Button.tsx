import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-gradient-start to-gradient-end text-foreground shadow hover:bg-primary/90 disabled:opacity-50',
        outline:
          'bg-card text-foreground border border-border hover:bg-secondary hover:text-foreground disabled:bg-muted/30 disabled:text-muted-foreground disabled:border-muted-foreground/20 disabled:cursor-not-allowed disabled:shadow-none',
        'outline-gradient': 'bg-card text-foreground hover:bg-card/90',
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
            'p-[1px] inline-block rounded-md transition-all duration-200',
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
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
