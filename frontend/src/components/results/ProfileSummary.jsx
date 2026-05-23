import { CheckCircle2, Lightbulb, Sparkles, TrendingUp } from 'lucide-react'
import SkillsChips from './SkillsChips'

/**
 * @param {{
 *   profile: import('../../store/useProfileStore').SavedProfile | null,
 *   topScore: number,
 *   topJobTitle?: string,
 *   insights?: import('../../utils/analysisDisplay').AnalysisInsights | null,
 * }} props
 */
export default function ProfileSummary({ profile, topScore, topJobTitle, insights }) {
  const skills = profile?.habilidades ?? []
  const hasInsights =
    insights &&
    (insights.fortalezas.length > 0 ||
      insights.debilidades.length > 0 ||
      insights.recomendaciones.length > 0 ||
      insights.oportunidades.length > 0)

  return (
    <div className="card-dl flex-1 p-7">
      <div className="eyebrow-dl mb-3.5">
        <Sparkles className="h-3.5 w-3.5" aria-hidden />
        Resumen — por DulIA
      </div>
      <p className="m-0 text-[17px] leading-relaxed text-[color:var(--fg-2)]">
        {profile?.nombre && (
          <>
            Hola <strong className="text-[color:var(--fg-1)]">{profile.nombre}</strong>
            {profile.ciudad ? ` de ${profile.ciudad}` : ''}.{' '}
          </>
        )}
        {insights?.descripcion ? (
          <>{insights.descripcion} </>
        ) : topJobTitle ? (
          <>
            Tu mejor match es{' '}
            <strong className="text-[color:var(--fg-1)]">{topJobTitle}</strong> con un score de{' '}
            <strong className="brand-text">{topScore}</strong> sobre 100.{' '}
          </>
        ) : (
          <>
            Tu score de empleabilidad es{' '}
            <strong className="brand-text">{topScore}</strong> sobre 100.{' '}
          </>
        )}
        {!insights?.descripcion &&
          'Aplica a las vacantes verdes primero y refuerza las habilidades que te faltan.'}
      </p>

      {hasInsights && (
        <div className="mt-5 space-y-4 border-t border-[rgba(168,85,247,0.15)] pt-5">
          {insights.fortalezas.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#34D399]">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                Fortalezas
              </div>
              <ul className="m-0 list-none space-y-1.5 p-0 text-[14px] leading-relaxed text-[color:var(--fg-2)]">
                {insights.fortalezas.map((item) => (
                  <li key={`${item.label}-${item.text}`}>
                    <strong className="text-[color:var(--fg-1)]">{item.label}:</strong>{' '}
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {insights.debilidades.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#FBBF24]">
                <TrendingUp className="h-3.5 w-3.5" aria-hidden />
                A mejorar
              </div>
              <ul className="m-0 list-none space-y-1.5 p-0 text-[14px] leading-relaxed text-[color:var(--fg-2)]">
                {insights.debilidades.map((item) => (
                  <li key={`${item.label}-${item.text}`}>
                    <strong className="text-[color:var(--fg-1)]">{item.label}:</strong>{' '}
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {insights.oportunidades[0] && (
            <div
              className="rounded-xl p-3.5 text-[14px] leading-relaxed"
              style={{
                background: 'rgba(124,58,237,0.10)',
                border: '1px solid rgba(168,85,247,0.25)',
              }}
            >
              <div className="mb-1 text-xs font-bold uppercase tracking-[0.08em] text-[color:var(--violet-200)]">
                Oportunidad · {insights.oportunidades[0].sector}
              </div>
              <p className="m-0 text-[color:var(--fg-2)]">{insights.oportunidades[0].razon}</p>
              {insights.oportunidades[0].accion && (
                <p className="mb-0 mt-2 text-[13px] font-semibold text-[color:var(--fg-1)]">
                  → {insights.oportunidades[0].accion}
                </p>
              )}
            </div>
          )}

          {insights.recomendaciones.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[color:var(--violet-200)]">
                <Lightbulb className="h-3.5 w-3.5" aria-hidden />
                Recomendaciones
              </div>
              <ul className="m-0 list-disc space-y-1 pl-5 text-[14px] leading-relaxed text-[color:var(--fg-2)]">
                {insights.recomendaciones.map((rec) => (
                  <li key={rec}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <SkillsChips skills={skills} />
    </div>
  )
}
