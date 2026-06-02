/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BUILD_MODE: 'dev' | 'production'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
