/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_BASE_PATH?: string
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_ANON_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/** Prototipos kit ReBrand (Landing.jsx, Wizard.jsx, …) — cargan `window.DK` vía script */
interface DuliaDesignKit {
  Logo: import('react').ComponentType<{ height?: number }>
  Button: import('react').ComponentType<Record<string, unknown>>
  Header: import('react').ComponentType<Record<string, unknown>>
  Chip: import('react').ComponentType<Record<string, unknown>>
  IconBox: import('react').ComponentType<Record<string, unknown>>
  Icon: import('react').ComponentType<Record<string, unknown>>
  ScoreRing: import('react').ComponentType<{
    value?: number
    size?: number
    stroke?: number
  }>
}

interface Window {
  DK: DuliaDesignKit
  Landing?: import('react').ComponentType<{
    onStart?: () => void
    onVacancies?: () => void
  }>
}
