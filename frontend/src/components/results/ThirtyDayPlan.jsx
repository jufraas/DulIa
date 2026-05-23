import { Calendar, Check } from 'lucide-react'

const weeks = [
  {
    w: 'Semana 1',
    title: 'Pon tu portfolio en línea',
    tasks: ['Sube 3 proyectos a Behance', 'Conecta tu LinkedIn', 'Reescribe tu bio'],
  },
  {
    w: 'Semana 2',
    title: 'Aplica a 10 vacantes (con cariño)',
    tasks: ['Carta personalizada cada una', 'Sigue a 5 reclutadores en LinkedIn'],
  },
  {
    w: 'Semana 3',
    title: 'Sube tu nivel técnico',
    tasks: ['Curso gratuito en tu stack', 'Reto: mejora un proyecto real'],
  },
  {
    w: 'Semana 4',
    title: 'Entrevistas + cierre',
    tasks: ['Prepara tu storytelling', 'Practica con el coach DulIA'],
  },
]

/** Plan de 30 días — kit ReBrand Results.jsx */
export default function ThirtyDayPlan() {
  return (
    <div className="card-dl p-7">
      <div className="eyebrow-dl">
        <Calendar className="h-3.5 w-3.5" aria-hidden />
        Tu plan de 30 días
      </div>
      <h3 className="mb-5 mt-2.5 text-[22px] font-bold tracking-[-0.015em] text-[color:var(--fg-1)]">
        Una cosa a la vez. <span className="brand-text">Tú puedes.</span>
      </h3>

      <div className="flex flex-col gap-3.5">
        {weeks.map((w, i) => (
          <div key={w.w} className="flex gap-3.5">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-[family-name:var(--font-display)] text-[15px] font-extrabold text-white"
              style={{
                background: i === 0 ? 'var(--grad-cta)' : 'var(--grad-brand)',
                boxShadow:
                  i === 0
                    ? '0 8px 22px rgba(236,72,153,0.40)'
                    : '0 6px 16px rgba(124,58,237,0.30)',
              }}
            >
              {i + 1}
            </div>
            <div className="flex-1 pb-2">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-[15px] font-bold text-[color:var(--fg-1)]">{w.title}</span>
                <span className="text-[11px] font-semibold text-[color:var(--fg-3)]">{w.w}</span>
              </div>
              <ul className="mt-2 list-none space-y-1.5 p-0 text-[13px] leading-relaxed text-[color:var(--fg-3)]">
                {w.tasks.map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <Check
                      className="h-3.5 w-3.5 shrink-0 text-[color:var(--violet-400)]"
                      strokeWidth={2.4}
                      aria-hidden
                    />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
