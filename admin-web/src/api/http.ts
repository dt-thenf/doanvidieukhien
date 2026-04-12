export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly body?: unknown

  constructor(message: string, status: number, code?: string, body?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.body = body
  }
}

function readDetail(detail: unknown): { message: string; code?: string } {
  if (detail == null) return { message: 'Lỗi không xác định' }
  if (typeof detail === 'string') return { message: detail }
  if (typeof detail === 'object' && detail !== null) {
    const o = detail as Record<string, unknown>
    const code = typeof o.code === 'string' ? o.code : undefined
    const message = typeof o.message === 'string' ? o.message : undefined
    if (message) return { message, code }
  }
  return { message: 'Lỗi không xác định' }
}

export async function fetchJson<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const method = (init?.method ?? 'GET').toUpperCase()
  const withBody = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(withBody ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  })

  const text = await res.text()
  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text) as unknown
    } catch {
      data = text
    }
  }

  if (!res.ok) {
    const bodyObj =
      data && typeof data === 'object' ? (data as Record<string, unknown>) : null
    const detail = bodyObj?.detail
    const { message, code } = readDetail(detail)
    throw new ApiError(message || res.statusText, res.status, code, data)
  }

  return data as T
}
