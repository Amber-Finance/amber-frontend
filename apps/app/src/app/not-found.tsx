import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className='flex flex-col items-center justify-center min-h-[80vh] px-4 text-center'>
      <h1 className='text-6xl font-bold text-orange-600 mb-4'>404</h1>
      <h2 className='text-3xl font-semibold mb-6'>Page Not Found</h2>
      <p className='text-gray-600 dark:text-gray-400 mb-8 max-w-md'>
        Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been removed,
        had its name changed, or is temporarily unavailable.
      </p>
      <Button variant='default' size='default' asChild>
        <Link href='/'>Back to Dashboard</Link>
      </Button>
    </div>
  )
}
