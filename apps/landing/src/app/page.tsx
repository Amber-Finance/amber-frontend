import { Hero } from '@/components/hero'
import { Audits } from '@/components/sections/Audits'
import { Bento } from '@/components/sections/Bento'
import { MarsFork } from '@/components/sections/MarsFork'

export default function Home() {
  return (
    <div className='flex flex-col gap-16'>
      <Hero />
      <MarsFork />
      <Audits />
      <Bento />
    </div>
  )
}
