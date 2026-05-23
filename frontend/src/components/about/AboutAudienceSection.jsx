import { GraduationCap, Rocket, Users } from 'lucide-react'
import IconBox from '../brand/IconBox'
import Section from '../ui/Section'

const audiences = [
  {
    icon: GraduationCap,
    title: 'Estudiantes y recién egresados',
    description:
      'Descubre por dónde empezar tu carrera con datos, no con intuición.',
  },
  {
    icon: Rocket,
    title: 'Primer empleo o freelance',
    description:
      'Encuentra roles junior, prácticas y proyectos locales acordes a tus habilidades.',
  },
  {
    icon: Users,
    title: 'Instituciones y programas',
    description:
      'Universidades y bootcamps pueden orientar cohortes con insights agregados.',
  },
]

export default function AboutAudienceSection() {
  return (
    <Section
      id="para-quien"
      title="¿Para quién es?"
      subtitle="Diseñado mobile first para jóvenes que buscan claridad y oportunidades concretas."
    >
      <ul className="grid gap-4 md:grid-cols-3">
        {audiences.map(({ icon: Icon, title, description }, i) => (
          <li key={title} className="card-dl text-center sm:text-left" style={{ padding: 28 }}>
            <IconBox variant={i === 1 ? 'magenta' : 'violet'} size={52}>
              <Icon className="h-6 w-6 text-white" strokeWidth={2} aria-hidden />
            </IconBox>
            <h3 className="mt-5 font-bold text-[color:var(--fg-1)]">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[color:var(--fg-3)]">
              {description}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  )
}
