import { Sparkles } from 'lucide-react'

/**
 * @owner joufra
 * @param {{ name?: string }} props
 */
export default function ResultsHeroTitle({ name }) {
  const firstName = name?.split(' ')[0]

  return (
    <div className="anim-in mb-12 text-center">
      <div className="eyebrow-dl mb-3.5 inline-flex">
        <Sparkles className="h-3.5 w-3.5" aria-hidden />
        Análisis listo
      </div>
      <h1
        className="m-0 font-[family-name:var(--font-display)] font-extrabold leading-[1.1] tracking-[-0.03em] text-[color:var(--fg-1)]"
        style={{ fontSize: 'clamp(32px, 4.5vw, 56px)' }}
      >
        Vas mejor de lo que crees,
        <br />
        <span className="gradient-text">{firstName ?? 'parcero'}</span>.
      </h1>
    </div>
  )
}
