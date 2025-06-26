import Image from 'next/image'

export default function RunningLogo() {
  return (
    <div className='absolute top-8 left-28 z-10 flex items-center gap-3'>
      <div className='relative w-20 h-20 rounded-full p-[1.25px] overflow-hidden'>
        {/* Single rotating border effect */}
        <div
          className='absolute inset-0 w-[100px] h-[100px] -top-[2px] -left-[2px] rotate-0 animate-rotate-border'
          style={{
            background:
              'conic-gradient(transparent,transparent,transparent,#e04c2f,#e04c2f,transparent,transparent,transparent,#e04c2f,#e04c2f,transparent,transparent,transparent,#ed7644,#ed7644,transparent)',
          }}
        />

        <div className='relative w-full h-full bg-[#0f0f0f] rounded-full'>
          <Image src='/btcGolden.png' alt='logo' width={200} height={200} />
        </div>
      </div>
      <div className='bg-gradient-to-r from-[#b1241e] to-[#f79e54] bg-clip-text text-transparent font-bold text-3xl'>
        MaxBTC
      </div>
    </div>
  )
}
