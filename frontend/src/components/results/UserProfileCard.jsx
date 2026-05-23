import { User } from 'lucide-react'
import { profileToDisplayFields } from '../../utils/formatProfileLabels'
import { CvAttachedBadge } from '../shared/PrivacyNotice'

/**
 * Sección "Tu perfil" — datos que el usuario envió en el wizard (+ CV).
 *
 * @param {{
 *   profile: import('../../store/useProfileStore').ProfileForm | null,
 *   cvFileName?: string | null,
 *   cvParsed?: boolean,
 * }} props
 */
export default function UserProfileCard({ profile, cvFileName, cvParsed }) {
  const fields = profileToDisplayFields(profile)

  if (!profile) return null

  return (
    <article className="card-dl p-7">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="eyebrow-dl">
          <User className="h-3.5 w-3.5" aria-hidden />
          Tu perfil
        </div>
        <CvAttachedBadge fileName={cvFileName} cvParsed={cvParsed} />
      </div>

      <p className="body mb-5 mt-0">
        Esto es lo que nos contaste. DulIA lo cruzó con oportunidades laborales reales en
        Colombia para armar tu plan.
      </p>

      <dl className="grid gap-3 sm:grid-cols-2">
        {fields.map(({ label, value }) => (
          <div
            key={label}
            className="rounded-[14px] px-4 py-3"
            style={{
              background: 'var(--bg-1)',
              border: '1px solid rgba(168,85,247,0.18)',
            }}
          >
            <dt className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[color:var(--fg-3)]">
              {label}
            </dt>
            <dd className="mt-1 text-sm font-medium leading-snug text-[color:var(--fg-1)]">
              {label === 'Portafolio / LinkedIn' && value.startsWith('http') ? (
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[color:var(--violet-300)] underline-offset-2 hover:underline"
                >
                  {value}
                </a>
              ) : (
                value
              )}
            </dd>
          </div>
        ))}
      </dl>
    </article>
  )
}
