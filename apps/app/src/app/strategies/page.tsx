import { Metadata } from 'next'

import StrategiesClient from '@/app/strategies/StrategiesClient'

import { metaData } from '../metadata'

export const metadata: Metadata = metaData.strategies

export default function StrategiesPage() {
  return <StrategiesClient />
}
