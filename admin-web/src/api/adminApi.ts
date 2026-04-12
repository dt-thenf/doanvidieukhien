import { apiBaseUrl } from '@/lib/env'
import { fetchJson } from '@/api/http'

const base = () => `${apiBaseUrl()}/api/v1/admin`

export interface TableOverviewRowDto {
  readonly id: string
  readonly label: string
  readonly state: string
  readonly orderId: string | null
  readonly totalVnd: number
  readonly updatedAgo: string
}

export async function fetchTablesOverview(): Promise<{
  rows: TableOverviewRowDto[]
}> {
  return fetchJson(`${base()}/tables/overview`)
}

export interface PaymentQueueRowDto {
  readonly tableLabel: string
  readonly tableCode: number
  readonly orderId: string
  readonly totalVnd: number
  readonly requestedAgo: string
  readonly paymentStatus: string
}

export async function fetchPaymentsQueue(): Promise<{
  rows: PaymentQueueRowDto[]
}> {
  return fetchJson(`${base()}/payments/queue`)
}

export interface OrderDetailLineDto {
  readonly name: string
  readonly note: string | null
  readonly qty: number
}

export async function fetchOrderDetail(tableCode: number): Promise<{
  table: { code: number; label: string; state: string }
  order: {
    id: number
    displayId: string
    status: string
    note: string | null
    totalVnd: number
  }
  lines: OrderDetailLineDto[]
  payment: {
    status: string
    totalVnd: number
    requestedAt: string | null
  }
}> {
  return fetchJson(`${base()}/tables/${tableCode}/orders/detail`)
}

export async function postResetTable(tableCode: number): Promise<{
  tableCode: number
  state: string
}> {
  return fetchJson(`${base()}/tables/${tableCode}/reset`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}
