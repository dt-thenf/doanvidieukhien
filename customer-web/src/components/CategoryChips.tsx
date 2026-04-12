import { cn } from '@/lib/utils'

export interface CategoryChipsProps {
  readonly categories: readonly { readonly id: string; readonly label: string }[]
  readonly activeId: string
  readonly onChange: (id: string) => void
  readonly className?: string
}

export function CategoryChips({
  categories,
  activeId,
  onChange,
  className,
}: CategoryChipsProps) {
  return (
    <div
      className={cn(
        '-mx-6 mb-8 flex gap-2 overflow-x-auto px-6 no-scrollbar',
        className,
      )}
    >
      {categories.map((c) => {
        const active = c.id === activeId
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onChange(c.id)}
            className={cn(
              'shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-primary text-on-primary'
                : 'bg-muted text-muted-foreground hover:bg-border/40',
            )}
          >
            {c.label}
          </button>
        )
      })}
    </div>
  )
}
