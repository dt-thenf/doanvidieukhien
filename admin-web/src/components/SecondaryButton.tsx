import type { ButtonHTMLAttributes } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const secondaryVariants = cva(
  'inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-border bg-surface px-3 text-xs font-medium text-foreground transition hover:bg-muted disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      ghost: {
        true: 'border-transparent bg-transparent text-primary hover:underline',
        false: '',
      },
    },
    defaultVariants: { ghost: false },
  },
)

export interface SecondaryButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof secondaryVariants> {
  readonly asChild?: boolean
}

export function SecondaryButton({
  className,
  ghost,
  asChild,
  ...props
}: SecondaryButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp className={cn(secondaryVariants({ ghost }), className)} {...props} />
  )
}
