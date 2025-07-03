import Image from 'next/image'

export default function Logo() {
  return (
    <div className='absolute top-4 left-0 w-full z-10'>
      <div className='container mx-auto px-4'>
        <div className='relative w-[185px] lg:w-[370px] h-[65px] lg:h-[130px] bg-[#0f0f0f] rounded-full'>
          <Image
            src='/images/logo-claim-light.svg'
            alt='logo'
            fill={true}
            className='object-contain'
          />
        </div>
      </div>
    </div>
  )
}
