import { Briefcase } from 'lucide-react'

/**
 * @owner compañero-front
 * @param {{ opportunities: string[] }} props
 */
export default function OpportunitiesList({ opportunities }) {
  return (
    <article className="card-dl p-7">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="eyebrow-dl">
          <Briefcase className="h-3.5 w-3.5" aria-hidden />
          Oportunidades para ti
        </div>
      </div>
      <h3 className="mb-5 text-[22px] font-bold tracking-[-0.015em] text-[color:var(--fg-1)]">
        Vacantes que cuadran contigo
      </h3>
      <ul className="flex flex-col gap-3">
        {opportunities.map((item, i) => (
          <li
            key={item}
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
              {i + 1}
            </div>
            <p className="m-0 flex-1 text-[15px] font-semibold text-[color:var(--fg-1)]">
              {item}
            </p>
          </li>
        ))}
      </ul>
    </article>
  )
}
