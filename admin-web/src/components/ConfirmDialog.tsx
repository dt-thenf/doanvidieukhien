import * as Dialog from '@radix-ui/react-dialog'
import { PrimaryButton } from '@/components/PrimaryButton'
import { SecondaryButton } from '@/components/SecondaryButton'
import { cn } from '@/lib/utils'

export interface ConfirmDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly title: string
  readonly description?: string
  readonly confirmLabel: string
  readonly cancelLabel?: string
  readonly onConfirm: () => void
  /** Mặc định đóng ngay; tắt khi onConfirm bất đồng bộ và parent tự đóng. */
  readonly closeOnConfirm?: boolean
  readonly variant?: 'default' | 'danger'
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Huỷ',
  onConfirm,
  closeOnConfirm = true,
  variant = 'default',
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-[1px]" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface p-6 shadow-soft',
          )}
        >
          <Dialog.Title className="font-display text-lg font-semibold text-foreground">
            {title}
          </Dialog.Title>
          {description ? (
            <Dialog.Description className="mt-2 text-sm text-muted-foreground">
              {description}
            </Dialog.Description>
          ) : null}
          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close asChild>
              <SecondaryButton type="button">{cancelLabel}</SecondaryButton>
            </Dialog.Close>
            <PrimaryButton
              type="button"
              className={cn(
                variant === 'danger' &&
                  'bg-state-danger hover:bg-state-danger/90',
              )}
              onClick={() => {
                onConfirm()
                if (closeOnConfirm) onOpenChange(false)
              }}
            >
              {confirmLabel}
            </PrimaryButton>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
