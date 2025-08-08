import { Hero } from '@/components/hero'
import { Audits } from '@/components/sections/Audits'
import { Bento } from '@/components/sections/Bento'
import { MarsFork } from '@/components/sections/MarsFork'
import { Partners } from '@/components/sections/Partners'

export default function Home() {
  return (
    <div className='flex flex-col'>
      <Hero />
      <Partners />
      <MarsFork />
      <Audits />
      <Bento />
    </div>
  )
}
