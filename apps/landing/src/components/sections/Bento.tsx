import { FirstBentoSection } from '@/components/sections/bento/FirstBentoSection'
import { SecondBentoAnimation } from '@/components/sections/bento/SecondBentoSection'
import { ThirdBentoAnimation } from '@/components/sections/bento/ThirdBentoSection'
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid'

import { SectionHeader } from '../section-header'
import { FourthBentoSection } from './bento/FourthBentoSection'

const features = [
  {
    name: 'Deposit & Bridge',
    description:
      'Seamlessly deposit and bridge BTC liquid staking tokens across multiple networks.',
    href: '#',
    cta: 'Get Started',
    className: 'col-span-3 lg:col-span-1',
    background: <FourthBentoSection />,
  },
  {
    // Icon: BellIcon,
    name: 'Performance Analytics',
    description: 'Track your yield and returns over time with interactive charts and tooltips.',
    href: '#',
    cta: 'Learn More',
    className: 'col-span-3 lg:col-span-2',
    background: (
      <ThirdBentoAnimation
        data={[20, 30, 25, 45, 40, 55, 75]}
        color='rgba(255, 115, 0, 1)'
        toolTipValues={[2.9, 3.5, 4.21, 6.85, 9.3, 8.78, 12.6, 15.7]}
      />
    ),
  },
  {
    // Icon: Share2Icon,
    name: 'Automated Strategies',
    description: 'Deploy and manage smart strategies to maximize yield in any market.',
    href: '#',
    cta: 'Explore',
    className: 'col-span-3 lg:col-span-2',
    background: <FirstBentoSection />,
  },
  {
    // Icon: CalendarIcon,
    name: 'Portfolio Overview',
    description: 'Visualize and organize your assets with intuitive, real-time dashboards.',
    className: 'col-span-3 lg:col-span-1',
    href: '#',
    cta: 'View Dashboard',
    background: <SecondBentoAnimation />,
  },
]

export function Bento() {
  return (
    <section id='bento' className='py-14'>
      <div className='relative overflow-hidden pb-10'>
        {/* Section Header */}
        <SectionHeader>
          <h2 className='text-3xl md:text-4xl font-medium tracking-tighter text-center text-balance'>
            Discver BTC yield opportunities
          </h2>
          <p className='text-muted-foreground text-center text-balance font-medium'>
            The best way to earn BTC with your assets in a safe and easy way
          </p>
        </SectionHeader>
      </div>
      <div className='container mx-auto px-8 md:px-16'>
        <BentoGrid>
          {features.map((feature, idx) => (
            <BentoCard key={idx} {...feature} />
          ))}
        </BentoGrid>
      </div>
    </section>
  )
}
