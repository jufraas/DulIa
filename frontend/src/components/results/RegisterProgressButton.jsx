import { useNavigate } from 'react-router-dom'
import { ClipboardList } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

/**
 * CTA para guardar el plan en Mi progreso (requiere sesión).
 * @param {{ compact?: boolean, className?: string }} props
 */
export default function RegisterProgressButton({ compact = false, className = '' }) {
  const navigate = useNavigate()
  const { user, isConfigured } = useAuth()

  function handleClick() {
    if (user) {
      navigate('/progreso')
      return
    }
    navigate('/login', { state: { from: '/progreso' } })
  }

  if (!isConfigured) return null

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-purple-500/40 bg-purple-500/10 px-5 py-3 text-[15px] font-bold text-[#C4B5FD] transition-colors hover:bg-purple-500/20 ${className}`}
      >
        <ClipboardList className="h-5 w-5 shrink-0" aria-hidden />
        Registrar mi progreso
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`relative flex w-full shrink-0 flex-col overflow-hidden rounded-[24px] border border-purple-500/35 bg-[#1A1A24] p-5 text-left transition-colors hover:border-purple-500/50 register-progress-btn ${className}`}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] border border-purple-500/30 text-[#C4B5FD]"
          style={{ background: 'rgba(168,85,247,0.12)' }}
        >
          <ClipboardList className="h-5 w-5" strokeWidth={2.2} aria-hidden />
        </div>
        <div className="flex-1">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-purple-300/80">
            Con cuenta DulIA
          </div>
          <div className="mt-0.5 font-[family-name:var(--font-display)] text-[18px] font-extrabold leading-[1.2] tracking-[-0.02em] text-[#F1F0FB] sm:text-[20px]">
            Registrar mi progreso
          </div>
          <p className="mt-1 mb-0 text-xs text-white/50">
            {user
              ? 'Marca tareas y sigue tu plan 30-60-90.'
              : 'Inicia sesión para guardar tu avance.'}
          </p>
        </div>
      </div>
    </button>
  )
}
