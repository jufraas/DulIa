import { Compass, Layers, MapPinOff } from 'lucide-react'
import IconBox from '../brand/IconBox'
import Section from '../ui/Section'

const problems = [
  {
    icon: Compass,
    title: 'Sin rumbo claro',
    description:
      'Muchos jóvenes terminan estudios o cursos sin saber qué camino laboral seguir primero.',
  },
  {
    icon: Layers,
    title: 'Ofertas impersonales',
    description:
      'Las bolsas de empleo muestran miles de vacantes, pero pocas alineadas con tu perfil real.',
  },
  {
    icon: MapPinOff,
    title: 'Sin plan de acción',
    description:
      'Falta un roadmap concreto: portafolio, red profesional y primeros pasos locales.',
  },
]

export default function ProblemSection() {
  return (
    <Section
      id="problema"
      title="El problema que resolvemos"
      subtitle="En Colombia, millones de jóvenes buscan empleo sin orientación personalizada ni datos locales accionables."
    >
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {problems.map(({ icon: Icon, title, description }, i) => (
          <li key={title} className="card-dl hoverable" style={{ padding: 28 }}>
            <IconBox variant={i === 1 ? 'magenta' : 'violet'}>
              <Icon className="h-6 w-6 text-white" strokeWidth={2} aria-hidden />
            </IconBox>
            <h3 className="mt-5 text-[22px] font-bold tracking-[-0.015em] text-[color:var(--fg-1)]">
              {title}
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-[color:var(--fg-3)]">
              {description}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  )
}
