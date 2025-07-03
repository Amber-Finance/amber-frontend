export function LaunchAppButton() {
  return (
    <a
      href='https://app.amberfi.io'
      target='_blank'
      rel='noopener noreferrer'
      className='inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500/40 disabled:pointer-events-none cursor-pointer h-9 px-4 py-2 bg-gradient-to-r from-[rgb(177,36,30)] to-[rgb(245,113,54)] text-white shadow hover:shadow-lg hover:from-[rgb(157,26,20)] hover:to-[rgb(225,93,34)] disabled:opacity-50 gap-2'
    >
      Launch App
    </a>
  )
}
