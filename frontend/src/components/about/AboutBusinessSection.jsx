import { Building2, Database, Gem, Users } from 'lucide-react'
import IconBox from '../brand/IconBox'
import Section from '../ui/Section'

const pillars = [
  {
    icon: Gem,
    title: 'Freemium para jóvenes',
    description:
      'Análisis básico y vacantes recomendadas gratis. Premium: PDF avanzado, más matches y seguimiento del plan.',
  },
  {
    icon: Building2,
    title: 'Licencias institucionales',
    description:
      'Universidades, SENA y fundaciones orientan cohortes con dashboards agregados y anonimizados.',
  },
  {
    icon: Users,
    title: 'Empleadores locales',
    description:
      'Empresas del Caribe promocionan vacantes verificadas y acceden a candidatos mejor alineados.',
  },
  {
    icon: Database,
    title: 'Inteligencia de mercado',
    description:
      'Insights sobre demanda por sector y ciudad — útil para política pública y programas de empleo.',
  },
]

export default function AboutBusinessSection() {
  return (
    <Section
      id="modelo"
      title="Modelo de negocio sostenible"
      subtitle="En el MVP del hackathon priorizamos la demo freemium con datos reales. El resto es la hoja de ruta post-evento."
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
