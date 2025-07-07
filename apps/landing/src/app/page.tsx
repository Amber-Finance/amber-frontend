import SplineObject from '@/components/SplineObject'

export default function LandingPage() {
  return (
    <div className='relative w-full h-screen'>
      <div className='absolute inset-0 w-full h-full'>
        <SplineObject />
      </div>

      <div className='relative z-10 h-full flex items-center'>
        <div className='container mx-auto px-4'>
          <div className='max-w-3xl'>
            <div className='text-white'>
              <h1 className='text-5xl font-funnel mb-6 tracking-wider font-normal'>
                Preserve Value.
                <br />
                <span className='bg-gradient-to-b from-[#b1241e] to-[#f57136] bg-clip-text text-transparent'>
                  Generate Wealth.
                </span>
              </h1>
              <p className='text-xl mb-8 text-muted-foreground'>
                Put your liquid staking tokens to work. Earn maximum yield on your Bitcoin LSTs.
                Increase your exposure to maxBTC and leverage loop with smart strategies.
              </p>
              <div className='flex'>
                <div className='slanted-border p-[2px] inline-block bg-gradient-to-r from-[#b1241e] to-[#f57136] rounded-l-lg group'>
                  <a
                    href='https://app.amberfi.io'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='slanted-btn bg-gradient-to-r from-[#b1241e] to-[#f57136] text-white font-medium py-2 px-8 w-full h-full text-sm rounded-l-lg relative overflow-hidden inline-flex items-center justify-center'
                  >
                    <span className='relative z-10'>Enter App</span>
                    <span className='absolute inset-0 bg-gradient-to-r from-[#f57136] to-[#b1241e] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-l-lg' />
                  </a>
                </div>
                <div className='slanted-border-2 p-[2px] inline-block bg-gradient-to-r from-[#b1241e] to-[#f57136] rounded-r-lg group'>
                  <a
                    href='https://docs.amberfi.io'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='slanted-btn-2 bg-[#0f0f0f] text-white font-medium py-2 px-8 w-full h-full text-sm rounded-r-lg relative overflow-hidden inline-flex items-center justify-center'
                  >
                    <span className='relative z-10'>Learn More</span>
                    <span className='absolute inset-0 bg-gradient-to-r from-[#b1241e] to-[#f57136] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-r-lg' />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer overlay to hide Spline watermark */}
      <footer className='absolute bottom-0 right-0 w-full h-16 bg-[#0f0f0f] z-10'>
        <div className='h-full flex items-center justify-center text-white text-sm opacity-70'></div>
      </footer>
    </div>
    // <div className="relative w-full min-h-screen">
    //   {/* Main content */}
    //   <main className="mx-auto w-full min-h-screen flex items-center">
    //     <div className="container mx-auto px-4 flex items-center justify-between">
    //       {/* Left side - Text content */}
    //       <div className="flex-1 max-w-2xl">
    //         <div className="text-white">
    //           <h1 className="text-[70px] font-bold mb-4 tracking-wider bg-gradient-to-b from-[rgb(239,121,87)] to-[rgba(239,117,51,255)] bg-clip-text text-transparent">
    //           Stake Your Bitcoin
    //            </h1>
    //           <p className="text-2xl mb-8 text-muted-foreground">
    //             Bridge your liquid staking tokens and earn maximum yield. Get both
    //             staking rewards plus additional lending APY on your Bitcoin LSTs.
    //           </p>
    //         <div className="flex">
    //         <div className="slanted-border p-[2px] inline-block bg-gradient-to-r from-red-700 to-yellow-700">
    //           <button className="slanted-btn bg-gradient-to-r from-red-700 to-yellow-700 text-white font-medium py-2 px-8 w-full h-full">
    //             Enter App
    //           </button>
    //         </div>
    //         <div className="slanted-border-2 p-[2px] inline-block bg-gradient-to-r from-red-700 to-yellow-700">
    //           <button className="slanted-btn-2 bg-[#0f0f0f] text-white font-medium py-2 px-8 w-full h-full">
    //             Learn More
    //           </button>
    //         </div>
    //         </div>
    //         </div>
    //       </div>

    //       {/* Right side - Spline Object */}
    //       <div className="flex-1 h-screen">
    //         <SplineObject />
    //       </div>
    //     </div>
    //   </main>

    //   {/* Footer overlay to hide Spline watermark */}
    //   <footer className="absolute bottom-0 right-0 w-full h-16 bg-[#0A0B10] z-10">
    //     <div className="h-full flex items-center justify-center text-white text-sm opacity-70">
    //     </div>
    //   </footer>
    // </div>
  )
}
