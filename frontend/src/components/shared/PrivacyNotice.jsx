import { Shield } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function PrivacyNotice({ className = '' }) {
  const { user, isConfigured } = useAuth()

  const copy = user
    ? 'Tu perfil queda vinculado a tu cuenta. Podrás retomar tu plan y progreso desde cualquier dispositivo.'
    : isConfigured
      ? 'Puedes completar el wizard sin cuenta. Si luego inicias sesión, vinculamos tu análisis para que guardes el progreso del plan.'
      : 'Tus respuestas se usan solo para generar tu análisis y recomendaciones. No compartimos tus datos con terceros.'

  return (
    <div
      className={`flex gap-3 rounded-[14px] px-4 py-3 text-sm text-[color:var(--fg-2)] ${className}`}
      style={{
        background: 'rgba(168,85,247,0.08)',
        border: '1px solid rgba(168,85,247,0.25)',
      }}
    >
      <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--violet-300)]" aria-hidden />
      <p className="m-0 leading-relaxed">{copy}</p>
    </div>
  )
}
