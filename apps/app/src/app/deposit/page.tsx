import Hero from '@/components/layout/Hero'
import { AuroraText } from '@/components/ui/AuroraText'
import { ComingSoonOverlay } from '@/components/ui/ComingSoonOverlay'

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
