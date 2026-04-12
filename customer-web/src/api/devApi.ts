/** Chỉ khi backend bật PI_DEBUG=1 — route có thể 404. */
import { apiBaseUrl } from '@/lib/env'
import { fetchJson } from '@/api/http'

const devBase = () => `${apiBaseUrl()}/api/v1/dev`

export async function postDevKitchenDone(tableCode: number): Promise<Record<string, unknown>> {
  return fetchJson(`${devBase()}/tables/${tableCode}/kitchen-done`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}
