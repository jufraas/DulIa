import { Briefcase, Shield, Sparkles, Target, TrendingUp } from 'lucide-react'
import IconBox from '../brand/IconBox'
import Section from '../ui/Section'

const features = [
  {
    icon: Sparkles,
    variant: 'violet',
    eyebrow: '01 · Coach IA',
    title: 'Coach personal con IA',
    body: 'Te conoce mejor que tu CV. Analiza lo que sabes, lo que te gusta y dónde estás, para decirte qué mover ya.',
  },
  {
    icon: Shield,
    variant: 'magenta',
    eyebrow: '02 · Anti-fraude',
    title: 'Detector de vacantes falsas',
    body: 'Las vacantes que piden plata, datos raros o sueldos imposibles las marcamos antes de que apliques.',
  },
  {
    icon: TrendingUp,
    variant: 'violet',
    eyebrow: '03 · Mercado',
    title: 'Termómetro del mercado',
    body: 'Qué se busca hoy en Colombia, qué pagan y dónde está la demanda real. En tiempo real.',
  },
  {
    icon: Target,
    variant: 'magenta',
    eyebrow: '04 · Score',
    title: 'Score de empleabilidad',
    body: 'Tu nivel del 0 al 100, basado en datos reales. Y un plan de 30 días para subirlo.',
  },
]

export default function HowItWorksSection() {
  return (
    <Section
      id="como-funciona"
      centered
      eyebrow={
        <>
          <Briefcase className="h-3.5 w-3.5" aria-hidden />
          Lo que hace DulIA
        </>
      }
      title={
        <>
          Cuatro herramientas, <span className="brand-text">un solo flujo</span>.
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {features.map(({ icon: Icon, variant, eyebrow, title, body }) => (
          <article key={title} className="card-dl hoverable" style={{ padding: 28 }}>
            <IconBox variant={variant}>
              <Icon className="h-[26px] w-[26px] text-white" strokeWidth={2} aria-hidden />
            </IconBox>
            <div className="eyebrow-dl mt-5 mb-2">{eyebrow}</div>
            <h3 className="m-0 text-[22px] font-bold tracking-[-0.015em] text-[color:var(--fg-1)]">
              {title}
            </h3>
            <p className="m-0 mt-2 text-[15px] leading-relaxed text-[color:var(--fg-3)]">
              {body}
            </p>
          </article>
        ))}
      </div>
    </Section>
  )
}
