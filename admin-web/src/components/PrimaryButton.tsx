import type { ButtonHTMLAttributes } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const primaryVariants = cva(
  'inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-on-primary transition hover:bg-primary-hover active:opacity-90 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      fullWidth: { true: 'w-full', false: '' },
      size: {
        default: 'min-h-10',
        sm: 'min-h-8 px-3 text-xs',
      },
    },
    defaultVariants: { fullWidth: false, size: 'default' },
  },
)

export interface PrimaryButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof primaryVariants> {
  readonly asChild?: boolean
}

export function PrimaryButton({
  className,
  fullWidth,
  size,
  asChild,
  ...props
}: PrimaryButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      className={cn(primaryVariants({ fullWidth, size }), className)}
      {...props}
    />
  )
}
