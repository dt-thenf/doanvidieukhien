/**
 * Gọi route /api/v1/dev/* — backend chỉ mount khi PI_DEBUG=1.
 * UI chỉ render khi VITE_ENABLE_E2E_DEV_PANEL=1 (xem E2eDevToolbar).
 */
import { apiBaseUrl } from '@/lib/env'
import { fetchJson } from '@/api/http'

const devBase = () => `${apiBaseUrl()}/api/v1/dev`

export async function postDevKitchenDone(tableCode: number): Promise<Record<string, unknown>> {
  return fetchJson(`${devBase()}/tables/${tableCode}/kitchen-done`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export async function postDevCounterPaid(tableCode: number): Promise<Record<string, unknown>> {
  return fetchJson(`${devBase()}/tables/${tableCode}/counter-paid`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}
