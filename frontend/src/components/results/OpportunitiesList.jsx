import { Briefcase } from 'lucide-react'
import { formatSalary } from '../../utils/formatters'

const SEMAFORO = {
  green: { label: 'Confiable', emoji: '🟢', color: '#34D399' },
  yellow: { label: 'Revisar', emoji: '🟡', color: '#FBBF24' },
  red: { label: 'Alerta', emoji: '🔴', color: '#F87171' },
}

/**
 * @param {{ jobs: import('../../store/useProfileStore').Job[] }} props
 */
export default function OpportunitiesList({ jobs }) {
  if (!jobs.length) {
    return (
      <article className="card-dl p-7">
        <div className="eyebrow-dl mb-3">
          <Briefcase className="h-3.5 w-3.5" aria-hidden />
          Oportunidades para ti
        </div>
        <p className="body m-0">
          Aún no hay vacantes recomendadas para tu perfil. Vuelve pronto cuando el pipeline
          cargue ofertas reales.
        </p>
      </article>
    )
  }

  return (
    <article className="card-dl p-7">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="eyebrow-dl">
          <Briefcase className="h-3.5 w-3.5" aria-hidden />
          Oportunidades para ti
        </div>
        <span className="text-xs text-[color:var(--fg-3)]">{jobs.length} vacantes</span>
      </div>
      <h3 className="mb-5 text-[22px] font-bold tracking-[-0.015em] text-[color:var(--fg-1)]">
        Vacantes que cuadran contigo
      </h3>
      <ul className="flex flex-col gap-3">
        {jobs.map((job) => {
          const sem = SEMAFORO[job.semaforo ?? 'green'] ?? SEMAFORO.green
          return (
            <li
              key={job.id}
              className="rounded-2xl p-4"
              style={{
                background: 'var(--bg-1)',
                border: '1px solid rgba(168,85,247,0.20)',
              }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="m-0 text-[15px] font-bold text-[color:var(--fg-1)]">
                      {job.titulo}
                    </h4>
                    <span
                      className="rounded-full px-2 py-0.5 text-[11px] font-bold"
                      style={{
                        color: sem.color,
                        background: `${sem.color}22`,
                        border: `1px solid ${sem.color}55`,
                      }}
                    >
                      {sem.emoji} {sem.label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[color:var(--fg-3)]">
                    {job.empresa} · {job.ciudad}
                    {job.departamento ? `, ${job.departamento}` : ''}
                  </p>
                  {(job.salario_min || job.salario_max) && (
                    <p className="mt-1 text-sm font-semibold text-[color:var(--violet-200)]">
                      {formatSalary(job.salario_min, job.salario_max)}
                    </p>
                  )}
                </div>
                <div
                  className="shrink-0 rounded-full px-3 py-1.5 text-sm font-bold"
                  style={{
                    background: 'rgba(52,211,153,0.14)',
                    border: '1px solid rgba(52,211,153,0.35)',
                    color: '#34D399',
                  }}
                >
                  {job.score_compatibilidad}% match
                </div>
              </div>

              {job.descripcion && (
                <p className="mt-3 text-sm leading-relaxed text-[color:var(--fg-2)]">
                  {job.descripcion}
                </p>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                {(job.habilidades_match ?? []).map((skill) => (
                  <span key={skill} className="chip-dl selected text-xs">
                    ✓ {skill}
                  </span>
                ))}
                {(job.habilidades_faltantes ?? []).map((skill) => (
                  <span key={skill} className="chip-dl text-xs opacity-80">
                    + {skill}
                  </span>
                ))}
              </div>
            </li>
          )
        })}
      </ul>
    </article>
  )
}
