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
              <h1 className='text-[60px] font-bold mb-6 tracking-wider bg-gradient-to-b from-[#b1241e] to-[#f57136] bg-clip-text text-transparent'>
                Stake Your Bitcoin
              </h1>
              <p className='text-xl mb-8 text-muted-foreground'>
                Bridge your liquid staking tokens and earn maximum yield. Get both staking rewards
                plus additional lending APY on your Bitcoin LSTs.
              </p>
              <div className='flex'>
                <div className='slanted-border p-[2px] inline-block bg-gradient-to-r from-[#b1241e] to-[#f57136]'>
                  <button className='slanted-btn bg-gradient-to-r from-[#b1241e] to-[#f57136]  text-white font-medium py-2 px-8 w-full h-full'>
                    Enter App
                  </button>
                </div>
                <div className='slanted-border-2 p-[2px] inline-block bg-gradient-to-r from-[#b1241e] to-[#f57136]'>
                  <button className='slanted-btn-2 bg-[#0f0f0f] text-white font-medium py-2 px-8 w-full h-full'>
                    Learn More
                  </button>
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
