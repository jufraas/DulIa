import { Building2, Database, Gem, Users } from 'lucide-react'
import IconBox from '../brand/IconBox'
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

export default function AboutBusinessSection() {
  return (
    <Section
      id="modelo"
      title="Modelo de negocio sostenible"
      subtitle="Pensado para escalar después del hackathon. En el MVP priorizamos freemium y demo con datos reales."
    >
      <ul className="grid gap-4 sm:grid-cols-2">
        {pillars.map(({ icon: Icon, title, description }, i) => (
          <li key={title} className="card-dl flex gap-4" style={{ padding: 24 }}>
            <IconBox variant={i % 2 ? 'magenta' : 'violet'} size={48}>
              <Icon className="h-5 w-5 text-white" strokeWidth={2} aria-hidden />
            </IconBox>
            <div>
              <h3 className="font-bold text-[color:var(--fg-1)]">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--fg-3)]">
                {description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  )
}
