import { Briefcase, ClipboardList, Sparkles, Target } from 'lucide-react'
import Section from '../ui/Section'

const steps = [
  {
    icon: ClipboardList,
    step: '01',
    title: 'Cuéntanos tu perfil',
    description:
      'Estudios, habilidades, intereses y ciudad. Toma menos de 2 minutos.',
  },
  {
    icon: Sparkles,
    step: '02',
    title: 'La IA analiza tu camino',
    description:
      'Gemini evalúa fortalezas, brechas y rutas de carrera adaptadas a ti.',
  },
  {
    icon: Briefcase,
    step: '03',
    title: 'Oportunidades reales',
    description:
      'Cruzamos tu perfil con ofertas scrapeadas de portales laborales colombianos.',
  },
  {
    icon: Target,
    step: '04',
    title: 'Plan listo para actuar',
    description:
      'Recibes recomendaciones, score de encaje y roadmap descargable en PDF.',
  },
]

export default function HowItWorksSection() {
  return (
    <Section
      id="como-funciona"
      title="Cómo funciona DulIA"
      subtitle="Un flujo simple de principio a fin, pensado para demostrar valor en minutos."
    >
      <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(({ icon: Icon, step, title, description }) => (
          <li
            key={step}
            className="relative flex flex-col rounded-2xl border border-white/10 bg-slate-800/40 p-6"
          >
            <span className="text-xs font-bold tracking-widest text-cyan-500">
              {step}
            </span>
            <span className="mt-4 inline-flex w-fit rounded-xl bg-emerald-500/15 p-3 text-emerald-400">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <h3 className="mt-4 font-semibold text-white">{title}</h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">
              {description}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  )
}
