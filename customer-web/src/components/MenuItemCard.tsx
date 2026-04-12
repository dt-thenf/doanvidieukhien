import { Plus } from 'lucide-react'
import { formatVnd } from '@/lib/money'
import { DishTag } from '@/components/DishTag'
import { cn } from '@/lib/utils'

export interface MenuItemCardProps {
  readonly name: string
  readonly priceVnd: number
  readonly imageUrl: string
  readonly imageAlt: string
  readonly tags: readonly string[]
  readonly onAdd: () => void
  readonly addDisabled?: boolean
  readonly className?: string
}

export function MenuItemCard({
  name,
  priceVnd,
  imageUrl,
  imageAlt,
  tags,
  onAdd,
  addDisabled = false,
  className,
}: MenuItemCardProps) {
  return (
    <article className={cn('flex flex-col gap-3', className)}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
        <img
          src={imageUrl}
          alt={imageAlt}
          className="size-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h3 className="font-display text-lg font-semibold text-foreground">
            {name}
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <DishTag key={t}>{t}</DishTag>
            ))}
          </div>
          <p className="mt-1 text-base font-medium tabular-nums text-primary">
            {formatVnd(priceVnd)}
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          disabled={addDisabled}
          className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-on-primary transition active:scale-95 disabled:opacity-40"
          aria-label={`Thêm ${name}`}
        >
          <Plus className="size-5" strokeWidth={2} />
        </button>
      </div>
    </article>
  )
}
