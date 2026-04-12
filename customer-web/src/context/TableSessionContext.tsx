import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { fetchCustomerTable } from '@/api/customerApi'
import { ApiError } from '@/api/http'
import { defaultTableCode } from '@/lib/env'

export function resolveTableCodeFromLocation(
  pathParam: string | undefined,
  searchParams: URLSearchParams,
): number {
  if (pathParam != null && pathParam.trim() !== '') {
    const n = Number(pathParam)
    if (Number.isFinite(n) && n > 0) return Math.floor(n)
  }
  const q = searchParams.get('table')
  if (q != null && q.trim() !== '') {
    const n = Number(q)
    if (Number.isFinite(n) && n > 0) return Math.floor(n)
  }
  return defaultTableCode()
}

interface TableSessionValue {
  readonly tableCode: number
  readonly tableLabel: string
  readonly tableState: string | null
  readonly sessionLoading: boolean
  readonly sessionError: string | null
  readonly refetchSession: () => Promise<void>
}

const TableSessionContext = createContext<TableSessionValue | null>(null)

export function TableSessionProvider({ children }: { readonly children: ReactNode }) {
  const { tableCode: pathTableCode } = useParams()
  const [searchParams] = useSearchParams()
  const tableCode = useMemo(
    () => resolveTableCodeFromLocation(pathTableCode, searchParams),
    [pathTableCode, searchParams],
  )

  const [tableLabel, setTableLabel] = useState('')
  const [tableState, setTableState] = useState<string | null>(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [sessionError, setSessionError] = useState<string | null>(null)

  const refetchSession = useCallback(async () => {
    setSessionLoading(true)
    setSessionError(null)
    try {
      const t = await fetchCustomerTable(tableCode)
      setTableLabel(t.label)
      setTableState(t.state)
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : 'Không tải được thông tin bàn'
      setSessionError(msg)
      setTableLabel('')
      setTableState(null)
    } finally {
      setSessionLoading(false)
    }
  }, [tableCode])

  useEffect(() => {
    void refetchSession()
  }, [refetchSession])

  const value = useMemo<TableSessionValue>(
    () => ({
      tableCode,
      tableLabel,
      tableState,
      sessionLoading,
      sessionError,
      refetchSession,
    }),
    [
      tableCode,
      tableLabel,
      tableState,
      sessionLoading,
      sessionError,
      refetchSession,
    ],
  )

  return (
    <TableSessionContext.Provider value={value}>
      {children}
    </TableSessionContext.Provider>
  )
}

export function useTableSession() {
  const ctx = useContext(TableSessionContext)
  if (!ctx) throw new Error('useTableSession cần TableSessionProvider')
  return ctx
}
