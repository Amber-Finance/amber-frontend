'use client'

import Hero from '@/components/layout/Hero'
import { AuroraText } from '@/components/ui/AuroraText'

export default function Home() {
  return (
    <div className=''>
      <Hero
        title='Stats'
        subtitle={<AuroraText>Dashboard</AuroraText>}
        description='Analytics and monitoring dashboard of Amber Finance.'
      />
    </div>
  )
}
