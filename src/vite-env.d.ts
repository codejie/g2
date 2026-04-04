/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENCODE_BASE_URL: string
  readonly VITE_WORKSPACE: string
  readonly VITE_MODEL_IGNORE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
