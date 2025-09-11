import Image from 'next/image'

import { GitHubLogoIcon } from '@radix-ui/react-icons'
import { BookOpen } from 'lucide-react'

import { AuroraText } from '@/components/ui/AuroraText'
import { TelegramLogo, XLogo } from '@/utils/SocialIcons'

export function ComingSoonOverlay() {
  return (
    <div className='fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center'>
      <div className='max-w-5xl mx-auto text-center px-6 py-12'>
        <div className='space-y-8'>
          {/* Main Content */}
          <div className='space-y-4'>
            <div className='flex items-center justify-center gap-4'>
              <div className='relative w-16 h-16 md:w-20 md:h-20'>
                <Image
                  src='/favicon.svg'
                  alt='Amber Finance'
                  fill
                  className='object-contain'
                  priority
                />
              </div>
              <h1 className='text-4xl md:text-6xl font-funnel tracking-tight'>
                <AuroraText>Coming Soon</AuroraText>
              </h1>
            </div>
            <p className='text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed'>
              We're building something amazing. The Amber Finance platform is under development and
              will be launching soon.
            </p>
          </div>

          {/* Features Preview */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4 max-w-lg mx-auto'>
            <div className='p-4 rounded-xl bg-card/20 backdrop-blur-sm border border-border/50 gap-2 flex flex-col justify-between'>
              <div className='text-sm font-semibold text-foreground'>Yield</div>
              <div className='text-xs text-muted-foreground'>
                Earn Yield on Bitcoin Related Tokens (BRTs)
              </div>
            </div>
            <div className='p-4 rounded-xl bg-card/20 backdrop-blur-sm border border-border/50 gap-2 flex flex-col justify-between'>
              <div className='text-sm font-semibold text-foreground'>Looping</div>
              <div className='text-xs text-muted-foreground'>Up to 10x Leverage on your maxBTC</div>
            </div>
            <div className='p-4 rounded-xl bg-card/20 backdrop-blur-sm border border-border/50 gap-2 flex flex-col justify-between'>
              <div className='text-sm font-semibold text-foreground'>Points Farming</div>
              <div className='text-xs text-muted-foreground'>
                Earn BTCFi Points on Amber Finance
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className='flex items-center justify-center gap-6 text-muted-foreground'>
            <a
              href='https://x.amberfi.io'
              className='flex h-10 w-10 items-center justify-center rounded-md  text-muted-foreground transition-all duration-200 ease-linear hover:text-foreground hover:border-border hover:bg-card'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='X'
            >
              <XLogo className='h-5 w-5' />
            </a>
            <a
              href='https://telegram.amberfi.io'
              className='flex h-10 w-10 items-center justify-center rounded-md  text-muted-foreground transition-all duration-200 ease-linear hover:text-foreground hover:border-border hover:bg-card'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='Telegram'
            >
              <TelegramLogo className='h-5 w-5' />
            </a>
            <a
              href='https://github.amberfi.io'
              className='flex h-10 w-10 items-center justify-center rounded-md  text-muted-foreground transition-all duration-200 ease-linear hover:text-foreground hover:border-border hover:bg-card'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='GitHub'
            >
              <GitHubLogoIcon className='h-5 w-5' />
            </a>
            <a
              href='https://docs.amberfi.io'
              className='flex h-10 w-10 items-center justify-center rounded-md  text-muted-foreground transition-all duration-200 ease-linear hover:text-foreground hover:border-border hover:bg-card'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='Documentation'
            >
              <BookOpen className='h-5 w-5' />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
