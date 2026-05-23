import { FileUp, GraduationCap, Rocket, Users } from 'lucide-react'
import IconBox from '../brand/IconBox'
import Section from '../ui/Section'

const audiences = [
  {
    icon: GraduationCap,
    title: 'Estudiantes y recién egresados',
    description:
      'Entiende qué roles encajan contigo, qué habilidades te faltan y cuáles son tus mejores primeras apuestas.',
  },
  {
    icon: Rocket,
    title: 'Primer empleo o freelance',
    description:
      'Encuentra vacantes junior, prácticas y proyectos locales con un score de compatibilidad y semáforo de confianza.',
  },
  {
    icon: Users,
    title: 'Instituciones y programas',
    description:
      'Universidades, SENA y bootcamps pueden orientar cohortes con datos agregados del mercado (con consentimiento).',
  },
  {
    icon: FileUp,
    title: '¿Ya tienes CV?',
    description:
      'Sube tu hoja de vida en PDF al comenzar y prellenamos gran parte del formulario para que solo revises y sigas.',
  },
]

export default function AboutAudienceSection() {
  return (
    <Section
      id="para-quien"
      title="¿Para quién es?"
      subtitle="Mobile first, sin login y pensado para quien necesita claridad hoy — no un curso de seis meses."
    >
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {audiences.map(({ icon: Icon, title, description }, i) => (
          <li key={title} className="card-dl text-center sm:text-left" style={{ padding: 28 }}>
            <IconBox variant={i % 2 ? 'magenta' : 'violet'} size={52}>
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
