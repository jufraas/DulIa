import { useMemo } from 'react'
import { TrendingUp } from 'lucide-react'
import { useProfileStore } from '../../store/useProfileStore'
import { parseTimelineResponse } from '../../utils/timelineDisplay'

export default function CareerTimeline() {
  const timeline = useProfileStore((s) => s.timeline)
  const data = useMemo(() => parseTimelineResponse(timeline), [timeline])

  if (!data) {
    return (
      <div className="card-dl p-7">
        <div className="eyebrow-dl">
          <TrendingUp className="h-3.5 w-3.5" aria-hidden />
          Tu proyección 90 días
        </div>
        <p className="mt-3 text-[15px] text-[color:var(--fg-2)]">
          Generando timeline de tu plan…
        </p>
      </div>
    )
  }

  const maxScore = Math.max(...data.fases.map((f) => f.score ?? 0), 1)

  return (
    <div className="card-dl p-7">
      <div className="eyebrow-dl mb-2">
        <TrendingUp className="h-3.5 w-3.5" aria-hidden />
        Tu proyección 90 días
      </div>
      {data.proyeccion && (
        <p className="mb-6 text-sm leading-relaxed text-[color:var(--fg-2)]">{data.proyeccion}</p>
      )}

      <div className="relative flex flex-col gap-0 pl-2">
        <div
          className="absolute bottom-4 left-[11px] top-4 w-0.5"
          style={{ background: 'linear-gradient(180deg, var(--violet-400), var(--pink-400))' }}
          aria-hidden
        />

        {data.fases.map((fase, i) => {
          const isStart = fase.dia === 0
          return (
            <div key={`${fase.dia}-${fase.titulo}`} className="relative flex gap-4 pb-8 last:pb-0">
              <div
                className="relative z-[1] mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold text-white"
                style={{
                  background: isStart ? 'var(--grad-cta)' : 'var(--grad-brand)',
                  boxShadow: isStart
                    ? '0 0 16px rgba(236,72,153,0.5)'
                    : '0 0 12px rgba(124,58,237,0.4)',
                }}
              >
                {isStart ? '●' : i}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="text-[15px] font-bold text-[color:var(--fg-1)]">
                    {fase.titulo}
                  </span>
                  {!isStart && (
                    <span className="text-[11px] font-semibold text-[color:var(--fg-3)]">
                      Día {fase.dia}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-[color:var(--fg-3)]">
                  {fase.descripcion}
                </p>

                {fase.score != null && (
                  <div className="mt-3">
                    <div className="mb-1 flex justify-between text-[11px] text-[color:var(--fg-3)]">
                      <span>Score esperado</span>
                      <span className="font-bold text-[color:var(--violet-200)]">
                        {fase.score}
                      </span>
                    </div>
                    <div
                      className="h-1.5 overflow-hidden rounded-full"
                      style={{ background: 'rgba(168,85,247,0.15)' }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, (fase.score / maxScore) * 100)}%`,
                          background: 'var(--grad-brand)',
                        }}
                      />
                    </div>
                  </div>
                )}

                {(fase.vacantesMatch != null || fase.habilidades != null) && (
                  <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-[color:var(--fg-3)]">
                    {fase.vacantesMatch != null && (
                      <span>
                        Vacantes match:{' '}
                        <strong className="text-[color:var(--fg-2)]">{fase.vacantesMatch}</strong>
                      </span>
                    )}
                    {fase.habilidades != null && (
                      <span>
                        Habilidades:{' '}
                        <strong className="text-[color:var(--fg-2)]">{fase.habilidades}</strong>
                      </span>
                    )}
                  </div>
                )}

                {fase.accionesCompletadas.length > 0 && (
                  <ul className="mt-2 list-none space-y-1 p-0 text-[12px] text-[color:var(--fg-3)]">
                    {fase.accionesCompletadas.map((a) => (
                      <li key={a}>✓ {a}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {data.tasaCrecimiento != null && (
        <p className="mt-4 text-center text-[12px] text-[color:var(--fg-3)]">
          Crecimiento estimado:{' '}
          <strong className="text-[#34D399]">+{data.tasaCrecimiento} pts/semana</strong>
        </p>
      )}
    </div>
  )
}
