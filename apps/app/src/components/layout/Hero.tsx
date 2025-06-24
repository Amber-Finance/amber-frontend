import { Button } from '@/components/ui/Button'
import RunningCircle from '@/components/common/RunningCircle'

export default function Hero() {
  return (
    <section className='relative w-full my-15 text-center'>
      {/* Background circle */}
      <div className='absolute left-1/2 top-1/2 w-[1200px] h-[1200px] -translate-x-1/2 -translate-y-[85%] rounded-full border border-hero-border -z-10' />

      <div className='relative'>
        <RunningCircle />
        <h1 className='absolute bottom-1/4 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-10 text-6xl font-medium tracking-wider bg-gradient-to-b from-hero-gradient-from to-hero-gradient-to bg-clip-text text-transparent'>
          Max BTC
        </h1>
      </div>

      <p className='mx-auto py-4 max-w-xl text-sm text-muted-text'>
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Harum nisi excepturi ipsa, iure
        eos, illo voluptatum, minus in velit aperiam debitis.
      </p>

      <Button variant='hero' size='lg' className='mt-2'>
        BRIDGE NOW
      </Button>
    </section>
  )
}
