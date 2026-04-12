import { ArrowLeft, UtensilsCrossed } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AppHeaderProps {
  readonly variant: 'menu' | 'cart'
  readonly tableLabel: string
  readonly sessionLabel?: string
  readonly title?: string
  readonly onBack?: () => void
  readonly className?: string
}

export function AppHeader({
  variant,
  tableLabel,
  sessionLabel = 'Đang gọi món',
  title = 'Giỏ hàng',
  onBack,
  className,
}: AppHeaderProps) {
  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full border-b border-border/60 bg-canvas/95 backdrop-blur-sm',
        className,
      )}
    >
      <div className="mx-auto flex h-16 max-w-md items-center justify-between px-6">
        {variant === 'menu' ? (
          <>
            <div className="flex items-center gap-2">
              <UtensilsCrossed
                className="size-5 text-primary"
                aria-hidden
                strokeWidth={1.75}
              />
              <h1 className="font-display text-base font-semibold text-foreground">
                {tableLabel}
              </h1>
            </div>
            <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {sessionLabel}
            </span>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onBack}
                className="flex size-10 items-center justify-center rounded-lg text-foreground transition active:scale-95"
                aria-label="Quay lại"
              >
                <ArrowLeft className="size-5" strokeWidth={1.75} />
              </button>
              <h1 className="font-display text-lg font-bold text-foreground">
                {title}
              </h1>
            </div>
            <div className="rounded-full bg-muted px-4 py-1.5">
              <span className="text-sm font-semibold text-foreground">
                {tableLabel}
              </span>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
