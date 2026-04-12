import { ImageOff, Minus, Plus, Trash2 } from 'lucide-react'
import { formatVnd } from '@/lib/money'
import { cn } from '@/lib/utils'

export interface CartLineItemProps {
  readonly name: string
  readonly unitPriceVnd: number
  readonly quantity: number
  readonly imageUrl: string
  readonly imageAlt: string
  readonly onIncrement: () => void
  readonly onDecrement: () => void
  readonly onRemove: () => void
  readonly readOnly?: boolean
  readonly className?: string
}

export function CartLineItem({
  name,
  unitPriceVnd,
  quantity,
  imageUrl,
  imageAlt,
  onIncrement,
  onDecrement,
  onRemove,
  readOnly = false,
  className,
}: CartLineItemProps) {
  return (
    <div className={cn('flex gap-4', className)}>
      <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={imageAlt}
            className="size-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <ImageOff className="size-8" strokeWidth={1.25} aria-hidden />
          </div>
        )}
      </div>
      <div className="flex min-h-20 flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-sm font-semibold text-foreground">
              {name}
            </h3>
            <button
              type="button"
              onClick={onRemove}
              disabled={readOnly}
              className="text-muted-foreground transition hover:text-state-danger disabled:pointer-events-none disabled:opacity-40"
              aria-label={`Xóa ${name}`}
            >
              <Trash2 className="size-5" strokeWidth={1.75} />
            </button>
          </div>
          <p className="mt-0.5 text-sm tabular-nums text-muted-foreground">
            {formatVnd(unitPriceVnd)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onDecrement}
            disabled={readOnly}
            className="flex size-7 items-center justify-center rounded-full border border-border/80 text-foreground transition active:bg-muted disabled:opacity-40"
            aria-label="Giảm số lượng"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-4 text-center text-sm font-semibold tabular-nums">
            {quantity}
          </span>
          <button
            type="button"
            onClick={onIncrement}
            disabled={readOnly}
            className="flex size-7 items-center justify-center rounded-full border border-border/80 text-foreground transition active:bg-muted disabled:opacity-40"
            aria-label="Tăng số lượng"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
