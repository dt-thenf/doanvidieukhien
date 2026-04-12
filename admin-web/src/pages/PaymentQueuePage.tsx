import { Info, Receipt, RefreshCw, UtensilsCrossed } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { AppHeader } from '@/components/AppHeader'
import { DataTable } from '@/components/DataTable'
import { EmptyState } from '@/components/EmptyState'
import { fetchOrderDetail, fetchPaymentsQueue } from '@/api/adminApi'
import { ApiError } from '@/api/http'
import type { OrderLinePreview, PaymentQueueRow } from '@/types/domain'
import { formatVnd } from '@/lib/money'

function rowKey(r: PaymentQueueRow): string {
  return `${r.tableCode}-${r.orderId}`
}

export function PaymentQueuePage() {
  const [rows, setRows] = useState<PaymentQueueRow[]>([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  const [detailLines, setDetailLines] = useState<OrderLinePreview[]>([])
  const [detailTotal, setDetailTotal] = useState<number | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

  const loadQueue = useCallback(async () => {
    setLoading(true)
    setListError(null)
    try {
      const data = await fetchPaymentsQueue()
      const next = data.rows.map((r) => ({
        tableLabel: r.tableLabel,
        tableCode: r.tableCode,
        orderId: r.orderId,
        totalVnd: r.totalVnd,
        requestedAgo: r.requestedAgo,
        paymentStatus: r.paymentStatus,
      }))
      setRows(next)
      setSelectedKey((prev) => {
        if (prev && next.some((x) => rowKey(x) === prev)) return prev
        return next[0] ? rowKey(next[0]) : null
      })
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : 'Không tải được hàng chờ thanh toán'
      setListError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadQueue()
  }, [loadQueue])

  const selectedRow = useMemo(
    () => rows.find((r) => rowKey(r) === selectedKey) ?? null,
    [rows, selectedKey],
  )

  useEffect(() => {
    if (!selectedRow) {
      setDetailLines([])
      setDetailTotal(null)
      setDetailError(null)
      return
    }
    let cancelled = false
    setDetailLoading(true)
    setDetailError(null)
    void (async () => {
      try {
        const d = await fetchOrderDetail(selectedRow.tableCode)
        if (cancelled) return
        setDetailTotal(d.order.totalVnd)
        setDetailLines(
          d.lines.map((l) => ({
            name: l.name,
            note: l.note ?? undefined,
            qty: l.qty,
          })),
        )
      } catch (e) {
        if (cancelled) return
        const msg =
          e instanceof ApiError
            ? e.message
            : e instanceof Error
              ? e.message
              : 'Không tải chi tiết đơn'
        setDetailError(msg)
        setDetailLines([])
        setDetailTotal(null)
      } finally {
        if (!cancelled) setDetailLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [selectedRow])

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader />
      <header className="border-b border-border bg-surface px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="font-display text-xl font-bold text-primary">
            Chờ thanh toán
          </h1>
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-full text-accent-wood transition hover:bg-muted"
            aria-label="Làm mới danh sách"
            onClick={() => void loadQueue()}
          >
            <RefreshCw className="size-5" strokeWidth={1.75} />
          </button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-6 py-8">
        <section className="flex gap-4 rounded-r-xl border-l-4 border-primary bg-state-info/60 p-5">
          <Info className="mt-0.5 size-5 shrink-0 text-primary" />
          <p className="text-sm font-medium leading-relaxed text-foreground">
            Chốt thanh toán tại quầy (thiết bị PIC). Màn hình web chỉ theo dõi
            trạng thái — không chốt tiền tại đây.
          </p>
        </section>

        {loading ? (
          <p className="text-sm text-muted-foreground">Đang tải…</p>
        ) : listError ? (
          <div className="space-y-2">
            <p className="text-sm text-state-danger">{listError}</p>
            <button
              type="button"
              className="rounded-lg border border-border px-3 py-1.5 text-sm"
              onClick={() => void loadQueue()}
            >
              Thử lại
            </button>
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            title="Không có yêu cầu chờ"
            description="Khi khách yêu cầu thanh toán (đơn DONE), dòng sẽ hiện ở đây."
          />
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="flex flex-col gap-6 lg:col-span-8">
              <DataTable className="border-black/5">
                <table className="w-full min-w-[640px] border-separate border-spacing-y-2 text-left text-sm tabular-nums">
                  <thead>
                    <tr className="text-xs uppercase tracking-widest text-muted-foreground">
                      <th className="px-6 py-3">Bàn</th>
                      <th className="px-6 py-3">Mã đơn</th>
                      <th className="px-6 py-3 text-right">Tổng (VNĐ)</th>
                      <th className="px-6 py-3">Yêu cầu lúc</th>
                      <th className="px-6 py-3">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => {
                      const key = rowKey(r)
                      const active = key === selectedKey
                      return (
                        <tr
                          key={key}
                          className={
                            active
                              ? 'cursor-pointer bg-muted/80 outline outline-1 outline-border'
                              : 'cursor-pointer hover:bg-muted/50'
                          }
                          onClick={() => setSelectedKey(key)}
                        >
                          <td className="px-6 py-5 align-middle">
                            <span className="rounded-lg bg-state-warning/40 px-3 py-1 text-sm font-bold text-foreground">
                              {r.tableLabel}
                            </span>
                          </td>
                          <td className="px-6 py-5 align-middle text-muted-foreground">
                            {r.orderId}
                          </td>
                          <td className="px-6 py-5 align-middle text-right font-semibold text-primary">
                            {formatVnd(r.totalVnd)}
                          </td>
                          <td className="px-6 py-5 align-middle text-muted-foreground">
                            {r.requestedAgo}
                          </td>
                          <td className="px-6 py-5 align-middle">
                            <span className="text-sm font-medium text-primary">
                              Yêu cầu thanh toán
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </DataTable>
              <div className="flex justify-center py-2 opacity-30">
                <UtensilsCrossed className="size-10 text-primary" strokeWidth={1.25} />
              </div>
            </div>

            <aside className="flex flex-col gap-6 lg:col-span-4">
              <div className="rounded-2xl border border-border bg-surface p-8 shadow-soft">
                <h2 className="mb-6 flex items-center gap-2 font-display text-lg font-semibold text-accent-wood">
                  <Receipt className="size-5 text-primary" strokeWidth={1.75} />
                  Chi tiết đơn {selectedRow?.orderId ?? '—'}
                </h2>
                {detailLoading ? (
                  <p className="text-sm text-muted-foreground">Đang tải chi tiết…</p>
                ) : detailError ? (
                  <p className="text-sm text-state-danger">{detailError}</p>
                ) : detailLines.length > 0 && selectedRow && detailTotal != null ? (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      {detailLines.map((line, idx) => (
                        <div
                          key={`${line.name}-${idx}`}
                          className="flex items-start justify-between gap-4 tabular-nums"
                        >
                          <div>
                            <p className="font-medium text-foreground">
                              {line.name}
                            </p>
                            {line.note ? (
                              <p className="text-xs text-muted-foreground">
                                {line.note}
                              </p>
                            ) : null}
                          </div>
                          <span className="shrink-0 font-medium text-accent-wood">
                            ×{line.qty}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="h-px bg-border/60" />
                    <div className="flex items-center justify-between tabular-nums">
                      <span className="font-display font-semibold text-accent-wood">
                        Tổng (theo Pi)
                      </span>
                      <span className="font-display text-2xl font-bold text-primary">
                        {formatVnd(detailTotal)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Chọn một dòng trong bảng để xem món trong đơn.
                  </p>
                )}
              </div>
              <div className="flex items-center gap-4 rounded-2xl border border-border border-l-4 border-l-primary/40 bg-surface p-6">
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UtensilsCrossed className="size-6" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Ghi nhớ vận hành
                  </p>
                  <p className="font-semibold text-foreground">
                    Đối chiếu với PIC trước khi tiếp tục phục vụ bàn khác.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </main>

      <footer className="mt-auto border-t border-border bg-muted/40 px-6 py-4">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>Đồng bộ trạng thái với Raspberry Pi (demo) — không thu tiền trên web.</p>
          <span className="uppercase tracking-widest opacity-70">
            CMD_COUNTER_PAID tại PIC
          </span>
        </div>
      </footer>
    </div>
  )
}
