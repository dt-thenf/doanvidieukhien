import { apiBaseUrl } from '@/lib/env'
import { fetchJson } from '@/api/http'
import type { MenuItem } from '@/types/domain'

const base = () => `${apiBaseUrl()}/api/v1/customer`

export interface MenuCategoryDto {
  readonly id: string
  readonly label: string
}

export interface CustomerTableDto {
  readonly tableCode: number
  readonly label: string
  readonly state: string
  readonly activeOrder: {
    readonly id: number
    readonly displayId: string
    readonly status: string
    readonly totalVnd: number
  } | null
}

export interface ActiveOrderLineDto {
  readonly menuItemId: string
  readonly name: string
  readonly unitPriceVnd: number
  readonly quantity: number
  readonly imageUrl: string
  readonly lineNote: string
}

export interface ActiveOrderDto {
  readonly id: number
  readonly displayId: string
  readonly status: string
  readonly note: string
  readonly lines: readonly ActiveOrderLineDto[]
  readonly totalVnd: number
  readonly payment: { readonly status: string }
}

export async function fetchCustomerTable(
  tableCode: number,
): Promise<CustomerTableDto> {
  return fetchJson<CustomerTableDto>(`${base()}/tables/${tableCode}`)
}

export async function fetchCustomerMenu(): Promise<{
  categories: MenuCategoryDto[]
  items: MenuItem[]
}> {
  return fetchJson(`${base()}/menu`)
}

export async function fetchActiveOrder(tableCode: number): Promise<{
  order: ActiveOrderDto | null
}> {
  return fetchJson(`${base()}/tables/${tableCode}/orders/active`)
}

export async function postActiveOrder(
  tableCode: number,
  body: {
    lines: { menuItemId: string; quantity: number; lineNote: string }[]
    orderNote: string
  },
): Promise<{
  orderId: number
  displayId: string
  status: string
  totalVnd: number
}> {
  return fetchJson(`${base()}/tables/${tableCode}/orders/active`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function postPaymentRequest(tableCode: number): Promise<{
  paymentStatus: string
  totalVnd: number
  orderId: number
}> {
  return fetchJson(`${base()}/tables/${tableCode}/payment/request`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}
