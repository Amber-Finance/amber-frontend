import Image from 'next/image'

export default function RunningCircle() {
  return (
    <div className='flex items-center justify-center'>
      <div className='relative w-36 h-36 rounded-full p-[1.25px] overflow-hidden'>
        {/* Single rotating border effect */}
        <div
          className='absolute inset-0 w-[150px] h-[150px] -top-[2px] -left-[2px] rotate-0 animate-rotate-border'
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
