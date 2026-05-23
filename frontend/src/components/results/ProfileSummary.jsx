import { Sparkles } from 'lucide-react'
import SkillsChips from './SkillsChips'

/**
 * @owner compañero-front
 * @param {{
 *   profile: import('../../store/useProfileStore').ProfileForm | null,
 *   result: import('../../store/useProfileStore').AnalysisResult,
 *   score: number,
 *   skills: string[],
 * }} props
 */
export default function ProfileSummary({ profile, result, score, skills }) {
  return (
    <div className="card-dl flex-1 p-7">
      <div className="eyebrow-dl mb-3.5">
        <Sparkles className="h-3.5 w-3.5" aria-hidden />
        Resumen de tu perfil — por DulIA
      </div>
      <p className="m-0 text-[17px] leading-relaxed text-[color:var(--fg-2)]">
        {profile?.name && (
          <>
            Hola <strong className="text-[color:var(--fg-1)]">{profile.name}</strong>
            {profile.city ? ` de ${profile.city}` : ''}.{' '}
          </>
        )}
        Tu perfil encaja como{' '}
        <strong className="text-[color:var(--fg-1)]">{result.profile}</strong> con un score de{' '}
        <strong className="brand-text">{score}</strong> sobre 100. Sigue el plan de 30 días para
        subir tu empleabilidad.
      </p>
      <SkillsChips skills={skills} />
    </div>
  )
}
