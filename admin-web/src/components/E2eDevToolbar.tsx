import { useState } from 'react'
import { postDevCounterPaid, postDevKitchenDone } from '@/api/devApi'
import { ApiError } from '@/api/http'
import { SecondaryButton } from '@/components/SecondaryButton'

export interface E2eDevToolbarProps {
  readonly onAfterAction: () => void
}

/**
 * Thanh công cụ **chỉ** hiện khi build có `VITE_ENABLE_E2E_DEV_PANEL=1`.
 * Gọi đúng logic `apply_kitchen_done` / `apply_counter_paid` như PIC (dev HTTP).
 */
export function E2eDevToolbar({ onAfterAction }: E2eDevToolbarProps) {
  const [codeStr, setCodeStr] = useState('6')
  const [busy, setBusy] = useState<'kitchen' | 'counter' | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  const code = Number(codeStr.trim())
  const valid = Number.isFinite(code) && code > 0

  const run = async (
    kind: 'kitchen' | 'counter',
    fn: (c: number) => Promise<unknown>,
  ) => {
    if (!valid) {
      setErr('Nhập mã bàn (số dương).')
      return
    }
    setBusy(kind)
    setErr(null)
    setMsg(null)
    try {
      const out = await fn(Math.floor(code))
      setMsg(JSON.stringify(out))
      onAfterAction()
    } catch (e) {
      const text =
        e instanceof ApiError
          ? `${e.message}${e.status === 404 ? ' — có thể backend chưa bật PI_DEBUG=1' : ''}`
          : e instanceof Error
            ? e.message
            : 'Lỗi không xác định'
      setErr(text)
    } finally {
      setBusy(null)
    }
  }

  return (
    <section
      className="mb-6 rounded-xl border-2 border-dashed border-state-warning/60 bg-state-warning/10 p-4 text-sm"
      aria-label="Công cụ test E2E local"
    >
      <p className="mb-1 font-bold uppercase tracking-wide text-accent-wood">
        Chỉ dùng khi học / test local
      </p>
      <p className="mb-3 text-muted-foreground">
        Backend cần <code className="rounded bg-muted px-1">PI_DEBUG=1</code>. Đây{' '}
        <strong>không</strong> phải chốt tiền thật — chỉ giả lệnh PIC (
        <code className="rounded bg-muted px-1">CMD_KITCHEN_DONE</code>,{' '}
        <code className="rounded bg-muted px-1">CMD_COUNTER_PAID</code>).
      </p>
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs font-semibold text-foreground">
          Mã bàn (table_id)
          <input
            type="text"
            inputMode="numeric"
            value={codeStr}
            onChange={(e) => setCodeStr(e.target.value)}
            className="w-24 rounded-md border border-border bg-surface px-2 py-1.5 font-mono text-sm"
          />
        </label>
        <SecondaryButton
          type="button"
          className="min-h-9"
          disabled={busy !== null}
          onClick={() => void run('kitchen', postDevKitchenDone)}
        >
          {busy === 'kitchen' ? 'Đang gửi…' : 'Dev: bếp xong'}
        </SecondaryButton>
        <SecondaryButton
          type="button"
          className="min-h-9"
          disabled={busy !== null}
          onClick={() => void run('counter', postDevCounterPaid)}
        >
          {busy === 'counter' ? 'Đang gửi…' : 'Dev: quầy đã thu'}
        </SecondaryButton>
      </div>
      {msg ? (
        <p className="mt-2 break-all font-mono text-xs text-muted-foreground">{msg}</p>
      ) : null}
      {err ? <p className="mt-2 text-xs text-state-danger">{err}</p> : null}
    </section>
  )
}

export function showE2eDevToolbar(): boolean {
  return import.meta.env.VITE_ENABLE_E2E_DEV_PANEL === '1'
}
