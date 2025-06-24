import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import GlowingBorderTop from '@/components/ui/GlowingBorderTop'

interface NavLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export default function NavLink({ href, children, className, onClick }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'relative text-sm font-medium transition-colors py-3 px-6 rounded-lg overflow-hidden focus:border-0',
        isActive
          ? 'text-white bg-gradient-to-b from-[var(--button-gradient-from)] via-[var(--button-gradient-via)] to-transparent border-t border-x border-t-[var(--button-border-top)] border-x-[var(--button-border-x)]'
          : 'text-muted-text hover:text-primary-text',
        className,
      )}
    >
      {isActive && <GlowingBorderTop />}
      {children}
    </Link>
  )
}
