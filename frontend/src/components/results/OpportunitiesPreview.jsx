import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight, Briefcase } from 'lucide-react'
import { formatSalary } from '../../utils/formatters'

/**
 * Top 3 vacantes + link al panel — kit ReBrand Results.jsx → Opportunities
 * @param {{ jobs: import('../../store/useProfileStore').Job[] }} props
 */
export default function OpportunitiesPreview({ jobs }) {
  const top = [...jobs]
    .sort((a, b) => (b.score_compatibilidad ?? 0) - (a.score_compatibilidad ?? 0))
    .slice(0, 3)

  const redCount = jobs.filter((j) => j.semaforo === 'red').length

  return (
    <div className="card-dl p-7">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="eyebrow-dl">
          <Briefcase className="h-3.5 w-3.5" aria-hidden />
          Oportunidades para ti
        </div>
        <span className="text-xs text-[color:var(--fg-3)]">15.000 vacantes analizadas</span>
      </div>
      <h3 className="mb-5 text-[22px] font-bold tracking-[-0.015em] text-[color:var(--fg-1)]">
        {top.length > 0
          ? `${top.length} vacantes reales que cuadran contigo`
          : 'Vacantes que cuadran contigo'}
      </h3>

      <div className="flex flex-col gap-3">
        {top.map((job) => {
          const hot = (job.score_compatibilidad ?? 0) >= 90
          return (
            <div
              key={job.id}
              className="flex items-center gap-3.5 rounded-2xl p-4"
              style={{
                background: 'var(--bg-1)',
                border: '1px solid rgba(168,85,247,0.20)',
              }}
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-[family-name:var(--font-display)] text-base font-extrabold text-white"
                style={{ background: 'var(--grad-brand)' }}
              >
                {job.empresa[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[15px] font-bold text-[color:var(--fg-1)]">
                    {job.titulo}
                  </span>
                  {hot && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em]"
                      style={{
                        background: 'rgba(236,72,153,0.18)',
                        color: 'var(--magenta-300)',
                      }}
                    >
                      HOT
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-xs text-[color:var(--fg-3)]">
                  {job.empresa} · {job.ciudad}
                  {job.modalidad ? ` · ${job.modalidad}` : ''} ·{' '}
                  <strong className="text-[color:var(--fg-2)]">
                    {formatSalary(job.salario_min, job.salario_max)}
                  </strong>
                </div>
              </div>
              <div
                className="shrink-0 rounded-full px-2.5 py-1 text-xs font-bold"
                style={{
                  background:
                    (job.score_compatibilidad ?? 0) >= 90
                      ? 'rgba(52,211,153,0.14)'
                      : 'rgba(168,85,247,0.12)',
                  border: `1px solid ${
                    (job.score_compatibilidad ?? 0) >= 90
                      ? 'rgba(52,211,153,0.35)'
                      : 'rgba(168,85,247,0.30)'
                  }`,
                  color:
                    (job.score_compatibilidad ?? 0) >= 90 ? '#34D399' : 'var(--violet-200)',
                }}
              >
                {job.score_compatibilidad}% match
              </div>
            </div>
          )
        })}
      </div>

      {redCount > 0 && (
        <div
          className="mt-3.5 flex items-center gap-2.5 rounded-xl p-3 text-xs text-[color:var(--fg-2)]"
          style={{
            background: 'rgba(248,113,113,0.06)',
            border: '1px solid rgba(248,113,113,0.30)',
          }}
        >
          <AlertTriangle className="h-4 w-4 shrink-0 text-[#F87171]" aria-hidden />
          <span>
            <strong className="text-[#F87171]">{redCount} vacante(s) filtrada(s)</strong> ·
            patrones de riesgo detectados.
          </span>
        </div>
      )}

      <Link
        to="/vacantes"
        state={{ returnTo: '/resultados' }}
        className="btn btn-secondary mt-3.5 w-full justify-center"
      >
        Ver el panel completo con semáforo
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  )
}
