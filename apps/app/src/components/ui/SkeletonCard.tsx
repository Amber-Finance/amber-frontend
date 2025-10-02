import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function SkeletonStrategyCard() {
  return (
    <Card className='group relative overflow-hidden bg-card border border-border/20 backdrop-blur-xl animate-pulse'>
      <CardHeader className='relative z-20'>
        <div className='flex items-center justify-between mb-3'>
          <div className='flex items-center gap-3'>
            <div className='relative'>
              <div className='w-12 h-12 bg-muted/20 rounded-full' />
            </div>
            <div className='flex flex-col gap-2'>
              <div className='h-5 w-32 bg-muted/20 rounded' />
              <div className='h-4 w-40 bg-muted/20 rounded' />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className='relative space-y-4'>
        {/* APY Display */}
        <div className='text-center py-3'>
          <div className='h-12 w-32 mx-auto bg-muted/20 rounded mb-2' />
          <div className='h-4 w-20 mx-auto bg-muted/20 rounded' />
        </div>

        {/* Earning Points Section */}
        <div className='pt-3 border-t border-border/20'>
          <div className='h-6 w-full bg-muted/20 rounded' />
        </div>

        {/* Strategy Metrics */}
        <div className='grid grid-cols-2 gap-3 pt-3 border-t border-border/20'>
          <div className='bg-secondary/20 rounded-lg p-2.5 border border-border/40'>
            <div className='h-3 w-16 mx-auto bg-muted/20 rounded mb-2' />
            <div className='h-4 w-12 mx-auto bg-muted/20 rounded' />
          </div>
          <div className='bg-secondary/20 rounded-lg p-2.5 border border-border/40'>
            <div className='h-3 w-20 mx-auto bg-muted/20 rounded mb-2' />
            <div className='h-4 w-16 mx-auto bg-muted/20 rounded' />
          </div>
        </div>

        {/* Position Details */}
        <div className='space-y-3 pt-3 border-t border-border/20'>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className='flex justify-between items-center'>
              <div className='h-4 w-24 bg-muted/20 rounded' />
              <div className='h-4 w-32 bg-muted/20 rounded' />
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className='flex pt-3'>
          <div className='h-9 w-full bg-muted/20 rounded' />
        </div>
      </CardContent>
    </Card>
  )
}

export function SkeletonDepositCard() {
  return (
    <Card className='group relative bg-card border border-border/20 backdrop-blur-xl animate-pulse @container'>
      <CardHeader className='relative z-20'>
        <div className='flex flex-col @[350px]:flex-row @[350px]:items-center @[350px]:justify-between gap-4 mb-4'>
          <div className='flex items-center gap-4'>
            <div className='w-12 h-12 @[350px]:w-16 @[350px]:h-16 bg-muted/20 rounded-full' />
            <div className='space-y-2'>
              <div className='h-5 w-24 bg-muted/20 rounded' />
              <div className='h-4 w-32 bg-muted/20 rounded' />
            </div>
          </div>
          <div className='text-center space-y-2'>
            <div className='h-10 w-24 mx-auto bg-muted/20 rounded' />
            <div className='h-4 w-12 mx-auto bg-muted/20 rounded' />
          </div>
        </div>
      </CardHeader>

      <CardContent className='relative space-y-6'>
        {/* Metrics Grid */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <div className='h-3 w-24 bg-muted/20 rounded' />
            <div className='h-8 w-32 bg-muted/20 rounded' />
            <div className='h-4 w-28 bg-muted/20 rounded' />
          </div>
          <div className='space-y-2'>
            <div className='h-3 w-24 bg-muted/20 rounded' />
            <div className='h-8 w-28 bg-muted/20 rounded' />
            <div className='h-4 w-20 bg-muted/20 rounded' />
          </div>
        </div>

        {/* Earning Points Section */}
        <div className='pt-3 border-t border-border/20'>
          <div className='h-6 w-full bg-muted/20 rounded' />
        </div>

        {/* Action Button */}
        <div className='flex pt-4 border-t border-border/20'>
          <div className='h-9 w-full bg-muted/20 rounded' />
        </div>
      </CardContent>
    </Card>
  )
}

export function SkeletonStatsCard() {
  return (
    <Card className='group relative overflow-hidden bg-card border border-border/50 backdrop-blur-xl animate-pulse'>
      <CardContent>
        <div className='space-y-2'>
          <div className='h-3 w-24 bg-muted/20 rounded' />
          <div className='h-8 w-32 bg-muted/20 rounded' />
          <div className='h-4 w-20 bg-muted/20 rounded' />
        </div>
      </CardContent>
    </Card>
  )
}
