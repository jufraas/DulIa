import { Calendar } from 'lucide-react'

/**
 * @owner compañero-front
 * @param {{ roadmap: string[] }} props
 */
export default function RoadmapPlan({ roadmap }) {
  return (
    <article className="card-dl p-7">
      <div className="eyebrow-dl mb-3.5">
        <Calendar className="h-3.5 w-3.5" aria-hidden />
        Tu plan de 30 días
      </div>
      <h3 className="mb-5 text-[22px] font-bold tracking-[-0.015em] text-[color:var(--fg-1)]">
        Una cosa a la vez. <span className="brand-text">Tú puedes.</span>
      </h3>
      <ol className="flex flex-col gap-3.5">
        {roadmap.map((step, i) => (
          <li key={step} className="flex gap-3.5">
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
              <p className="m-0 text-[15px] font-semibold text-[color:var(--fg-1)]">{step}</p>
            </div>
          </li>
        ))}
      </ol>
    </article>
  )
}
