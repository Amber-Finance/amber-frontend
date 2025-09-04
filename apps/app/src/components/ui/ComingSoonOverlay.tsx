import Image from 'next/image'

import { GitHubLogoIcon } from '@radix-ui/react-icons'
import { BookOpen } from 'lucide-react'

import { AuroraText } from '@/components/ui/AuroraText'

// X (Twitter) Icon Component
const XIcon = ({ className }: { className?: string }) => (
  <svg
    role='img'
    fill='currentColor'
    viewBox='0 0 24 24'
    xmlns='http://www.w3.org/2000/svg'
    className={className}
  >
    <title>X</title>
    <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
  </svg>
)

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg
    role='img'
    fill='currentColor'
    viewBox='0 0 24 24'
    xmlns='http://www.w3.org/2000/svg'
    className={className}
  >
    <title>Telegram</title>
    <path d='M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z' />
  </svg>
)

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
            <div className='p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 gap-2 flex flex-col justify-between'>
              <div className='text-sm font-semibold text-foreground'>Yield</div>
              <div className='text-xs text-muted-foreground'>
                Earn Yield on Bitcoin Related Tokens (BRTs)
              </div>
            </div>
            <div className='p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 gap-2 flex flex-col justify-between'>
              <div className='text-sm font-semibold text-foreground'>Looping</div>
              <div className='text-xs text-muted-foreground'>Up to 10x Leverage on your maxBTC</div>
            </div>
            <div className='p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 gap-2 flex flex-col justify-between'>
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
              <XIcon className='h-5 w-5' />
            </a>
            <a
              href='https://telegram.amberfi.io'
              className='flex h-10 w-10 items-center justify-center rounded-md  text-muted-foreground transition-all duration-200 ease-linear hover:text-foreground hover:border-border hover:bg-card'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='Telegram'
            >
              <TelegramIcon className='h-5 w-5' />
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
