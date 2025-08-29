import { Metadata } from 'next'

import SwapClient from '@/app/swap/SwapClient'

import { metaData } from '../metadata'

export const metadata: Metadata = metaData.swap

export default function SwapPage() {
  return <SwapClient />
}
