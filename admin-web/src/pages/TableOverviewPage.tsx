import { CheckCircle2, CreditCard, UtensilsCrossed } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { AppHeader } from '@/components/AppHeader'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { DataTable } from '@/components/DataTable'
import { FilterBar } from '@/components/FilterBar'
import { KPITile } from '@/components/KPITile'
import { SecondaryButton } from '@/components/SecondaryButton'
import { StatusChip } from '@/components/StatusChip'
import { postResetTable, fetchTablesOverview } from '@/api/adminApi'
import { ApiError } from '@/api/http'
import { E2eDevToolbar, showE2eDevToolbar } from '@/components/E2eDevToolbar'
import type { TableOverviewRow, TableStateUi } from '@/types/domain'

const FILTER_OPTIONS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'idle', label: 'Trống' },
  { id: 'open', label: 'Đang phục vụ' },
  { id: 'payment', label: 'Chờ thanh toán' },
  { id: 'settled', label: 'Đã kết sổ' },
] as const

function parseTableState(raw: string): TableStateUi {
  if (
    raw === 'IDLE' ||
    raw === 'OPEN' ||
    raw === 'PAYMENT_REQUESTED' ||
    raw === 'SETTLED'
  ) {
    return raw
  }
  return 'IDLE'
}

function matchesFilter(row: TableOverviewRow, filterId: string): boolean {
  if (filterId === 'all') return true
  if (filterId === 'idle') return row.state === 'IDLE'
  if (filterId === 'open') return row.state === 'OPEN'
  if (filterId === 'payment') return row.state === 'PAYMENT_REQUESTED'
  if (filterId === 'settled') return row.state === 'SETTLED'
  return true
}

export function TableOverviewPage() {
  const [filter, setFilter] = useState<string>('all')
  const [rows, setRows] = useState<TableOverviewRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resetTarget, setResetTarget] = useState<TableOverviewRow | null>(null)
  const [resetError, setResetError] = useState<string | null>(null)
  const [resetting, setResetting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchTablesOverview()
      setRows(
        data.rows.map((r) => ({
          id: r.id,
          label: r.label,
          state: parseTableState(r.state),
          orderId: r.orderId,
          totalVnd: r.totalVnd,
          updatedAgo: r.updatedAgo,
        })),
      )
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : 'Không tải được tổng quan bàn'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const kpi = useMemo(() => {
    let open = 0
    let paymentRequested = 0
    let settled = 0
    for (const r of rows) {
      if (r.state === 'OPEN') open += 1
      if (r.state === 'PAYMENT_REQUESTED') paymentRequested += 1
      if (r.state === 'SETTLED') settled += 1
    }
    return { open, paymentRequested, settled }
  }, [rows])

  const filtered = useMemo(
    () => rows.filter((r) => matchesFilter(r, filter)),
    [rows, filter],
  )

  return (
    <div className="min-h-dvh">
      <AppHeader />
      <main className="mx-auto max-w-[1280px] px-6 py-8">
        {showE2eDevToolbar() ? (
          <E2eDevToolbar onAfterAction={() => void load()} />
        ) : null}
        <div className="mb-8 flex flex-col items-end gap-6 md:flex-row md:justify-between">
          <div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-accent-wood">
              Theo dõi nhanh
            </p>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Tổng quan bàn
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <KPITile
              icon={UtensilsCrossed}
              label="Đang phục vụ"
              value={kpi.open}
            />
            <KPITile
              icon={CreditCard}
              label="Chờ thanh toán"
              value={kpi.paymentRequested}
              iconClassName="bg-state-warning/40 text-foreground"
            />
            <KPITile
              icon={CheckCircle2}
              label="Đã kết sổ"
              value={kpi.settled}
              iconClassName="bg-state-success/50 text-foreground"
            />
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <FilterBar
            className="flex-1"
            options={FILTER_OPTIONS}
            value={filter}
            onChange={setFilter}
          />
          <SecondaryButton type="button" className="min-h-9" onClick={() => void load()}>
            Làm mới
          </SecondaryButton>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Đang tải…</p>
        ) : error ? (
          <div className="space-y-2">
            <p className="text-sm text-state-danger">{error}</p>
            <SecondaryButton type="button" onClick={() => void load()}>
              Thử lại
            </SecondaryButton>
          </div>
        ) : (
          <DataTable>
            <table className="w-full min-w-[720px] border-collapse text-left text-sm tabular-nums">
              <thead className="bg-muted/80">
                <tr>
                  {(
                    [
                      'Bàn',
                      'Trạng thái',
                      'Mã đơn',
                      'Tổng (VNĐ)',
                      'Cập nhật',
                      'Thao tác',
                    ] as const
                  ).map((h) => (
                    <th
                      key={h}
                      className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-canvas/80">
                    <td className="px-6 py-5 font-semibold text-primary">
                      {row.label}
                    </td>
                    <td className="px-6 py-5">
                      <StatusChip tableState={row.state} />
                    </td>
                    <td className="px-6 py-5 text-muted-foreground">
                      {row.orderId ?? '—'}
                    </td>
                    <td className="px-6 py-5 font-medium text-foreground">
                      {row.totalVnd.toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-5 text-muted-foreground">
                      {row.updatedAgo}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-3">
                        {row.state === 'SETTLED' ? (
                          <SecondaryButton
                            type="button"
                            className="min-h-8"
                            onClick={() => {
                              setResetError(null)
                              setResetTarget(row)
                            }}
                          >
                            Reset bàn
                          </SecondaryButton>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DataTable>
        )}
      </main>

      <footer className="mt-12 border-t border-border py-8">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-4 px-6 text-center text-[11px] text-muted-foreground md:flex-row md:text-left">
          <p>Nhà hàng chay — demo Pi + PIC · chỉ theo dõi trạng thái trên web</p>
        </div>
      </footer>

      <ConfirmDialog
        open={resetTarget !== null}
        onOpenChange={(o) => !o && setResetTarget(null)}
        closeOnConfirm={false}
        title="Reset bàn sau khi đã kết sổ?"
        description={
          resetTarget
            ? `${resetTarget.label} · ${resetTarget.orderId ?? '—'} — chỉ khi bàn SETTLED trên Pi.`
            : undefined
        }
        confirmLabel={resetting ? 'Đang xử lý…' : 'Xác nhận reset'}
        onConfirm={() => {
          if (!resetTarget) return
          const code = Number(resetTarget.id)
          if (!Number.isFinite(code)) return
          setResetting(true)
          setResetError(null)
          void (async () => {
            try {
              await postResetTable(code)
              setResetTarget(null)
              await load()
            } catch (e) {
              const msg =
                e instanceof ApiError
                  ? e.message
                  : e instanceof Error
                    ? e.message
                    : 'Reset thất bại'
              setResetError(msg)
            } finally {
              setResetting(false)
            }
          })()
        }}
      />
      {resetError ? (
        <p className="mx-auto max-w-[1280px] px-6 pb-6 text-sm text-state-danger">
          {resetError}
        </p>
      ) : null}
    </div>
  )
}
