import { cn } from '@/lib/utils'

export interface DishTagProps {
  readonly children: string
  readonly className?: string
}

export function DishTag({ children, className }: DishTagProps) {
  return (
    <span
      className={cn(
        'rounded bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground',
        className,
      )}
    >
      {children}
    </span>
  )
}
