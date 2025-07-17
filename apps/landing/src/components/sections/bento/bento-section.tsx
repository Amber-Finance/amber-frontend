'use client'

import { SectionHeader } from '@/components/section-header'

import { FirstBentoSection } from './FirstBentoSection'
import { SecondBentoAnimation } from './SecondBentoSection'

const bentoSection = {
  title: 'Maximize Your Bitcoin LST Yields',
  description:
    'Transform your liquid staking tokens into high-yield opportunities. Leverage smart strategies to amplify your Bitcoin exposure and earnings.',
  items: [
    {
      id: 1,
      content: <FirstBentoSection />,
      title: 'Multi-Token Strategy Engine',
      description:
        'Seamlessly convert between WBTC, uniBTC, solvBTC, pumpBTC, and LBTC to maximize your yields with our intelligent routing system.',
    },
    {
      id: 2,
      content: <SecondBentoAnimation />,
      title: 'Advanced Looping Strategies',
      description:
        'Deposit maxBTC and borrow BTC derivatives to achieve high APYs through sophisticated leverage looping strategies that amplify your returns.',
    },
    // {
    //   id: 3,
    //   content: (
    //     <ThirdBentoAnimation
    //       data={[20, 30, 25, 45, 40, 55, 75]}
    //       toolTipValues={[1234, 1678, 2101, 2534, 2967, 3400, 3833, 4266, 4700, 5133]}
    //     />
    //   ),
    //   title: 'Instant Insight Reporting',
    //   description:
    //     'Transform raw data into clear insights in seconds. Empower smarter decisions with real-time, always-learning intelligence.',
    // },
    // {
    //   id: 4,
    //   content: <FourthBentoAnimation once={false} />,
    //   title: 'Smart Automation',
    //   description:
    //     'Set it, forget it. Your AI Agent tackles repetitive tasks so you can focus on strategy, innovation, and growth.',
    // },
  ],
}
export function BentoSection() {
  const { title, description, items } = bentoSection

  return (
    <section
      id='bento'
      className='flex flex-col items-center justify-center w-full relative px-5 md:px-10'
    >
      <div className='border-x border-white/10 mx-5 md:mx-10 relative'>
        <div className='absolute top-0 -left-4 md:-left-14 h-full w-4 md:w-14 text-white/5 bg-[size:10px_10px] [background-image:repeating-linear-gradient(315deg,currentColor_0_1px,#0000_0_50%)]'></div>
        <div className='absolute top-0 -right-4 md:-right-14 h-full w-4 md:w-14 text-white/5 bg-[size:10px_10px] [background-image:repeating-linear-gradient(315deg,currentColor_0_1px,#0000_0_50%)]'></div>

        <SectionHeader>
          <h2 className='text-3xl md:text-4xl font-medium tracking-tighter text-center text-balance pb-1 text-white'>
            {title}
          </h2>
          <p className='text-white/60 text-center text-balance font-medium'>{description}</p>
        </SectionHeader>

        <div className='grid grid-cols-1 md:grid-cols-2 overflow-hidden'>
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col items-start justify-end min-h-[600px] md:min-h-[500px] p-0.5 relative before:absolute before:-left-0.5 before:top-0 before:z-10 before:h-screen before:w-px before:bg-white/10 before:content-[''] after:absolute after:-top-0.5 after:left-0 after:z-10 after:h-px after:w-screen after:bg-white/10 after:content-[''] group cursor-pointer max-h-[400px] group"
            >
              <div className='relative flex size-full items-center justify-center h-full overflow-hidden'>
                {item.content}
              </div>
              <div className='flex-1 flex-col gap-2 p-6'>
                <h3 className='text-lg tracking-tighter font-semibold text-white'>{item.title}</h3>
                <p className='text-white/60'>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
