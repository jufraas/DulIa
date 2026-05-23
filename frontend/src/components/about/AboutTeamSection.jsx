import { Heart, MapPin } from 'lucide-react'
import Section from '../ui/Section'

const team = [
  { name: 'Carlos', role: 'Backend · IA' },
  { name: 'Migue', role: 'Frontend · Sobre DulIA' },
  { name: 'Jose', role: 'Backend · IA' },
  { name: 'Jufra', role: 'Integración · Frontend' },
]

export default function AboutTeamSection() {
  return (
    <Section
      id="equipo"
      centered
      title="El equipo"
      subtitle="Construido en 48 horas para Barranqui-IA 2026, desde Barranquilla para jóvenes de toda Colombia."
    >
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {team.map(({ name, role }) => (
          <li key={name} className="card-dl text-center" style={{ padding: 24 }}>
            <div
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl font-[family-name:var(--font-display)] text-xl font-extrabold text-white"
              style={{ background: 'var(--grad-brand)' }}
            >
              {name[0]}
            </div>
            <h3 className="mt-4 font-bold text-[color:var(--fg-1)]">{name}</h3>
            <p className="mt-1 text-sm text-[color:var(--fg-3)]">{role}</p>
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
