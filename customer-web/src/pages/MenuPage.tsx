import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppHeader } from '@/components/AppHeader'
import { CategoryChips } from '@/components/CategoryChips'
import { MenuItemCard } from '@/components/MenuItemCard'
import { StickySummaryBar } from '@/components/StickySummaryBar'
import { fetchCustomerMenu, type MenuCategoryDto } from '@/api/customerApi'
import { ApiError } from '@/api/http'
import { useCart } from '@/context/CartContext'
import { useTableSession } from '@/context/TableSessionContext'
import { cartPath } from '@/lib/paths'
import type { MenuItem } from '@/types/domain'

function sessionChipLabel(state: string | null): string {
  if (!state) return 'Đang gọi món'
  if (state === 'IDLE') return 'Bàn sẵn sàng'
  if (state === 'OPEN') return 'Đang gọi món'
  if (state === 'PAYMENT_REQUESTED') return 'Chờ thanh toán'
  if (state === 'SETTLED') return 'Đã kết sổ'
  return 'Đang gọi món'
}

export function MenuPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    tableCode,
    tableLabel,
    sessionLoading,
    sessionError,
    refetchSession,
    tableState,
  } = useTableSession()
  const { addMenuItem, itemCount, formattedSubtotal } = useCart()

  const [categories, setCategories] = useState<MenuCategoryDto[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [menuLoading, setMenuLoading] = useState(true)
  const [menuError, setMenuError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('')

  useEffect(() => {
    let cancelled = false
    setMenuLoading(true)
    setMenuError(null)
    void (async () => {
      try {
        const data = await fetchCustomerMenu()
        if (cancelled) return
        setCategories(data.categories)
        setMenuItems(data.items)
        const first = data.categories[0]?.id ?? ''
        setActiveCategory((prev) => (prev && data.categories.some((c) => c.id === prev) ? prev : first))
      } catch (e) {
        if (cancelled) return
        const msg =
          e instanceof ApiError
            ? e.message
            : e instanceof Error
              ? e.message
              : 'Không tải được thực đơn'
        setMenuError(msg)
      } finally {
        if (!cancelled) setMenuLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const items = useMemo(
    () => menuItems.filter((m) => m.categoryId === activeCategory),
    [menuItems, activeCategory],
  )

  const canAddToCart =
    tableState == null ||
    tableState === 'IDLE' ||
    tableState === 'OPEN'

  const headerLabel =
    sessionLoading && !tableLabel
      ? `Bàn (mã ${tableCode})`
      : tableLabel || 'Thực đơn chay'

  if (sessionError) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 pb-32 pt-24">
        <p className="text-center text-sm text-state-danger">{sessionError}</p>
        <button
          type="button"
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium"
          onClick={() => void refetchSession()}
        >
          Thử lại
        </button>
        <p className="text-center text-xs text-muted-foreground">
          Kiểm tra backend đang chạy và tham số bàn (?table= hoặc /t/1).
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-dvh pb-32">
      <AppHeader
        variant="menu"
        tableLabel={headerLabel}
        sessionLabel={sessionChipLabel(tableState)}
      />
      <main className="mx-auto max-w-md px-6 pt-20">
        {menuLoading ? (
          <p className="text-sm text-muted-foreground">Đang tải thực đơn…</p>
        ) : menuError ? (
          <div className="space-y-3">
            <p className="text-sm text-state-danger">{menuError}</p>
            <button
              type="button"
              className="rounded-lg border border-border px-3 py-1.5 text-sm"
              onClick={() => window.location.reload()}
            >
              Tải lại trang
            </button>
          </div>
        ) : (
          <>
            <CategoryChips
              categories={categories}
              activeId={activeCategory}
              onChange={setActiveCategory}
            />
            <div className="mb-8">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
                Hôm nay bếp có
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Món chay thanh đạm, phục vụ trong ngày.
              </p>
              {!canAddToCart ? (
                <p className="mt-3 rounded-lg border border-state-warning/50 bg-state-warning/15 px-3 py-2 text-sm text-foreground">
                  Bàn đang chờ thanh toán hoặc đã kết sổ — tạm thời không gọi thêm
                  món qua web.
                </p>
              ) : null}
            </div>
            <div className="space-y-10">
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Chưa có món trong danh mục này.
                </p>
              ) : (
                items.map((m) => (
                  <MenuItemCard
                    key={m.id}
                    name={m.name}
                    priceVnd={m.priceVnd}
                    imageUrl={m.imageUrl}
                    imageAlt={m.name}
                    tags={m.tags}
                    addDisabled={!canAddToCart}
                    onAdd={() => addMenuItem(m)}
                  />
                ))
              )}
            </div>
          </>
        )}
      </main>
      {itemCount > 0 ? (
        <StickySummaryBar
          itemCount={itemCount}
          totalLabel={formattedSubtotal}
          onOpenCart={() => navigate(cartPath(location))}
        />
      ) : null}
    </div>
  )
}
