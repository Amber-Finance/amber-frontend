'use client'

import Image from 'next/image'

import { motion } from 'framer-motion'

const partners = [
  { name: 'EtherFi', image: 'etherfi_icon-white-outline.svg' },
  { name: 'Babylon', image: 'Baby-Symbol-Mint.png' },
  { name: 'Eureka', image: 'eureka/eurekaDark.svg' },
  { name: 'Lombard', image: 'lombard/lombardIconOnlyDark.svg' },
  { name: 'Solv', image: 'solv/solvDark.png' },
  { name: 'Bedrock', image: 'bedrock.svg' },
  { name: 'Neutron', image: 'neutron/neutron-dark.svg' },
]

export function Partners() {
  return (
    <section id='partners'>
      <div className='py-6'>
        <div className='container mx-auto px-4 md:px-8'>
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className='text-center text-sm font-semibold text-gray-500'
          >
            OUR PARTNERS
          </motion.h3>
          <div className='relative mt-4'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className='flex flex-wrap items-center justify-center gap-x-6 gap-y-3 md:gap-x-8 lg:gap-x-10'
            >
              {partners.map((partner, index) => (
                <motion.div
                  key={partner.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.4 + index * 0.1 }}
                  className='flex items-center gap-2 text-white'
                >
                  <Image
                    src={`/images/${partner.image}`}
                    width={24}
                    height={24}
                    className='h-6 w-6 dark:brightness-0 dark:invert object-contain'
                    alt={partner.name}
                  />
                  <span className='text-xs font-medium text-gray-400 whitespace-nowrap'>
                    {partner.name}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
