import { Metadata } from 'next'

import { generateDepositMetadata } from '@/app/deposit/generateDepositMetadata'
import Hero from '@/components/layout/Hero'
import { AuroraText } from '@/components/ui/AuroraText'
import { ComingSoonOverlay } from '@/components/ui/ComingSoonOverlay'

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
  return (
    <>
      <Hero
        title='Deposit Assets'
        subtitle={<AuroraText>Earn Yield</AuroraText>}
        description='Deposit your liquid staking tokens and start earning yield immediately.'
        stats={[
          {
            value: 0,
            label: 'Total TVL',
            isCurrency: true,
            prefix: '$',
          },
        ]}
      />

      {/* Coming Soon Overlay */}
      <ComingSoonOverlay />
    </>
  )
}
