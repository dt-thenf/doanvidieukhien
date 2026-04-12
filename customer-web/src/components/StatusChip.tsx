import { cn } from '@/lib/utils'

export type StatusChipTone = 'info' | 'warning' | 'success' | 'neutral'

export interface StatusChipProps {
  readonly children: string
  readonly tone?: StatusChipTone
  readonly className?: string
}

const toneClass: Record<StatusChipTone, string> = {
  info: 'bg-state-info text-foreground',
  warning: 'bg-state-warning text-foreground',
  success: 'bg-state-success text-foreground',
  neutral: 'bg-muted text-muted-foreground',
}

export function StatusChip({
  children,
  tone = 'info',
  className,
}: StatusChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        toneClass[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
