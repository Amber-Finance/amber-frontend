import { Suspense } from 'react'

import StatsContent from '@/app/StatsContent'

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StatsContent />
    </Suspense>
  )
}
