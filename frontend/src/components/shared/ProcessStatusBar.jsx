import { Loader2 } from 'lucide-react'

/**
 * Barra fija inferior — visible aunque el usuario haga scroll (CV, análisis, etc.).
 * @param {{ title: string, message?: string }} props
 */
export default function ProcessStatusBar({ title, message }) {
  if (!title) return null

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] px-4 pb-4 sm:px-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className="mx-auto flex max-w-[760px] items-center gap-3.5 rounded-2xl px-4 py-3.5 shadow-2xl sm:px-5 sm:py-4"
        style={{
          background: 'rgba(13,13,13,0.92)',
          border: '1px solid rgba(168,85,247,0.45)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 -8px 40px rgba(124,58,237,0.25), 0 8px 32px rgba(0,0,0,0.45)',
        }}
      >
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white"
          style={{ background: 'var(--grad-brand)' }}
        >
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="m-0 font-[family-name:var(--font-display)] text-[15px] font-bold text-[color:var(--fg-1)] sm:text-base">
            {title}
          </p>
          {message && (
            <p className="mt-0.5 text-[13px] leading-snug text-[color:var(--fg-3)]">{message}</p>
          )}
        </div>
      </div>
    </div>
  )
}
