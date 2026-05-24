import { MessageCircle, Sparkles, X } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useCoachContext } from '../../hooks/useCoachContext'
import Button from '../ui/Button'

export default function CoachPromptBanner() {
  const { pathname } = useLocation()
  const { showBanner, dismissBanner, openCoach, profile, topScore } = useCoachContext()

  if (pathname !== '/resultados' || !showBanner) return null

  const name = profile?.nombre?.split(' ')[0]

  return (
    <div
      className="anim-in-delay-1 mb-8 flex flex-col gap-4 rounded-[20px] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
      style={{
        background:
          'linear-gradient(135deg, rgba(124,58,237,0.14) 0%, rgba(236,72,153,0.08) 100%)',
        border: '1px solid rgba(168,85,247,0.30)',
      }}
      role="region"
      aria-label="Coach DulIA disponible"
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
          style={{ background: 'var(--grad-brand)' }}
          aria-hidden
        >
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="m-0 text-[15px] font-bold text-[color:var(--fg-1)]">
            {name ? `${name}, tu coach ya conoce tu perfil` : 'Tu coach ya conoce tu perfil'}
          </p>
          <p className="mt-1 mb-0 text-[14px] leading-relaxed text-[color:var(--fg-2)]">
            {topScore != null && topScore > 0
              ? `Pregúntame sobre tu score (${topScore}), el plan o cómo postularte — sin salir de esta pantalla.`
              : 'Pregúntame sobre el análisis, el plan o las oportunidades — sin salir de esta pantalla.'}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-stretch lg:flex-row lg:items-center">
        <Button
          variant="secondary"
          size="sm"
          iconLeft={<MessageCircle className="h-4 w-4" aria-hidden />}
          onClick={() => openCoach()}
          className="whitespace-nowrap"
        >
          Hablar con DulIA
        </Button>
        <button
          type="button"
          onClick={dismissBanner}
          className="rounded-lg p-2 text-[color:var(--fg-3)] transition hover:bg-white/5 hover:text-[color:var(--fg-1)]"
          aria-label="Ocultar aviso del coach"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
