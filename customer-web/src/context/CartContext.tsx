import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  fetchActiveOrder,
  postActiveOrder,
  postPaymentRequest,
} from '@/api/customerApi'
import { ApiError } from '@/api/http'
import { formatVnd } from '@/lib/money'
import type { CartLine, MenuItem } from '@/types/domain'
import { useTableSession } from '@/context/TableSessionContext'

interface CartContextValue {
  readonly lines: readonly CartLine[]
  readonly note: string
  readonly setNote: (v: string) => void
  readonly addMenuItem: (item: MenuItem) => void
  readonly setQuantity: (menuItemId: string, quantity: number) => void
  readonly removeLine: (menuItemId: string) => void
  readonly itemCount: number
  readonly subtotalVnd: number
  readonly formattedSubtotal: string
  readonly submitState: 'idle' | 'sending' | 'success' | 'error'
  readonly submitError: string | null
  readonly sendOrder: () => void
  readonly resetAfterSuccess: () => void
  readonly orderStatus: string | null
  readonly paymentStatus: string | null
  readonly orderDisplayId: string | null
  readonly cartLoading: boolean
  readonly cartError: string | null
  readonly refetchActiveCart: () => Promise<void>
  readonly canEditLines: boolean
  readonly requestPaymentState: 'idle' | 'sending' | 'success' | 'error'
  readonly requestPaymentError: string | null
  readonly requestPayment: () => void
  readonly clearPaymentFeedback: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

function linesFromServer(
  lines: readonly {
    menuItemId: string
    name: string
    unitPriceVnd: number
    quantity: number
    imageUrl: string
    lineNote: string
  }[],
): CartLine[] {
  return lines.map((l) => ({
    menuItemId: l.menuItemId,
    name: l.name,
    unitPriceVnd: l.unitPriceVnd,
    quantity: l.quantity,
    imageUrl: l.imageUrl || '',
    lineNote: l.lineNote || '',
  }))
}

export function CartProvider({ children }: { readonly children: ReactNode }) {
  const { tableCode, sessionError } = useTableSession()
  const [lines, setLines] = useState<CartLine[]>([])
  const [note, setNote] = useState('')
  const [submitState, setSubmitState] = useState<
    'idle' | 'sending' | 'success' | 'error'
  >('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [orderStatus, setOrderStatus] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null)
  const [orderDisplayId, setOrderDisplayId] = useState<string | null>(null)
  const [cartLoading, setCartLoading] = useState(false)
  const [cartError, setCartError] = useState<string | null>(null)
  const [requestPaymentState, setRequestPaymentState] = useState<
    'idle' | 'sending' | 'success' | 'error'
  >('idle')
  const [requestPaymentError, setRequestPaymentError] = useState<string | null>(
    null,
  )

  const canEditLines = orderStatus !== 'DONE'

  const refetchActiveCart = useCallback(async () => {
    if (sessionError) return
    setCartLoading(true)
    setCartError(null)
    try {
      const { order } = await fetchActiveOrder(tableCode)
      if (order) {
        setLines(linesFromServer(order.lines))
        setNote(order.note || '')
        setOrderStatus(order.status)
        setPaymentStatus(order.payment?.status ?? 'NONE')
        setOrderDisplayId(order.displayId)
      } else {
        setLines([])
        setNote('')
        setOrderStatus(null)
        setPaymentStatus(null)
        setOrderDisplayId(null)
      }
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : 'Không tải được đơn của bàn'
      setCartError(msg)
    } finally {
      setCartLoading(false)
    }
  }, [tableCode, sessionError])

  useEffect(() => {
    if (!sessionError) void refetchActiveCart()
  }, [refetchActiveCart, sessionError])

  const addMenuItem = useCallback((item: MenuItem) => {
    if (orderStatus === 'DONE') return
    setLines((prev) => {
      const i = prev.findIndex((l) => l.menuItemId === item.id)
      if (i === -1) {
        return [
          ...prev,
          {
            menuItemId: item.id,
            name: item.name,
            unitPriceVnd: item.priceVnd,
            quantity: 1,
            imageUrl: item.imageUrl,
            lineNote: '',
          },
        ]
      }
      const next = [...prev]
      const cur = next[i]!
      next[i] = { ...cur, quantity: cur.quantity + 1 }
      return next
    })
  }, [orderStatus])

  const setQuantity = useCallback(
    (menuItemId: string, quantity: number) => {
      if (orderStatus === 'DONE') return
      if (quantity <= 0) {
        setLines((prev) => prev.filter((l) => l.menuItemId !== menuItemId))
        return
      }
      setLines((prev) =>
        prev.map((l) =>
          l.menuItemId === menuItemId ? { ...l, quantity } : l,
        ),
      )
    },
    [orderStatus],
  )

  const removeLine = useCallback(
    (menuItemId: string) => {
      if (orderStatus === 'DONE') return
      setLines((prev) => prev.filter((l) => l.menuItemId !== menuItemId))
    },
    [orderStatus],
  )

  const itemCount = useMemo(
    () => lines.reduce((s, l) => s + l.quantity, 0),
    [lines],
  )

  const subtotalVnd = useMemo(
    () => lines.reduce((s, l) => s + l.unitPriceVnd * l.quantity, 0),
    [lines],
  )

  const sendOrder = useCallback(() => {
    if (lines.length === 0 || orderStatus === 'DONE') return
    setSubmitState('sending')
    setSubmitError(null)
    void (async () => {
      try {
        await postActiveOrder(tableCode, {
          lines: lines.map((l) => ({
            menuItemId: l.menuItemId,
            quantity: l.quantity,
            lineNote: l.lineNote,
          })),
          orderNote: note,
        })
        setSubmitState('success')
        await refetchActiveCart()
      } catch (e) {
        setSubmitState('error')
        const msg =
          e instanceof ApiError
            ? e.message
            : e instanceof Error
              ? e.message
              : 'Gửi đơn thất bại'
        setSubmitError(msg)
      }
    })()
  }, [lines, note, tableCode, orderStatus, refetchActiveCart])

  const resetAfterSuccess = useCallback(() => {
    setSubmitState('idle')
    setSubmitError(null)
  }, [])

  const requestPayment = useCallback(() => {
    setRequestPaymentState('sending')
    setRequestPaymentError(null)
    void (async () => {
      try {
        await postPaymentRequest(tableCode)
        setRequestPaymentState('success')
        await refetchActiveCart()
      } catch (e) {
        setRequestPaymentState('error')
        const msg =
          e instanceof ApiError
            ? e.message
            : e instanceof Error
              ? e.message
              : 'Gửi yêu cầu thanh toán thất bại'
        setRequestPaymentError(msg)
      }
    })()
  }, [tableCode, refetchActiveCart])

  const clearPaymentFeedback = useCallback(() => {
    setRequestPaymentState('idle')
    setRequestPaymentError(null)
  }, [])

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      note,
      setNote,
      addMenuItem,
      setQuantity,
      removeLine,
      itemCount,
      subtotalVnd,
      formattedSubtotal: formatVnd(subtotalVnd),
      submitState,
      submitError,
      sendOrder,
      resetAfterSuccess,
      orderStatus,
      paymentStatus,
      orderDisplayId,
      cartLoading,
      cartError,
      refetchActiveCart,
      canEditLines,
      requestPaymentState,
      requestPaymentError,
      requestPayment,
      clearPaymentFeedback,
    }),
    [
      lines,
      note,
      addMenuItem,
      setQuantity,
      removeLine,
      itemCount,
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
      refetchActiveCart,
      canEditLines,
      requestPaymentState,
      requestPaymentError,
      requestPayment,
      clearPaymentFeedback,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart cần CartProvider')
  return ctx
}
