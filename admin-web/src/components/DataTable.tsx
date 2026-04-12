import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface DataTableProps {
  readonly children: ReactNode
  readonly className?: string
}

export function DataTable({ children, className }: DataTableProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-border bg-surface shadow-soft',
        className,
      )}
    >
      <div className="overflow-x-auto">{children}</div>
    </div>
  )
}
