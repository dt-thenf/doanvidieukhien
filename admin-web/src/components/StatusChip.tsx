import { cn } from '@/lib/utils'
import type { TableStateUi } from '@/types/domain'

export interface StatusChipProps {
  readonly tableState: TableStateUi
  readonly className?: string
}

const config: Record<
  TableStateUi,
  { label: string; className: string; dotClass: string }
> = {
  IDLE: {
    label: 'Trống',
    className: 'bg-muted text-muted-foreground',
    dotClass: 'bg-muted-foreground',
  },
  OPEN: {
    label: 'Đang phục vụ',
    className: 'bg-state-info text-foreground',
    dotClass: 'bg-primary',
  },
  PAYMENT_REQUESTED: {
    label: 'Chờ thanh toán',
    className: 'bg-state-warning text-foreground',
    dotClass: 'bg-accent-wood',
  },
  SETTLED: {
    label: 'Đã kết sổ',
    className: 'bg-state-success text-foreground',
    dotClass: 'bg-muted-foreground',
  },
}

export function StatusChip({ tableState, className }: StatusChipProps) {
  const c = config[tableState]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
        c.className,
        className,
      )}
    >
      <span className={cn('size-1 rounded-full', c.dotClass)} />
      {c.label}
    </span>
  )
}
