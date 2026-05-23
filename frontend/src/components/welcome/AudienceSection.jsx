import { GraduationCap, Rocket, Users } from 'lucide-react'
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

export default function AudienceSection() {
  return (
    <Section
      id="para-quien"
      title="¿Para quién es?"
      subtitle="Diseñado mobile first para jóvenes que buscan claridad y oportunidades concretas."
      className="bg-slate-900/50"
    >
      <ul className="grid gap-6 md:grid-cols-3">
        {audiences.map(({ icon: Icon, title, description }) => (
          <li
            key={title}
            className="rounded-2xl border border-white/10 p-6 text-center sm:text-left"
          >
            <span className="mx-auto inline-flex rounded-full bg-white/5 p-4 text-cyan-400 sm:mx-0">
              <Icon className="h-6 w-6" aria-hidden />
            </span>
            <h3 className="mt-4 font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              {description}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  )
}
