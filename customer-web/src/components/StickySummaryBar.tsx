import { ChevronRight, ShoppingBasket } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface StickySummaryBarProps {
  readonly itemCount: number
  readonly totalLabel: string
  readonly onOpenCart: () => void
  readonly className?: string
}

export function StickySummaryBar({
  itemCount,
  totalLabel,
  onOpenCart,
  className,
}: StickySummaryBarProps) {
  return (
    <button
      type="button"
      onClick={onOpenCart}
      className={cn(
        'fixed bottom-6 left-1/2 z-50 flex h-14 w-[90%] max-w-md -translate-x-1/2 items-center overflow-hidden rounded-2xl bg-primary px-6 text-on-primary shadow-soft transition active:scale-[0.98]',
        className,
      )}
    >
      <div className="flex w-full items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ShoppingBasket className="size-5 shrink-0" strokeWidth={1.75} />
          <span className="text-sm font-medium">Giỏ · {itemCount} món</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium tabular-nums">{totalLabel}</span>
          <ChevronRight className="size-5" strokeWidth={2} />
        </div>
      </div>
    </button>
  )
}
