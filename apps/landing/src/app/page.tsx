import { Hero } from '@/components/hero'
import { Bento } from '@/components/sections/Bento'
import { Partners } from '@/components/sections/Partners'

export default function Home() {
  return (
    <div className='flex flex-col'>
      <Hero />
      <Partners />
      <Bento />
    </div>
  )
}
