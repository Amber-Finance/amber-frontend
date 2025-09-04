import { Metadata } from 'next'

import { metaData } from '@/app/metadata'
import SwapClient from '@/app/swap/SwapClient'

export const metadata: Metadata = metaData.swap

export default function SwapPage() {
  return <SwapClient />
}
