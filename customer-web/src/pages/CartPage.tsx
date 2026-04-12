import { CreditCard, Send, ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppHeader } from '@/components/AppHeader'
import { CartLineItem } from '@/components/CartLineItem'
import { EmptyState } from '@/components/EmptyState'
import { PrimaryButton } from '@/components/PrimaryButton'
import { SecondaryButton } from '@/components/SecondaryButton'
import { useCart } from '@/context/CartContext'
import { useTableSession } from '@/context/TableSessionContext'
import { postDevKitchenDone } from '@/api/devApi'
import { ApiError } from '@/api/http'
import { showE2eDevPanel } from '@/lib/e2eDev'
import { menuPath } from '@/lib/paths'
import { formatVnd } from '@/lib/money'

export function CartPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    tableCode,
    tableLabel,
    sessionError,
    refetchSession,
    sessionLoading,
  } = useTableSession()
  const {
    lines,
    note,
    setNote,
    setQuantity,
    removeLine,
    subtotalVnd,
    submitState,
    submitError,
    sendOrder,
    resetAfterSuccess,
    orderStatus,
    paymentStatus,
    orderDisplayId,
    cartLoading,
    cartError,
    canEditLines,
    requestPaymentState,
    requestPaymentError,
    requestPayment,
    clearPaymentFeedback,
    refetchActiveCart,
  } = useCart()

  const [devKitchenBusy, setDevKitchenBusy] = useState(false)
  const [devKitchenErr, setDevKitchenErr] = useState<string | null>(null)

  const goMenu = () => navigate(menuPath(location))

  if (sessionError) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 pt-24">
        <p className="text-center text-sm text-state-danger">{sessionError}</p>
        <button
          type="button"
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm"
          onClick={() => void refetchSession()}
        >
          Thử lại
        </button>
      </div>
    )
  }

  if (submitState === 'success') {
    return (
      <div className="min-h-dvh bg-canvas px-6 pt-24 pb-10">
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-surface p-6 text-center shadow-soft">
          <p className="font-display text-lg font-semibold text-foreground">
            Đã gửi bếp — cảm ơn bạn, chúc ngon miệng!
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Bạn có thể tiếp tục gọi thêm món cho cùng bàn (khi bếp còn nhận đơn).
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <PrimaryButton type="button" fullWidth onClick={resetAfterSuccess}>
              Tiếp tục xem giỏ / gọi thêm
            </PrimaryButton>
            <SecondaryButton type="button" fullWidth onClick={goMenu}>
              Về thực đơn
            </SecondaryButton>
          </div>
        </div>
      </div>
    )
  }

  const showPaymentBlock =
    orderStatus === 'DONE' &&
    (paymentStatus === 'NONE' || paymentStatus === 'REQUESTED')

  const tablePill =
    sessionLoading && !tableLabel ? `Mã ${tableCode}` : tableLabel || `Mã ${tableCode}`

  return (
    <div className="min-h-dvh pb-44">
      <AppHeader
        variant="cart"
        title="Giỏ hàng"
        tableLabel={tablePill}
        onBack={goMenu}
      />
      <main className="mx-auto max-w-md px-6 pt-24">
        {cartLoading ? (
          <p className="text-sm text-muted-foreground">Đang tải đơn của bàn…</p>
        ) : null}
        {cartError ? (
          <p className="mb-4 text-sm text-state-danger">{cartError}</p>
        ) : null}

        {orderDisplayId ? (
          <p className="mb-4 text-xs text-muted-foreground">
            Đơn hiện tại: {orderDisplayId}
            {orderStatus ? ` · ${orderStatus}` : ''}
            {paymentStatus ? ` · TT: ${paymentStatus}` : ''}
          </p>
        ) : null}

        {!canEditLines && lines.length > 0 ? (
          <div className="mb-6 rounded-lg border border-state-warning/40 bg-state-warning/10 p-3 text-sm text-foreground">
            Bếp đã xong đơn — không chỉnh sửa món trên đơn này. Bạn có thể yêu cầu
            thanh toán khi đã ăn xong.
          </div>
        ) : null}

        {lines.length === 0 ? (
          <EmptyState
            title="Giỏ đang trống"
            description="Chọn thêm món thanh đạm nhé?"
            actionLabel="Về thực đơn"
            onAction={goMenu}
          />
        ) : (
          <section className="space-y-8">
            {lines.map((l) => (
              <CartLineItem
                key={l.menuItemId}
                name={l.name}
                unitPriceVnd={l.unitPriceVnd}
                quantity={l.quantity}
                imageUrl={l.imageUrl}
                imageAlt={l.name}
                readOnly={!canEditLines}
                onIncrement={() => setQuantity(l.menuItemId, l.quantity + 1)}
                onDecrement={() => setQuantity(l.menuItemId, l.quantity - 1)}
                onRemove={() => removeLine(l.menuItemId)}
              />
            ))}
          </section>
        )}

        {lines.length > 0 ? (
          <>
            <div className="my-10 flex justify-center">
              <div className="h-px w-12 bg-border/60" />
            </div>
            <section>
              <label
                htmlFor="order-note"
                className="mb-2 ml-1 block text-sm font-semibold text-muted-foreground"
              >
                Ghi chú cho bếp
              </label>
              <textarea
                id="order-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={!canEditLines}
                placeholder="Ghi chú cho bếp (không bắt buộc)"
                rows={3}
                className="w-full resize-none rounded-lg border border-border/80 bg-surface p-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
              />
            </section>
            <section className="mt-10 space-y-2">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Tạm tính</span>
                <span className="tabular-nums">{formatVnd(subtotalVnd)}</span>
              </div>
              <div className="mt-2 flex items-end justify-between border-t border-border/40 pt-4">
                <span className="font-display text-base font-bold text-foreground">
                  Tổng cộng
                </span>
                <span className="font-display text-xl font-bold tabular-nums text-primary">
                  {formatVnd(subtotalVnd)}
                </span>
              </div>
            </section>
          </>
        ) : null}

        {showPaymentBlock && lines.length > 0 ? (
          <section className="mt-8 space-y-3 rounded-xl border border-border bg-muted/30 p-4">
            <p className="text-sm font-medium text-foreground">
              Thanh toán tại quầy (PIC). Ở đây chỉ gửi yêu cầu để nhân viên thấy
              trên hệ thống.
            </p>
            {paymentStatus === 'REQUESTED' ? (
              <p className="text-sm text-muted-foreground">
                Đã gửi yêu cầu thanh toán — vui lòng chờ nhân viên xác nhận tại
                quầy.
              </p>
            ) : (
              <PrimaryButton
                type="button"
                fullWidth
                disabled={requestPaymentState === 'sending'}
                onClick={() => {
                  clearPaymentFeedback()
                  requestPayment()
                }}
              >
                <CreditCard className="size-5" strokeWidth={1.75} />
                {requestPaymentState === 'sending'
                  ? 'Đang gửi…'
                  : 'Yêu cầu thanh toán'}
              </PrimaryButton>
            )}
            {requestPaymentError ? (
              <p className="text-sm text-state-danger">{requestPaymentError}</p>
            ) : null}
            {requestPaymentState === 'success' ? (
              <p className="text-sm font-medium text-primary">
                Đã gửi yêu cầu thanh toán.
              </p>
            ) : null}
          </section>
        ) : null}

        {showE2eDevPanel() &&
        orderStatus === 'IN_KITCHEN' &&
        lines.length > 0 ? (
          <section className="mt-8 rounded-xl border-2 border-dashed border-state-warning/50 bg-state-warning/10 p-4 text-xs text-foreground">
            <p className="mb-2 font-bold uppercase tracking-wide text-accent-wood">
              Test local — giả PIC bếp
            </p>
            <p className="mb-3 text-muted-foreground">
              Cần backend <code className="rounded bg-muted px-1">PI_DEBUG=1</code>.
              Nút này gọi <code className="rounded bg-muted px-1">POST .../dev/.../kitchen-done</code>{' '}
              (không dùng trên bản thật).
            </p>
            <button
              type="button"
              disabled={devKitchenBusy}
              className="w-full rounded-lg border border-border bg-surface py-2 text-sm font-medium disabled:opacity-50"
              onClick={() => {
                setDevKitchenErr(null)
                setDevKitchenBusy(true)
                void (async () => {
                  try {
                    await postDevKitchenDone(tableCode)
                    await refetchActiveCart()
                    void refetchSession()
                  } catch (e) {
                    const text =
                      e instanceof ApiError
                        ? `${e.message}${e.status === 404 ? ' — bật PI_DEBUG=1 trên Pi backend' : ''}`
                        : e instanceof Error
                          ? e.message
                          : 'Lỗi'
                    setDevKitchenErr(text)
                  } finally {
                    setDevKitchenBusy(false)
                  }
                })()
              }}
            >
              {devKitchenBusy ? 'Đang gửi…' : 'Dev: bếp xong (CMD_KITCHEN_DONE)'}
            </button>
            {devKitchenErr ? (
              <p className="mt-2 text-state-danger">{devKitchenErr}</p>
            ) : null}
          </section>
        ) : null}
      </main>

      {lines.length > 0 && canEditLines ? (
        <nav className="fixed bottom-0 left-0 z-40 w-full border-t border-border/40 bg-canvas px-6 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div className="mx-auto max-w-md space-y-3">
            {submitError ? (
              <p className="text-center text-xs text-state-danger">{submitError}</p>
            ) : null}
            <PrimaryButton
              type="button"
              fullWidth
              disabled={submitState === 'sending'}
              onClick={sendOrder}
            >
              <Send className="size-5" strokeWidth={1.75} />
              {submitState === 'sending'
                ? 'Đang gửi xuống bếp…'
                : 'Gửi đơn'}
            </PrimaryButton>
            <SecondaryButton
              type="button"
              fullWidth
              ghost
              className="min-h-10"
              onClick={goMenu}
            >
              <ShoppingCart className="size-[18px]" strokeWidth={1.75} />
              Tiếp tục chọn món
            </SecondaryButton>
          </div>
        </nav>
      ) : null}
    </div>
  )
}
