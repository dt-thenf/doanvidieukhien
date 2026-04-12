import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface EmptyStateProps {
  readonly title: string
  readonly description?: string
  readonly className?: string
}

export function EmptyState({ title, description, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-surface px-6 py-16 text-center',
        className,
      )}
    >
      <Inbox className="size-10 text-muted-foreground" strokeWidth={1.5} />
      <div>
        <p className="font-display text-base font-semibold text-foreground">
          {title}
        </p>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </div>
  )
}
