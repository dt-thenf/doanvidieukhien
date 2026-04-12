/** `1` = hiện nút giả lập bếp xong trên giỏ (cần PI_DEBUG=1). */
export function showE2eDevPanel(): boolean {
  return import.meta.env.VITE_ENABLE_E2E_DEV_PANEL === '1'
}
