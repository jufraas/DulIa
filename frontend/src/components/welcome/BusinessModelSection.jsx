import { Building2, Database, Gem, Users } from 'lucide-react'
import Section from '../ui/Section'

const pillars = [
  {
    icon: Gem,
    title: 'Freemium B2C',
    description:
      'Análisis básico gratis. PDF avanzado, más matches y seguimiento en plan premium.',
  },
  {
    icon: Building2,
    title: 'B2B institucional',
    description:
      'Licencias para universidades, SENA y fundaciones que orientan cohortes de estudiantes.',
  },
  {
    icon: Users,
    title: 'B2B empleadores',
    description:
      'Empresas locales promocionan vacantes o pagan por candidatos mejor alineados.',
  },
  {
    icon: Database,
    title: 'Insights de mercado',
    description:
      'Datos agregados y anonimizados sobre demanda laboral regional, con consentimiento.',
  },
]

export default function BusinessModelSection() {
  return (
    <Section
      id="modelo"
      title="Modelo de negocio sostenible"
      subtitle="Pensado para escalar después del hackathon. En el MVP priorizamos freemium y demo con datos reales."
    >
      <ul className="grid gap-6 sm:grid-cols-2">
        {pillars.map(({ icon: Icon, title, description }) => (
          <li
            key={title}
            className="flex gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-800/80 to-slate-900/80 p-6"
          >
            <span className="shrink-0 rounded-xl bg-cyan-500/15 p-3 text-cyan-400">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {description}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-8 rounded-xl border border-dashed border-cyan-500/30 bg-cyan-500/5 px-4 py-3 text-center text-sm text-cyan-200/90">
        MVP del hackathon: onboarding + análisis con IA + resultados y PDF
        descargable.
      </p>
    </Section>
  )
}
