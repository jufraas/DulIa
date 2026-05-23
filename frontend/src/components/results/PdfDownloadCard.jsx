import { Download } from 'lucide-react'
import Button from '../ui/Button'

/**
 * @param {{ onDownload: () => void, downloading?: boolean }} props
 */
export default function PdfDownloadCard({ onDownload, downloading = false }) {
  return (
    <div
      className="relative overflow-hidden rounded-[24px] p-7"
      style={{
        background: 'linear-gradient(135deg, #EC4899 0%, #A855F7 60%, #7C3AED 100%)',
        boxShadow:
          '0 24px 60px rgba(236,72,153,0.45), 0 8px 20px rgba(168,85,247,0.40)',
      }}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-[200px] w-[200px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(255,255,255,0.20) 0%, transparent 70%)',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-12 -left-8 h-[180px] w-[180px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(192,132,252,0.30) 0%, transparent 70%)',
        }}
        aria-hidden
      />

      <div className="relative flex items-center gap-5">
        <div
          className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[18px] border border-white/20 text-white"
          style={{ background: 'rgba(13,13,13,0.30)', backdropFilter: 'blur(8px)' }}
        >
          <Download className="h-8 w-8" strokeWidth={2.2} aria-hidden />
        </div>
        <div className="flex-1 text-white">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] opacity-85">
            ★ Tu siguiente paso
          </div>
          <div className="mt-1 font-[family-name:var(--font-display)] text-[26px] font-extrabold leading-[1.15] tracking-[-0.02em]">
            Descargar mi plan
            <br />
            de 30 días
          </div>
        </div>
      </div>

      <Button
        type="button"
        variant="secondary"
        className="relative mt-6 w-full justify-center border-white/20 bg-[rgba(13,13,13,0.85)] !text-white hover:!bg-[rgba(13,13,13,0.95)]"
        onClick={onDownload}
        disabled={downloading}
        iconLeft={<Download className="h-5 w-5" aria-hidden />}
      >
        {downloading ? 'Generando PDF…' : 'Descargar PDF'}
      </Button>

      <div className="relative mt-3.5 flex flex-wrap justify-center gap-4 text-xs font-medium text-white/85">
        <span>✓ Sin marca de agua</span>
        <span>✓ Compártelo</span>
        <span>✓ 100% gratis</span>
      </div>
    </div>
  )
}
