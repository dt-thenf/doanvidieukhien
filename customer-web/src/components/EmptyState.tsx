import { Leaf } from 'lucide-react'
import { SecondaryButton } from '@/components/SecondaryButton'
import { cn } from '@/lib/utils'

export interface EmptyStateProps {
  readonly title: string
  readonly description?: string
  readonly actionLabel?: string
  readonly onAction?: () => void
  readonly className?: string
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 px-6 py-16 text-center',
        className,
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-2xl border border-border bg-surface text-primary">
        <Leaf className="size-7" strokeWidth={1.5} />
      </div>
      <div className="space-y-1">
        <p className="font-display text-lg font-semibold text-foreground">
          {title}
        </p>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actionLabel && onAction ? (
        <SecondaryButton type="button" onClick={onAction}>
          {actionLabel}
        </SecondaryButton>
      ) : null}
    </div>
  )
}
