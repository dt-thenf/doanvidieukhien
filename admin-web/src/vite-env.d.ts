/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  /** `1` = hiện thanh giả lập PIC trên Tổng quan bàn (cần PI_DEBUG=1 trên backend). */
  readonly VITE_ENABLE_E2E_DEV_PANEL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
