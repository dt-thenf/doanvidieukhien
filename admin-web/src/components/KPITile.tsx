import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface KPITileProps {
  readonly icon: LucideIcon
  readonly label: string
  readonly value: number
  readonly unit?: string
  readonly iconClassName?: string
  readonly className?: string
}

export function KPITile({
  icon: Icon,
  label,
  value,
  unit = 'bàn',
  iconClassName,
  className,
}: KPITileProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border border-border bg-surface px-5 py-3 shadow-soft',
        className,
      )}
    >
      <div
        className={cn(
          'flex size-8 items-center justify-center rounded bg-primary/10 text-primary',
          iconClassName,
        )}
      >
        <Icon className="size-4" strokeWidth={1.75} />
      </div>
      <div>
        <p className="text-[10px] font-medium uppercase text-muted-foreground">
          {label}
        </p>
        <p className="text-lg font-semibold tabular-nums text-foreground">
          {value}{' '}
          <span className="text-xs font-normal lowercase text-muted-foreground">
            {unit}
          </span>
        </p>
      </div>
    </div>
  )
}
