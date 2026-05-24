import { BarChart3, FileText, Sparkles, Target } from 'lucide-react'
import CoachAskLink from '../results/CoachAskLink'
import IconBox from '../brand/IconBox'
import Section from '../ui/Section'

const steps = [
  {
    icon: FileText,
    step: '01',
    title: 'Cuéntanos quién eres',
    description:
      'Sube tu CV en PDF o completa un wizard corto: estudios, habilidades y qué buscas.',
  },
  {
    icon: Sparkles,
    step: '02',
    title: 'IA analiza tu perfil',
    description:
      'Cruzamos tu información con vacantes del mercado colombiano y calculamos compatibilidad.',
  },
  {
    icon: Target,
    step: '03',
    title: 'Vacantes con score y semáforo',
    description:
      'Verde = confiable, amarillo = revisa, rojo = evita. Solo aplicas donde tiene sentido.',
  },
  {
    icon: BarChart3,
    step: '04',
    title: 'Plan descargable',
    description:
      'Recibes tu score, top oportunidades y un PDF con tu plan de acción para compartir o guardar.',
  },
]

export default function AboutHowSection() {
  return (
    <Section
      id="como-funciona"
      centered
      title="Así funciona DulIA"
      subtitle="Cuatro pasos. Sin cuenta. Menos de cinco minutos desde la landing hasta tu primer resultado."
    >
      <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {steps.map(({ icon: Icon, step, title, description }, i) => (
          <li key={step} className="card-dl relative text-left" style={{ padding: 28 }}>
            <span
              className="absolute right-5 top-5 font-[family-name:var(--font-display)] text-3xl font-black leading-none text-[color:var(--fg-3)] opacity-25"
              aria-hidden
            >
              {step}
            </span>
            <IconBox variant={i % 2 ? 'magenta' : 'violet'} size={48}>
              <Icon className="h-5 w-5 text-white" strokeWidth={2} aria-hidden />
            </IconBox>
            <h3 className="mt-5 font-bold text-[color:var(--fg-1)]">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[color:var(--fg-3)]">{description}</p>
          </li>
        ))}
      </ol>
      <p className="mt-8 text-center text-sm text-[color:var(--fg-3)]">
        <CoachAskLink
          question="Explícame los pasos de DulIA con más detalle"
          label="¿Algo no quedó claro? Pregúntale a DulIA"
        />
      </p>
    </Section>
  )
}
