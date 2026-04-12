/** Base URL Pi backend, không có dấu / cuối. */
export function apiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL
  if (raw != null && String(raw).trim() !== '') {
    return String(raw).replace(/\/$/, '')
  }
  return 'http://127.0.0.1:8000'
}

/** Mã bàn mặc định khi URL không có ?table= hoặc /t/:code */
export function defaultTableCode(): number {
  const raw = import.meta.env.VITE_DEFAULT_TABLE_CODE
  const n = raw != null && String(raw).trim() !== '' ? Number(raw) : 1
  if (!Number.isFinite(n) || n <= 0) return 1
  return Math.floor(n)
}
