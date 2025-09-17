import Hero from '@/components/layout/Hero'
import { AuroraText } from '@/components/ui/AuroraText'
import { ComingSoonOverlay } from '@/components/ui/ComingSoonOverlay'

const Portfolio = () => {
  return (
    <>
      <Hero
        title={<AuroraText>Portfolio</AuroraText>}
        subtitle='Your Positions'
        description='Manage your active strategies and track your performance'
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

      <ComingSoonOverlay />
    </>
  )
}

export default Portfolio
