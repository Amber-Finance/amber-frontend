'use client'

import { motion } from 'framer-motion'

import { FirstBentoSection } from '@/components/sections/bento/FirstBentoSection'
import { SecondBentoAnimation } from '@/components/sections/bento/SecondBentoSection'
import { ThirdBentoAnimation } from '@/components/sections/bento/ThirdBentoSection'
import { BentoCard, BentoGrid } from '@/components/ui/bento-grid'
import { cn } from '@/lib/utils'

import { Background } from '../Background'
import { SectionHeader } from '../section-header'
import { DotPattern } from '../ui/dot-pattern'
import { FourthBentoSection } from './bento/FourthBentoSection'

const features = [
  {
    name: 'Bridge',
    description: 'Seamlessly bridge BRTs across multiple networks.',
    href: 'https://app.amberfi.io/swap',
    cta: 'Get Started',
    className: 'col-span-3 lg:col-span-1',
    background: <FourthBentoSection />,
  },
  {
    // Icon: BellIcon,
    name: 'Performance Analytics',
    description: 'Track your yield and returns over time with interactive charts and tooltips.',
    href: 'https://app.amberfi.io/deposit',
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
    name: 'Looping Strategies',
    description: 'Deploy looping strategies to multiply your BRT exposure with up to 10x leverage.',
    href: 'https://app.amberfi.io/strategies',
    cta: 'Explore',
    className: 'col-span-3 lg:col-span-2',
    background: <FirstBentoSection />,
  },
  {
    // Icon: CalendarIcon,
    name: 'Deposit',
    description: 'Seamlessly deposit BRTs on Amber.',
    className: 'col-span-3 lg:col-span-1',
    href: 'https://app.amberfi.io/deposit',
    cta: 'View Dashboard',
    background: <SecondBentoAnimation />,
  },
]

export function Bento() {
  return (
    <section id='bento' className='relative overflow-hidden flex flex-col '>
      <div className='absolute inset-0 -z-10'>
        <Background
          translateY={-260}
          width={380}
          height={900}
          smallWidth={160}
          duration={10}
          xOffset={70}
        />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8 }}
        className='relative flex flex-col bg-background'
      >
        <div className='relative flex items-center justify-center min-h-[420px] md:min-h-[520px] w-full overflow-hidden'>
          <div className='absolute inset-0'>
            <div className='relative w-full min-h-[420px] md:min-h-[520px]'>
              <div className='absolute inset-2 md:inset-3 [mask-image:radial-gradient(ellipse_600px_400px_at_center,white_10%,transparent_50%)]'>
                <DotPattern
                  width={20}
                  height={20}
                  cx={1}
                  cy={1}
                  cr={1}
                  className={cn('w-full h-full')}
                />
              </div>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className='relative z-10 mx-auto w-full px-8 md:px-16 max-w-3xl'
          >
            <SectionHeader>
              <div className='inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium text-white/80 backdrop-blur'>
                Product features
              </div>
              <h2 className='text-2xl md:text-3xl font-medium tracking-tighter text-center text-balance'>
                Amplify Your Bitcoin Yield
              </h2>
              <p className='text-sm text-muted-foreground text-center text-balance font-medium max-w-2xl'>
                Deposit BRTs, swap between tokens, deploy leverage strategies up to 10x, and track
                performance with real-time analytics.
              </p>
            </SectionHeader>
          </motion.div>
        </div>

        {/* Cards/content area */}
        <motion.div className='mx-auto w-full px-8 md:px-16 max-w-6xl'>
          <BentoGrid>
            {features.map((feature) => (
              <BentoCard key={feature.name} {...feature} />
            ))}
          </BentoGrid>
        </motion.div>
      </motion.div>
    </section>
  )
}
