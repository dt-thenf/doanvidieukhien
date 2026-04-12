/** total_minor / price VND nguyên → chuỗi hiển thị */
export function formatVnd(amountMinor: number): string {
  return `${amountMinor.toLocaleString('vi-VN')}đ`
}
