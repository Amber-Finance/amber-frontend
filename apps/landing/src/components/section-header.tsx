interface SectionHeaderProps {
  children: React.ReactNode
}

export function SectionHeader({ children }: SectionHeaderProps) {
  return (
    <div className=' w-full h-full p-8 md:p-10'>
      <div className='max-w-xl mx-auto flex flex-col items-center justify-center gap-1.5'>
        {children}
      </div>
    </div>
  )
}
