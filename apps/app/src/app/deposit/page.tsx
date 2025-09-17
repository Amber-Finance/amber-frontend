import { Metadata } from 'next'

import DepositClient from '@/app/deposit/DepositClient'
import { generateDepositMetadata } from '@/app/deposit/generateMetadata'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}): Promise<Metadata> {
  const params = await searchParams
  const tokenSymbol = params.token || null
  return generateDepositMetadata(tokenSymbol)
}

export default function DepositPage() {
  return <DepositClient />
}
