import { ComponentPropsWithoutRef, ReactNode } from 'react'

import { ArrowRightIcon } from '@radix-ui/react-icons'

import { cn } from '@/lib/utils'

interface BentoGridProps extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode
  className?: string
}

interface BentoCardProps extends ComponentPropsWithoutRef<'a'> {
  name: string
  className: string
  background: ReactNode
  Icon?: React.ElementType
  description: string
  href: string
  cta: string
}

const BentoGrid = ({ children, className, ...props }: BentoGridProps) => {
  return (
    <div className={cn('grid w-full auto-rows-[22rem] grid-cols-3 gap-4', className)} {...props}>
      {children}
    </div>
  )
}

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
  ...props
}: BentoCardProps) => (
  <a
    key={name}
    href={href}
    className={cn(
      'group relative col-span-2 lg:col-span-1 flex flex-col justify-between overflow-hidden rounded-xl h-[22rem]',
      // light styles
      'bg-background [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]',
      // dark styles
      'transform-gpu dark:bg-background dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-10px_30px_-10px_#ffffff1f_inset]',
      className,
    )}
    {...props}
  >
    <div>{background}</div>
    <div className='p-4'>
      <div className='flex flex-col gap-1'>
        {Icon && (
          <Icon className='h-12 w-12 origin-left transform-gpu text-neutral-700 transition-all duration-300 ease-in-out group-hover:scale-75' />
        )}
        <h3 className='text-xl font-semibold text-neutral-700 dark:text-neutral-300'>{name}</h3>
        <p className='max-w-lg text-neutral-400'>{description}</p>
      </div>

      <div
        className={cn(
          'lg:hidden pointer-events-none flex w-full translate-y-0 transform-gpu flex-row items-center transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100',
        )}
      >
        <div className='pointer-events-auto p-0 text-sm font-medium text-neutral-700 dark:text-neutral-300 flex items-center'>
          {cta}
          <ArrowRightIcon className='ms-2 h-4 w-4 rtl:rotate-180' />
        </div>
      </div>
    </div>

    <div className='absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-md opacity-0 transition-all duration-300 group-hover:opacity-100'>
      <div className='pointer-events-auto text-lg font-medium text-neutral-700 dark:text-neutral-300 flex items-center'>
        {cta}
        <ArrowRightIcon className='ms-2 h-5 w-5 rtl:rotate-180' />
      </div>
    </div>
  </a>
)

export { BentoCard, BentoGrid }
