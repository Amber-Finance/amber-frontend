'use client'

import { ArrowRightIcon } from '@radix-ui/react-icons'
import { motion } from 'framer-motion'

import { Background } from '@/components/Background'
import { SectionHeader } from '@/components/section-header'
import { Ripple } from '@/components/ui/ripple'

export function MarsFork() {
  return (
    <section id='mars-fork' className='relative overflow-hidden flex flex-col py-2'>
      <div className='absolute inset-0 -z-10'>
        <Background
          translateY={-280}
          width={420}
          height={980}
          smallWidth={180}
          duration={9}
          xOffset={60}
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
              <div className='absolute inset-4 md:inset-6 [mask-image:linear-gradient(to_bottom,white_0%,white_33%,transparent_50%)] overflow-visible flex items-center justify-center'>
                <Ripple mainCircleSize={15} numCircles={10} />
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
                Mars‑grade security
              </div>

              <h2 className='text-3xl md:text-4xl font-funnelDisplay font-medium text-center text-balance'>
                High Leverage with maximum security
              </h2>
              <p className='text-base text-muted-foreground text-center text-balance font-medium max-w-2xl'>
                A hardened fork of Mars Protocol&apos;s Red Bank - Cosmos&apos;s battle‑tested
                lending primitive adapted for Bitcoin Liquid Staking Tokens. Trusted architecture,
                optimized for native Bitcoin yield.
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
          className='mx-auto w-full px-8 md:px-16 pb-8 max-w-6xl'
        >
          <div>
            <motion.a
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              href='https://docs.marsprotocol.io/'
              target='_blank'
              rel='noopener noreferrer'
              className='group relative overflow-hidden rounded-xl bg-background [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)] dark:bg-background dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-10px_30px_-10px_#ffffff1f_inset] p-8 flex flex-col transform-gpu transition-all duration-300'
            >
              <div className='flex flex-col gap-6'>
                <div>
                  <h3 className='text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-4'>
                    What is the Red Bank?
                  </h3>
                  <p className='text-neutral-400 dark:text-neutral-400 mb-4'>
                    The Red Bank is a mature lending primitive with strong risk tooling and proven
                    market behavior. Amber Finance uses the battletested Mars Protocol Contracts as
                    the base of its core. Configured to support Bitcoin LSTs and liquidate towards
                    highly correlated assets.
                  </p>
                  <ul className='list-disc pl-5 text-neutral-400 dark:text-neutral-400 space-y-1'>
                    <li>Conservative parameters and hardened liquidation logic</li>
                    <li>Credit‑account oriented architecture for position safety</li>
                    <li>Production‑grade oracle and reserve management design</li>
                  </ul>
                </div>

                <div>
                  <h3 className='text-xl font-semibold text-neutral-700 dark:text-neutral-300 mb-3'>
                    Design principles
                  </h3>
                  <ul className='space-y-2 text-neutral-400 dark:text-neutral-400'>
                    <li>
                      Security‑first: adopt Mars Protocol defaults, then tighten where Bitcoin LST
                      market structure warrants it.
                    </li>
                    <li>Minimal surface area: focus on essentials to maximize reliability.</li>
                  </ul>
                </div>
              </div>
              <div className='absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-md opacity-0 transition-all duration-300 group-hover:opacity-100'>
                <div className='pointer-events-auto text-lg font-medium text-neutral-700 dark:text-neutral-300 flex items-center'>
                  Read Mars Protocol documentation
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
