import { Download } from 'lucide-react'

/**
 * PDF card con animaciones del kit ReBrand
 * @param {{ onDownload: () => void, downloading?: boolean }} props
 */
export default function PdfDownloadCard({ onDownload, downloading = false }) {
  return (
    <div
      className="pdf-card-anim relative overflow-hidden rounded-[24px] p-7"
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
      <div
        className="pointer-events-none absolute -bottom-12 -left-8 h-[180px] w-[180px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(192,132,252,0.30) 0%, transparent 70%)',
        }}
        aria-hidden
      />
      <div className="pdf-shine" aria-hidden />
      <span className="pdf-spark s1" aria-hidden>
        ✦
      </span>
      <span className="pdf-spark s2" aria-hidden>
        ✧
      </span>
      <span className="pdf-spark s3" aria-hidden>
        ★
      </span>
      <span className="pdf-spark s4" aria-hidden>
        ✦
      </span>

      <div className="relative flex items-center gap-5">
        <div className="pdf-icon-bob flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[18px] border border-white/20 text-white"
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

      <button
        type="button"
        className="pdf-btn relative mt-6 flex w-full items-center justify-center gap-2.5 rounded-2xl border-0 px-6 py-[18px] font-[family-name:var(--font-display)] text-[17px] font-bold text-white"
        style={{ background: 'rgba(13,13,13,0.88)' }}
        onClick={onDownload}
        disabled={downloading}
      >
        <span className="pdf-btn-sweep" aria-hidden />
        <Download className="relative h-5 w-5" strokeWidth={2.2} aria-hidden />
        <span className="relative">
          {downloading ? 'Generando PDF…' : 'Descargar PDF · 2 MB'}
        </span>
      </button>

      <div className="relative z-[1] mt-3.5 flex flex-wrap justify-center gap-4 text-xs font-medium text-white/85">
        <span>✓ Sin marca de agua</span>
        <span>✓ Compártelo</span>
        <span>✓ 100% gratis</span>
      </div>
    </div>
  )
}
