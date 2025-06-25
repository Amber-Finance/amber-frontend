export default function DepositPage() {
  return (
    <div className='w-full lg:container mx-auto px-4 py-8'>
      <div className='text-center space-y-4 mb-12'>
        <h1 className='text-3xl font-bold text-foreground'>Deposit LSTs</h1>
        <p className='text-muted-foreground max-w-2xl mx-auto'>
          Deposit your liquid staking tokens and earn combined yields from both staking rewards and
          lending APY. Bridge from Ethereum or other networks and start earning immediately.
        </p>
      </div>

      <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
        <div className='p-6 rounded-lg border bg-card'>
          <div className='text-4xl mb-4'>🌉</div>
          <h3 className='text-xl font-semibold mb-2'>Bridge Assets</h3>
          <p className='text-muted-foreground'>
            Bridge your LSTs from Ethereum and other chains to Neutron network
          </p>
        </div>

        <div className='p-6 rounded-lg border bg-card'>
          <div className='text-4xl mb-4'>💰</div>
          <h3 className='text-xl font-semibold mb-2'>Earn Combined Yield</h3>
          <p className='text-muted-foreground'>
            Get both staking rewards from your LSTs plus additional lending APY
          </p>
        </div>

        <div className='p-6 rounded-lg border bg-card'>
          <div className='text-4xl mb-4'>🔒</div>
          <h3 className='text-xl font-semibold mb-2'>Secure & Liquid</h3>
          <p className='text-muted-foreground'>
            Maintain liquidity while earning maximum yield on your Bitcoin LSTs
          </p>
        </div>
      </div>
    </div>
  )
}
