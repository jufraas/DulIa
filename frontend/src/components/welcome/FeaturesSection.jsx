import { Shield, Sparkles, Target, TrendingUp, Zap } from 'lucide-react'
import IconBox from '../brand/IconBox'
import RevealOnScroll from '../motion/RevealOnScroll'
import Section from '../ui/Section'
import CTABanner from './CTABanner'

/** @typedef {{ icon: import('lucide-react').LucideIcon, variant: 'violet' | 'magenta', eyebrow: string, title: string, body: string }} FeatureItem */

/** @type {FeatureItem[]} */
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

/** Features + CTA — alineado al kit ReBrand (Landing.jsx) */
export default function FeaturesSection() {
  return (
    <Section id="features" centered className="pb-24 sm:pb-28">
      <RevealOnScroll as="header" className="mb-10 max-w-2xl sm:mb-12 mx-auto text-center">
        <div className="eyebrow-dl mb-4 inline-flex">
          <Zap className="h-3.5 w-3.5" aria-hidden />
          Lo que hace DulIA
        </div>
        <h2 className="h2 m-0 text-[color:var(--fg-1)]">
          Cuatro herramientas, <span className="brand-text">un solo flujo</span>.
        </h2>
      </RevealOnScroll>

      <div className="grid gap-4 sm:grid-cols-2">
        {features.map(({ icon: Icon, variant, eyebrow, title, body }, index) => (
          <RevealOnScroll
            key={title}
            as="article"
            className="card-dl hoverable"
            style={{ padding: 28 }}
            delay={index * 0.08}
          >
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
          </RevealOnScroll>
        ))}
      </div>

      <CTABanner />
    </Section>
  )
}
