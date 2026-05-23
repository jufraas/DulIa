import { Sparkles } from 'lucide-react'
import SkillsChips from './SkillsChips'

/**
 * @param {{
 *   profile: import('../../store/useProfileStore').SavedProfile | null,
 *   topScore: number,
 *   topJobTitle?: string,
 * }} props
 */
export default function ProfileSummary({ profile, topScore, topJobTitle }) {
  const skills = profile?.habilidades ?? []

  return (
    <div className="card-dl flex-1 p-7">
      <div className="eyebrow-dl mb-3.5">
        <Sparkles className="h-3.5 w-3.5" aria-hidden />
        Resumen — por DulIA
      </div>
      <p className="m-0 text-[17px] leading-relaxed text-[color:var(--fg-2)]">
        {profile?.nombre && (
          <>
            Hola <strong className="text-[color:var(--fg-1)]">{profile.nombre}</strong>
            {profile.ciudad ? ` de ${profile.ciudad}` : ''}.{' '}
          </>
        )}
        {topJobTitle ? (
          <>
            Tu mejor match es{' '}
            <strong className="text-[color:var(--fg-1)]">{topJobTitle}</strong> con un score de{' '}
          </>
        ) : (
          <>Tu score de compatibilidad es </>
        )}
        <strong className="brand-text">{topScore}</strong> sobre 100. Aplica a las vacantes
        verdes primero y refuerza las habilidades que te faltan.
      </p>
      <SkillsChips skills={skills} />
    </div>
  )
}
