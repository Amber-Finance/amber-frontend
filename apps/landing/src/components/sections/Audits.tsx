'use client'

import Image from 'next/image'

import { ArrowRightIcon } from '@radix-ui/react-icons'
import { motion } from 'framer-motion'

import { Background } from '@/components/Background'
import { SectionHeader } from '@/components/section-header'
import { cn } from '@/lib/utils'

import { GridPattern } from '../ui/grid-pattern'

export function Audits() {
  return (
    <section id='audits' className='relative overflow-hidden flex flex-col py-2'>
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
                <GridPattern
                  width={30}
                  height={30}
                  x={-1}
                  y={-1}
                  strokeDasharray={'4 2'}
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
              <div className='inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-medium text-white/80 backdrop-blur'>
                Independent audits
              </div>
              <h2 className='text-3xl md:text-4xl font-funnel font-medium tracking-tighter text-center text-balance'>
                Audit coverage from Mars Protocol
              </h2>
              <p className='text-base text-muted-foreground text-center text-balance font-medium max-w-2xl'>
                As a fork of Mars&apos;s Red Bank, our contracts inherit audit coverage from the
                Mars Protocol codebase, including the Red Bank and its core modules.
              </p>
            </SectionHeader>
          </motion.div>
        </div>

        {/* Cards/content area */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className='mx-auto w-full px-8 md:px-16 max-w-6xl'
        >
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <motion.a
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              href='https://github.com/mars-protocol/mars-audits/tree/main/red-bank/halborn'
              className='group relative overflow-hidden rounded-xl bg-background [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)] dark:bg-background dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-10px_30px_-10px_#ffffff1f_inset] p-6 flex flex-col transform-gpu transition-all duration-300'
            >
              <div className='flex flex-col gap-3'>
                <div className='relative w-full h-10 aspect-[16/9] flex items-center justify-center'>
                  <Image
                    src='/audits/halborn.svg'
                    alt='Halborn'
                    fill
                    sizes='200px'
                    className='object-contain invert'
                  />
                  <h3 className='sr-only'>Halborn</h3>
                </div>
                <p className='text-neutral-400 dark:text-neutral-400 flex-1'>
                  Halborn is the industry-leading blockchain solutions firm for enterprise-grade
                  digital assets, trusted by the top financial institutions and blockchain ecosystem
                  leaders. Experience world-class, end-to-end security, from smart contract auditing
                  and pen testing to advisory services and beyond.
                </p>
                <div className='flex flex-wrap gap-2'>
                  <span className='rounded-full bg-white/5 px-2 py-1 text-[11px] ring-1 ring-white/10 text-white/70'>
                    Red Bank
                  </span>
                  <span className='rounded-full bg-white/5 px-2 py-1 text-[11px] ring-1 ring-white/10 text-white/70'>
                    Core
                  </span>
                  <span className='rounded-full bg-white/5 px-2 py-1 text-[11px] ring-1 ring-white/10 text-white/70'>
                    Periphery
                  </span>
                </div>
              </div>
              <div className='absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-md opacity-0 transition-all duration-300 group-hover:opacity-100'>
                <div className='pointer-events-auto text-lg font-medium text-neutral-700 dark:text-neutral-300 hover:underline flex items-center'>
                  View Halborn reports
                  <ArrowRightIcon className='ms-2 h-5 w-5 rtl:rotate-180' />
                </div>
              </div>
            </motion.a>

            <motion.a
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.8 }}
              href='https://github.com/mars-protocol/mars-audits/tree/main/red-bank/oak'
              className='group relative overflow-hidden rounded-xl bg-background [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)] dark:bg-background dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-10px_30px_-10px_#ffffff1f_inset] p-6 flex flex-col transform-gpu transition-all duration-300'
            >
              <div className='flex flex-col gap-3'>
                <div className='relative w-full h-10 aspect-[16/9] flex items-center justify-center'>
                  <Image
                    src='/audits/oak.svg'
                    alt='OAK Security'
                    fill
                    sizes='200px'
                    className='object-contain'
                  />
                  <h3 className='sr-only'>OAK Security</h3>
                </div>
                <p className='text-neutral-400 dark:text-neutral-400 flex-1'>
                  Oak Security offers security auditing and cyber security advisory services with a
                  special focus on third-generation blockchains such as the Cosmos SDK and CosmWasm,
                  Polkadot and Substrate, Solana, NEAR, and Flow (Cadence) ecosystems.
                </p>
                <div className='flex flex-wrap gap-2'>
                  <span className='rounded-full bg-white/5 px-2 py-1 text-[11px] ring-1 ring-white/10 text-white/70'>
                    Red Bank
                  </span>
                  <span className='rounded-full bg-white/5 px-2 py-1 text-[11px] ring-1 ring-white/10 text-white/70'>
                    Hub
                  </span>
                  <span className='rounded-full bg-white/5 px-2 py-1 text-[11px] ring-1 ring-white/10 text-white/70'>
                    Periphery
                  </span>
                </div>
              </div>
              <div className='absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-md opacity-0 transition-all duration-300 group-hover:opacity-100'>
                <div className='pointer-events-auto text-lg font-medium text-neutral-700 dark:text-neutral-300 hover:underline flex items-center'>
                  View OAK reports
                  <ArrowRightIcon className='ms-2 h-5 w-5 rtl:rotate-180' />
                </div>
              </div>
            </motion.a>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
