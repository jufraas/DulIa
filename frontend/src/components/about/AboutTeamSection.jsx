import { Heart, MapPin } from 'lucide-react'
import Section from '../ui/Section'

const team = [
  {
    name: 'Carlos (krl0s)',
    initials: 'C',
    role: 'Backend & IA',
    focus: 'API, Gemini, matching y datos en Supabase',
  },
  {
    name: 'Migue',
    initials: 'M',
    role: 'Frontend & producto',
    focus: 'Sobre DulIA, wizard, CV y integración con la API',
  },
  {
    name: 'Joufra',
    initials: 'Jf',
    role: 'Experiencia & pitch',
    focus: 'Landing, resultados, vacantes e historia para el jurado',
  },
  {
    name: 'Jose',
    initials: 'Jo',
    role: 'Pipeline de datos',
    focus: 'Vacantes reales del mercado laboral colombiano',
  },
]

export default function AboutTeamSection() {
  return (
    <Section
      id="equipo"
      centered
      title="El equipo"
      subtitle="Cuatro frentes en paralelo durante 48 horas: producto, datos, IA y experiencia. Hecho en Barranquilla para jóvenes de toda Colombia."
    >
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {team.map(({ name, initials, role, focus }, i) => (
          <li key={name} className="card-dl flex flex-col text-center" style={{ padding: 24 }}>
            <div
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl font-[family-name:var(--font-display)] text-xl font-extrabold text-white"
              style={{
                background:
                  i % 2 === 0
                    ? 'var(--grad-brand)'
                    : 'linear-gradient(135deg, #EC4899 0%, #7C3AED 100%)',
              }}
            >
              {initials}
            </div>
            <h3 className="mt-4 font-bold text-[color:var(--fg-1)]">{name}</h3>
            <p className="mt-1 text-sm font-semibold text-[color:var(--violet-200)]">{role}</p>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-[color:var(--fg-3)]">{focus}</p>
          </li>
        ))}
      </ul>
      <p className="caption mt-8 inline-flex items-center justify-center gap-2 text-center">
        <MapPin className="h-3.5 w-3.5 text-[color:var(--violet-300)]" aria-hidden />
        Hecho con <Heart className="h-3.5 w-3.5 text-[color:var(--magenta-400)]" aria-hidden /> en
        Barranquilla · 2026
      </p>
    </Section>
  )
}
