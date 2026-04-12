import type { Location } from 'react-router-dom'

/** Giữ mã bàn khi chuyển giữa thực đơn ↔ giỏ (path /t/:code hoặc ?table=). */
export function cartPath(loc: Pick<Location, 'pathname' | 'search'>): string {
  const m = loc.pathname.match(/^\/t\/([^/]+)/)
  if (m) return `/t/${m[1]}/cart`
  if (loc.search) return `/cart${loc.search}`
  return '/cart'
}

export function menuPath(loc: Pick<Location, 'pathname' | 'search'>): string {
  const m = loc.pathname.match(/^\/t\/([^/]+)/)
  if (m) return `/t/${m[1]}`
  if (loc.search) return `/${loc.search}`
  return '/'
}
