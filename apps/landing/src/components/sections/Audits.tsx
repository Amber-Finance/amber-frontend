import Image from 'next/image'

import { Background } from '@/components/Background'
import { SectionHeader } from '@/components/section-header'
import { cn } from '@/lib/utils'

import { GridPattern } from '../magicui/grid-pattern'

export function Audits() {
  return (
    <section id='audits' className='relative overflow-hidden flex flex-col py-16 md:py-24'>
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

      <div className='relative flex w-full flex-col bg-background'>
        <div className='absolute inset-0'>
          <div className='relative mx-auto w-full px-8 md:px-16 max-w-3xl h-[300px] md:h-[300px]'>
            <GridPattern
              width={30}
              height={30}
              x={-1}
              y={-1}
              strokeDasharray={'4 2'}
              className={cn(
                '[mask-image:radial-gradient(600px_220px_at_center,white,transparent)]',
              )}
            />
            <div className='pointer-events-none absolute inset-x-0 top-0 h-2/3 bg-gradient-to-b from-background via-background/80 to-transparent' />
            <div className='pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background via-background/80 to-transparent' />
          </div>
        </div>
        <div className='relative z-10 mx-auto w-full px-8 md:px-16 max-w-3xl'>
          <SectionHeader>
            <div className='inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium text-white/80 backdrop-blur'>
              Independent audits
            </div>
            <h2 className='text-2xl md:text-3xl font-medium tracking-tighter text-center text-balance'>
              Audit coverage from Mars Protocol
            </h2>
            <p className='text-sm text-muted-foreground text-center text-balance font-medium max-w-2xl'>
              As a fork of Mars’s Red Bank, our contracts inherit audit coverage from the Mars
              Protocol codebase, including Red Bank and core modules.
            </p>
          </SectionHeader>
        </div>

        {/* Cards/content area */}
        <div className='mx-auto w-full px-8 md:px-16 max-w-6xl'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            <a
              href='https://github.com/mars-protocol/mars-audits/tree/main/red-bank/halborn'
              className='relative isolate overflow-hidden rounded-xl ring-1 ring-white/10 bg-black/30 p-6 transition-transform duration-300 hover:-translate-y-1'
            >
              <div
                aria-hidden
                className='absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-emerald-400/70 via-emerald-400/20 to-transparent'
              />
              <div
                aria-hidden
                className='absolute right-[-40px] top-[-40px] h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl'
              />
              <div className='relative mb-4 w-full h-10 aspect-[16/9] flex items-center justify-center'>
                <Image
                  src='/audits/halborn.svg'
                  alt='Halborn'
                  fill
                  sizes='200px'
                  className='object-contain invert'
                />
                <h3 className='sr-only'>Halborn</h3>
              </div>
              <p className='text-sm text-white/70'>
                Halborn is the industry-leading blockchain solutions firm for enterprise-grade
                digital assets, trusted by the top financial institutions and blockchain ecosystem
                leaders. Experience world-class, end-to-end security, from smart contract auditing
                and pen testing to advisory services and beyond.
              </p>
              <div className='mt-4 flex flex-wrap gap-2'>
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
              <p className='mt-4 text-sm underline text-white/70'>View Halborn reports</p>
            </a>

            <a
              href='https://github.com/mars-protocol/mars-audits/tree/main/red-bank/oak'
              className='relative isolate overflow-hidden rounded-xl ring-1 ring-white/10 bg-black/30 p-6 transition-transform duration-300 hover:-translate-y-1'
            >
              <div
                aria-hidden
                className='absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-yellow-400/70 via-yellow-400/20 to-transparent'
              />
              <div
                aria-hidden
                className='absolute right-[-40px] top-[-40px] h-32 w-32 rounded-full bg-yellow-400/10 blur-2xl'
              />
              <div className='relative mb-4 w-full h-10 aspect-[16/9] flex items-center justify-center'>
                <Image
                  src='/audits/oak.svg'
                  alt='OAK Security'
                  fill
                  sizes='200px'
                  className='object-contain'
                />
                <h3 className='sr-only'>OAK Security</h3>
              </div>
              <p className='text-sm text-white/70'>
                Oak Security offers security auditing and cyber security advisory services with a
                special focus on third-generation blockchains such as the Cosmos SDK and CosmWasm,
                Polkadot and Substrate, Solana, NEAR, and Flow (Cadence) ecosystems.
              </p>
              <div className='mt-4 flex flex-wrap gap-2'>
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
              <p className='mt-4 text-sm underline text-white/70'>View OAK reports</p>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
