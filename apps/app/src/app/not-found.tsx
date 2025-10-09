import Image from 'next/image'
import Link from 'next/link'

import { GitHubLogoIcon } from '@radix-ui/react-icons'
import { BookOpen, HomeIcon, MapIcon } from 'lucide-react'

import { XLogo } from '@/components/common/SocialIcons'
import { AuroraText } from '@/components/ui/AuroraText'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className='flex w-full h-full items-center justify-center bg-background px-6 py-12'>
      <div className='max-w-4xl mx-auto text-center'>
        <div className='space-y-8'>
          {/* Main Content */}
          <div className='space-y-6'>
            <div className='flex items-center justify-center gap-4'>
              <div className='relative w-16 h-16 md:w-20 md:h-20'>
                <Image
                  src='/favicon.svg'
                  alt='Amber Finance'
                  fill
                  sizes='(min-width: 768px) 80px, 64px'
                  className='object-contain'
                  priority
                />
              </div>
              <h1 className='text-4xl md:text-6xl font-funnel tracking-tight'>
                <AuroraText>Page Not Found</AuroraText>
              </h1>
            </div>
            <p className='text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed'>
              Oops! The page you&apos;re looking for seems to have wandered off into the digital
              void. Don&apos;t worry, even the best explorers sometimes take a wrong turn.
            </p>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
            <Button variant='outline' size='lg' asChild className='w-full sm:w-auto'>
              <Link href='/'>
                <HomeIcon className='h-4 w-4 mr-2' />
                Back to Deposit
              </Link>
            </Button>
            <Button size='lg' asChild className='w-full sm:w-auto'>
              <Link href='/strategies'>
                <MapIcon className='h-4 w-4 mr-2' />
                Explore Strategies
              </Link>
            </Button>
          </div>

          {/* Social Links */}
          <div className='flex items-center justify-center gap-6 text-muted-foreground'>
            <a
              href='https://x.amberfi.io'
              className='flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-all duration-200 ease-linear hover:text-foreground hover:border-border hover:bg-card'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='X'
            >
              <XLogo />
            </a>
            <a
              href='https://t.me/amberfi'
              className='flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-all duration-200 ease-linear hover:text-foreground hover:border-border hover:bg-card'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='Telegram'
            >
              <svg className='h-5 w-5' viewBox='0 0 24 24' fill='currentColor'>
                <path d='M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z' />
              </svg>
            </a>
            <a
              href='https://github.amberfi.io'
              className='flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-all duration-200 ease-linear hover:text-foreground hover:border-border hover:bg-card'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='GitHub'
            >
              <GitHubLogoIcon className='h-5 w-5' />
            </a>
            <a
              href='https://docs.amberfi.io'
              className='flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-all duration-200 ease-linear hover:text-foreground hover:border-border hover:bg-card'
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
