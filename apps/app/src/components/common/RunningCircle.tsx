import Image from 'next/image'
import { cn } from '@/lib/utils'

export default function RunningCircle({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className='relative w-24 h-24 rounded-full p-[1.25px] overflow-hidden'>
        {/* Single rotating border effect */}
        <div
          className='absolute inset-0 w-[100px] h-[100px] -top-[2px] -left-[2px] rotate-0 animate-rotate-border'
          style={{
            background:
              'conic-gradient(transparent,transparent,transparent,#f59e0b,#f59e0b,transparent,transparent,transparent,#f97316,#f97316,transparent,transparent,transparent,#fbbf24,#fbbf24,transparent)',
          }}
        />

        <div className='relative w-full h-full bg-background rounded-full'>
          <Image src='/btcGolden.png' alt='logo' width={200} height={200} />
        </div>
      </div>
    </div>
  )
}
