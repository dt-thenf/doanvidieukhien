import { cn } from '@/lib/utils'

export interface FilterOption {
  readonly id: string
  readonly label: string
}

export interface FilterBarProps {
  readonly options: readonly FilterOption[]
  readonly value: string
  readonly onChange: (id: string) => void
  readonly className?: string
}

export function FilterBar({
  options,
  value,
  onChange,
  className,
}: FilterBarProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {options.map((o) => {
        const active = o.id === value
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={cn(
              'rounded px-4 py-1.5 text-xs font-medium transition-colors',
              active
                ? 'bg-primary text-on-primary'
                : 'border border-border bg-surface text-foreground hover:bg-muted',
            )}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
