import Image from 'next/image'

export default function Logo() {
  return (
    <div className='absolute top-8 left-28 z-10 flex items-center gap-3'>
      <div className='relative w-full h-full bg-[#0f0f0f] rounded-full'>
        <Image src='/images/logo-claim-light.svg' alt='logo' width={370} height={130} />
      </div>
    </div>
  )
}
