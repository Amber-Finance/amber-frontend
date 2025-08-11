interface SectionHeaderProps {
  children: React.ReactNode
}

export function SectionHeader({ children }: SectionHeaderProps) {
  return (
    <div className='w-full h-full py-8 md:py-10'>
      <div className='max-w-3xl mx-auto flex flex-col items-center justify-center gap-1.5'>
        {children}
      </div>
    </div>
  )
}
