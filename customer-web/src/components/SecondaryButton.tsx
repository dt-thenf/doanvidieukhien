import type { ButtonHTMLAttributes } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const secondaryVariants = cva(
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-medium text-foreground transition hover:bg-muted active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      fullWidth: {
        true: 'w-full',
        false: '',
      },
      ghost: {
        true: 'border-transparent bg-transparent text-muted-foreground hover:text-primary',
        false: '',
      },
    },
    defaultVariants: { fullWidth: false, ghost: false },
  },
)

export interface SecondaryButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof secondaryVariants> {
  readonly asChild?: boolean
}

export function SecondaryButton({
  className,
  fullWidth,
  ghost,
  asChild,
  ...props
}: SecondaryButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      className={cn(secondaryVariants({ fullWidth, ghost }), className)}
      {...props}
    />
  )
}
