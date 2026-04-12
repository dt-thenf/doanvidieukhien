/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_DEFAULT_TABLE_CODE?: string
  readonly VITE_ENABLE_E2E_DEV_PANEL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
