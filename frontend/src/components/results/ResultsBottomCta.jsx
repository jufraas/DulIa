import { Download } from 'lucide-react'
import Button from '../ui/Button'

/**
 * @owner joufra
 * @param {{ onDownload: () => void, downloading?: boolean }} props
 */
export default function ResultsBottomCta({ onDownload, downloading = false }) {
  return (
    <div
      className="anim-in-delay-3 mt-12 flex flex-col items-start justify-between gap-6 rounded-[24px] p-8 sm:flex-row sm:items-center"
      style={{
        background:
          'linear-gradient(135deg, rgba(236,72,153,0.14) 0%, rgba(124,58,237,0.10) 100%)',
        border: '1px solid rgba(236,72,153,0.35)',
      }}
    >
      <div>
        <h3 className="m-0 text-2xl font-extrabold tracking-[-0.015em] text-[color:var(--fg-1)]">
          Llévate tu plan completo
        </h3>
        <p className="body mt-2 mb-0">
          Tu score, perfil y plan de 30 días en un PDF que puedes compartir.
        </p>
      </div>
      <Button
        variant="primary"
        size="lg"
        onClick={onDownload}
        disabled={downloading}
        iconLeft={<Download className="h-5 w-5" aria-hidden />}
      >
        {downloading ? 'Generando…' : 'Descargar mi plan'}
      </Button>
    </div>
  )
}
