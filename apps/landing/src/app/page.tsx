import { Hero } from '@/components/hero'
import { Partners } from '@/components/sections/Partners'

export default function Home() {
  return (
    <div className='flex flex-col'>
      <Hero />
      <Partners />
    </div>
  )
}
