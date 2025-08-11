import Image from 'next/image'

import { Marquee } from '@/components/ui/marquee'

const companies = [
  { name: 'Axelar', image: '/images/axelar/axelarDark.svg' },
  { name: 'Eureka', image: '/images/eureka/eurekaDark.svg' },
  { name: 'Lombard', image: '/images/lombard/lombardIconOnlyDark.svg' },
  { name: 'Solv', image: '/images/solv/solvDark.png' },
  { name: 'Bedrock', image: '/images/bedrock.svg' },
  { name: 'Neutron', image: '/images/neutron/neutron-dark.svg' },
]

export function Partners() {
  return (
    <section id='partners' className='py-16 md:py-24'>
      <div className='mx-auto px-8 md:px-16 max-w-6xl'>
        <div className='relative'>
          <Marquee className='w-full [--duration:40s] gap-10'>
            {companies.map((company, idx) => (
              <div
                key={`${company.name}-${idx}`}
                className='flex flex-row items-center justify-center  text-white'
              >
                <Image
                  width={44}
                  height={44}
                  key={`${company.name}-${idx}`}
                  src={company.image}
                  className='h-10 w-15'
                  alt={company.name}
                />
                <h1 className='text-base font-bold font-white'>{company.name}</h1>
              </div>
            ))}
          </Marquee>
          <div className='pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#0a0b10]'></div>
          <div className='pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[#0a0b10]'></div>
        </div>
      </div>
    </section>
  )
}
