import { Compass, Layers, ShieldAlert } from 'lucide-react'
import IconBox from '../brand/IconBox'
import Section from '../ui/Section'

const problems = [
  {
    icon: Compass,
    title: 'Sin rumbo claro',
    description:
      'Terminas estudios o cursos y no sabes si buscar práctica, primer empleo o freelance — ni por dónde empezar en tu ciudad.',
  },
  {
    icon: Layers,
    title: 'Demasiado ruido',
    description:
      'Portales con miles de vacantes, pero casi ninguna alineada con tu perfil, tu nivel o lo que realmente sabes hacer.',
  },
  {
    icon: ShieldAlert,
    title: 'Ofertas que no conviene',
    description:
      'Vacantes sospechosas, salarios irreales o reclutadores dudosos. Aplicar sin filtro te cuesta tiempo y a veces dinero.',
  },
]

export default function AboutProblemSection() {
  return (
    <Section
      id="problema"
      title="El problema que resolvemos"
      subtitle="En Colombia, millones de jóvenes buscan empleo con poca orientación personalizada y sin señales claras sobre qué oportunidades valen la pena."
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
