import { Shield } from 'lucide-react'

export default function PrivacyNotice({ className = '' }) {
  return (
    <div
      className={`flex gap-3 rounded-[14px] px-4 py-3 text-sm text-[color:var(--fg-2)] ${className}`}
      style={{
        background: 'rgba(168,85,247,0.08)',
        border: '1px solid rgba(168,85,247,0.25)',
      }}
    >
      <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--violet-300)]" aria-hidden />
      <p className="m-0 leading-relaxed">
        <strong className="text-[color:var(--fg-1)]">Sin login.</strong> Usamos un{' '}
        <code className="text-[color:var(--violet-300)]">session_id</code> en localStorage para
        recomendarte vacantes. No guardamos contraseña ni sesión permanente.
      </p>
    </div>
  )
}
