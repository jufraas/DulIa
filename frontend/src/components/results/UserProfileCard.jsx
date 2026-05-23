import { User } from 'lucide-react'
import { savedProfileToDisplayFields } from '../../utils/formatProfileLabels'

/**
 * @param {{ profile: import('../../store/useProfileStore').SavedProfile | null }} props
 */
export default function UserProfileCard({ profile }) {
  const fields = savedProfileToDisplayFields(profile)

  if (!profile) return null

  return (
    <article className="card-dl p-7">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="eyebrow-dl">
          <User className="h-3.5 w-3.5" aria-hidden />
          Tu perfil guardado
        </div>
      </div>

      <p className="body mb-5 mt-0">
        Perfil registrado con tu <strong className="text-[color:var(--fg-1)]">session_id</strong>.
        En modo mock el GET no persiste — usamos la respuesta del POST en memoria.
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
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </article>
  )
}
