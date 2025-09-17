import Hero from '@/components/layout/Hero'
import { AuroraText } from '@/components/ui/AuroraText'
import { ComingSoonOverlay } from '@/components/ui/ComingSoonOverlay'

export default function StrategiesOverview() {
  return (
    <>
      <Hero
        title={<AuroraText>Looping</AuroraText>}
        subtitle='maxBTC Strategies'
        description='Amplify your maxBTC yields with leverage strategies - all with just a few clicks'
        stats={[
          {
            value: 0,
            label: 'Total Borrow',
            isCurrency: true,
            prefix: '$',
          },
          {
            value: 0,
            label: 'Total Supply',
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
