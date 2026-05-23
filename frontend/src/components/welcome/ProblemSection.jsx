import { Compass, Layers, MapPinOff } from 'lucide-react'
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
      className="bg-slate-900/50"
    >
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {problems.map(({ icon: Icon, title, description }) => (
          <li
            key={title}
            className="rounded-2xl border border-white/10 bg-slate-800/50 p-6 transition hover:border-cyan-500/30"
          >
            <span className="mb-4 inline-flex rounded-xl bg-cyan-500/15 p-3 text-cyan-400">
              <Icon className="h-6 w-6" aria-hidden />
            </span>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              {description}
            </p>
          </li>
        ))}
      </ul>
    </Section>
  )
}
