import { Lock } from 'lucide-react'

/**
 * Envuelve contenido de fase; si está bloqueada muestra overlay con candado.
 * @param {{
 *   locked: boolean,
 *   message: string,
 *   children: import('react').ReactNode,
 * }} props
 */
export default function PhaseLockOverlay({ locked, message, children }) {
  return (
    <div className={`phase-lock-shell${locked ? ' phase-lock-shell--locked' : ''}`}>
      <div className="phase-lock-shell__content">{children}</div>
      {locked && (
        <div className="phase-lock-overlay" role="status" aria-live="polite">
          <div className="phase-lock-overlay__card">
            <div className="phase-lock-overlay__icon-wrap" aria-hidden>
              <Lock className="phase-lock-overlay__icon" strokeWidth={2.2} />
            </div>
            <p className="phase-lock-overlay__title">Fase bloqueada</p>
            <p className="phase-lock-overlay__message">{message}</p>
          </div>
        </div>
      )}
    </div>
  )
}
