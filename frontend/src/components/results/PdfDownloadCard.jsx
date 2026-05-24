import { Download } from 'lucide-react'

/**
 * PDF card con animaciones del kit ReBrand
 * @param {{ onDownload: () => void, downloading?: boolean, className?: string }} props
 */
export default function PdfDownloadCard({ onDownload, downloading = false, className = '' }) {
  return (
    <div
      className={`pdf-card-anim relative flex flex-col overflow-hidden rounded-[24px] p-5 ${className.includes('pdf-card-in-grid') ? '' : 'min-h-[168px] flex-1'} ${className}`}
      style={{
        background: 'linear-gradient(135deg, #EC4899 0%, #A855F7 60%, #7C3AED 100%)',
        backgroundSize: '200% 200%',
        boxShadow:
          '0 24px 60px rgba(236,72,153,0.45), 0 8px 20px rgba(168,85,247,0.40)',
      }}
    >
      <div className="pdf-halo" aria-hidden />
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-[200px] w-[200px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(255,255,255,0.22) 0%, transparent 70%)',
        }}
        aria-hidden
      />
      <div className="pdf-shine" aria-hidden />

      <div className="relative flex flex-1 items-center gap-3">
        <div
          className="pdf-icon-bob flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] border border-white/20 text-white"
          style={{ background: 'rgba(13,13,13,0.30)', backdropFilter: 'blur(8px)' }}
        >
          <Download className="h-5 w-5" strokeWidth={2.2} aria-hidden />
        </div>
        <div className="flex-1 text-white">
          <div className="text-[10px] font-bold uppercase tracking-[0.14em] opacity-85">
            Tu siguiente paso
          </div>
          <div className="mt-0.5 font-[family-name:var(--font-display)] text-[18px] font-extrabold leading-[1.2] tracking-[-0.02em] sm:text-[20px]">
            Descargar mi plan completo
          </div>
        </div>
      </div>

      <button
        type="button"
        className="pdf-btn relative mt-4 flex w-full shrink-0 items-center justify-center gap-2 rounded-2xl border-0 px-5 py-3 font-[family-name:var(--font-display)] text-[15px] font-bold text-white"
        style={{ background: 'rgba(13,13,13,0.88)' }}
        onClick={onDownload}
        disabled={downloading}
      >
        <span className="pdf-btn-sweep" aria-hidden />
        <Download className="relative h-5 w-5" strokeWidth={2.2} aria-hidden />
        <span className="relative">
          {downloading ? 'Generando PDF…' : 'Descargar PDF'}
        </span>
      </button>

      <div className="relative z-[1] mt-2.5 flex flex-wrap justify-center gap-3 text-[11px] font-medium text-white/85">
        <span>Sin marca de agua</span>
        <span>Compártelo</span>
        <span>100% gratis</span>
      </div>
    </div>
  )
}
