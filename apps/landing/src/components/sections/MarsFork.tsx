import { Background } from '@/components/Background'
import { SectionHeader } from '@/components/section-header'
import { Ripple } from '@/components/ui/ripple'

export function MarsFork() {
  return (
    <section id='mars-fork' className='relative overflow-hidden flex flex-col pt-2'>
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

      <div className='relative flex flex-col bg-background'>
        <div className='relative flex items-center justify-center h-[350px] w-full overflow-hidden'>
          <div className='absolute inset-0'>
            <div className='relative w-full h-full min-h-[350px] max-h-[350px]'>
              <div className='absolute inset-3 md:inset-4 [mask-image:linear-gradient(to_bottom,white_0%,white_33%,transparent_50%)]'>
                <Ripple mainCircleSize={15} numCircles={5} />
              </div>
            </div>
          </div>
          <div className='relative z-10 mx-auto w-full px-4 max-w-3xl'>
            <SectionHeader>
              <div className='inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 text-[10px] font-medium text-white/80 backdrop-blur'>
                Mars‑grade security
              </div>

              <h2 className='text-2xl md:text-3xl font-medium tracking-tighter text-center text-balance'>
                Max security. Forked from Mars Red Bank
              </h2>
              <p className='text-sm text-muted-foreground text-center text-balance font-medium max-w-2xl'>
                A hardened fork of Mars’s Red Bank Cosmos’s battle‑tested lending primitive adapted
                for Bitcoin BRTs. Trusted architecture, optimized for BTC yield. See Mars docs for
                design and risk methodology.
              </p>
            </SectionHeader>
          </div>
        </div>

        {/* Cards/content area */}
        <div className='mx-auto w-full px-8 md:px-16 pb-8 max-w-6xl'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <div className='group relative overflow-hidden rounded-xl border border-white/10 bg-black/40 p-6 backdrop-blur-sm transition-colors duration-300 hover:bg-black/50'>
              <span
                aria-hidden
                className='pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-orange-400/0 via-orange-400/60 to-orange-400/0'
              />
              <div
                aria-hidden
                className='pointer-events-none absolute inset-0 bg-[radial-gradient(70%_40%_at_50%_0%,rgba(255,115,0,0.12),transparent)] opacity-0 transition-opacity duration-500 group-hover:opacity-100'
              />
              <h3 className='text-base font-semibold tracking-tight'>Why fork Red Bank?</h3>
              <p className='mt-3 text-sm text-white/70'>
                Red Bank is a mature lending primitive with strong risk tooling and proven market
                behavior. Forking allows us to inherit its security properties while adapting
                configuration and integrations for Bitcoin BRTs.
              </p>
              <ul className='mt-4 list-disc pl-5 text-sm text-white/70 space-y-1'>
                <li>Conservative parameters and hardened liquidation logic</li>
                <li>Credit‑account oriented architecture for position safety</li>
                <li>Production‑grade oracle and reserve management design</li>
              </ul>
            </div>

            <div className='group relative overflow-hidden rounded-xl border border-white/10 bg-black/30 p-6 backdrop-blur-sm transition-colors duration-300 hover:bg-black/40'>
              <span
                aria-hidden
                className='pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-sky-400/0 via-sky-400/60 to-sky-400/0'
              />
              <div
                aria-hidden
                className='pointer-events-none absolute inset-0 bg-[radial-gradient(70%_40%_at_50%_0%,rgba(56,189,248,0.12),transparent)] opacity-0 transition-opacity duration-500 group-hover:opacity-100'
              />
              <h3 className='text-base font-semibold tracking-tight'>Design principles</h3>
              <ul className='mt-3 space-y-2 text-sm text-white/70'>
                <li>
                  Security‑first: adopt Mars defaults, then tighten where BTC LST market structure
                  warrants it.
                </li>
                <li>Minimal surface area: focus on essentials to maximize reliability.</li>
                <li>Observability: transparent parameters and health metrics across markets.</li>
              </ul>
              <a
                href='https://docs.marsprotocol.io/'
                className='mt-4 inline-block text-xs underline text-white/70 hover:text-white'
              >
                Read Mars Protocol documentation
              </a>
            </div>
          </div>
        </div>

        <p className='mx-auto pb-3 max-w-4xl text-center text-xs text-white/50'>
          References: Mars Protocol documentation and audits.
        </p>
      </div>
    </section>
  )
}
