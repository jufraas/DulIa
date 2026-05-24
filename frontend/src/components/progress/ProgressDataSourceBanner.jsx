import { AlertTriangle, WifiOff } from 'lucide-react'

/**
 * Aviso cuando Mi Progreso usa datos mock (offline o demo forzado).
 * @param {{ dataSource: 'api' | 'mock', detail?: string }} props
 */
export default function ProgressDataSourceBanner({ dataSource, detail }) {
  if (dataSource !== 'mock') return null

  const message =
    detail?.includes('VITE_FORCE_PROGRESS_MOCK') || detail?.includes('demo forzado')
      ? 'Modo demo: los cambios se guardan solo en este navegador.'
      : detail || 'Sin conexión al backend. Mostramos datos de demostración locales.'

  return (
    <div
      className="mb-4 flex items-start gap-2.5 rounded-xl border border-amber-500/35 bg-amber-500/10 px-3.5 py-3 text-sm text-amber-100"
      role="status"
    >
      <WifiOff className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden />
      <div>
        <p className="m-0 font-semibold text-amber-50">Datos locales</p>
        <p className="mt-0.5 m-0 text-[13px] leading-snug text-amber-100/90">{message}</p>
        <p className="mt-1.5 m-0 flex items-center gap-1 text-[12px] text-amber-200/80">
          <AlertTriangle className="h-3 w-3" aria-hidden />
          Inicia el backend en :8000 para sincronizar con la API.
        </p>
      </div>
    </div>
  )
}
