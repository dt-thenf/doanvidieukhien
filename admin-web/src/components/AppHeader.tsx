import { Leaf, UserRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const navClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'text-sm font-medium transition-colors',
    isActive
      ? 'border-b-2 border-primary pb-1 text-primary'
      : 'text-muted-foreground hover:text-primary',
  )

export interface AppHeaderProps {
  readonly className?: string
}

export function AppHeader({ className }: AppHeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b border-border bg-surface',
        className,
      )}
    >
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-6 px-6 py-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <Leaf className="size-5 text-primary" strokeWidth={1.75} />
            <span className="font-display text-lg font-semibold text-primary">
              Quán chay — vận hành
            </span>
            <span className="rounded bg-accent-wood/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-wood">
              demo LAN
            </span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <NavLink to="/" className={navClass} end>
              Tổng quan bàn
            </NavLink>
            <NavLink to="/payment-queue" className={navClass}>
              Chờ thanh toán
            </NavLink>
          </nav>
        </div>
        <div
          className="flex size-9 items-center justify-center rounded-full border border-accent-wood/30 bg-muted text-muted-foreground"
          title="Nhân viên (mock)"
        >
          <UserRound className="size-5" strokeWidth={1.5} />
        </div>
      </div>
      <nav className="flex gap-4 border-t border-border px-6 py-2 md:hidden">
        <NavLink to="/" className={navClass} end>
          Tổng quan bàn
        </NavLink>
        <NavLink to="/payment-queue" className={navClass}>
          Chờ thanh toán
        </NavLink>
      </nav>
    </header>
  )
}
