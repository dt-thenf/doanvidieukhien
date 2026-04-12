export function formatVnd(amountMinor: number): string {
  return `${amountMinor.toLocaleString('vi-VN')}đ`
}
