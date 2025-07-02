import { Metadata } from 'next'

import DepositClient from '@/app/deposit/DepositClient'

import { metaData } from '../metadata'

export const metadata: Metadata = metaData.deposit

export default function DepositPage() {
  return <DepositClient />
}
