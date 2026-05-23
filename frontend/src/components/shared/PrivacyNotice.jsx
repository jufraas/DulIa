import { FileText, Shield } from 'lucide-react'

/**
 * Aviso de flujo anónimo — sin login ni persistencia (MVP hackathon).
 */
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
        <strong className="text-[color:var(--fg-1)]">Sin registro ni sesión.</strong> Tus datos se
        usan solo para este análisis. No guardamos tu CV en el navegador después de cerrar la
        pestaña.
      </p>
    </div>
  )
}

/**
 * Badge cuando el usuario adjuntó CV.
 * @param {{ fileName?: string | null, cvParsed?: boolean }} props
 */
export function CvAttachedBadge({ fileName, cvParsed }) {
  if (!fileName && !cvParsed) return null

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-[#34D399]"
      style={{
        background: 'rgba(52,211,153,0.14)',
        border: '1px solid rgba(52,211,153,0.35)',
      }}
    >
      <FileText className="h-3.5 w-3.5" aria-hidden />
      {cvParsed ? 'CV analizado' : 'CV adjunto'}
      {fileName ? ` · ${fileName}` : ''}
    </span>
  )
}
