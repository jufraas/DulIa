import PdfDownloadCard from './PdfDownloadCard'
import ProfileSummary from './ProfileSummary'
import RegisterProgressButton from './RegisterProgressButton'
import ScoreCard from './ScoreCard'

/**
 * Grid de una fila: columna izq. (score + PDF) = misma altura que resumen.
 * @param {{
 *   topScore: number,
 *   comparativa?: string | null,
 *   profile: import('../../store/useProfileStore').SavedProfile,
 *   topJobTitle?: string,
 *   insights?: import('../../utils/analysisDisplay').AnalysisInsights | null,
 *   onDownloadPdf: () => void,
 *   downloadingPdf?: boolean,
 * }} props
 */
export default function AnalysisOverviewGrid({
  topScore,
  comparativa,
  profile,
  topJobTitle,
  insights,
  onDownloadPdf,
  downloadingPdf = false,
}) {
  return (
    <div className="analysis-overview-grid">
      <div className="card-dl analysis-overview-grid__left">
        <ScoreCard score={topScore} comparativa={comparativa} embedded />
        <div className="analysis-overview-grid__actions">
          <PdfDownloadCard
            onDownload={onDownloadPdf}
            downloading={downloadingPdf}
            className="pdf-card-in-grid"
          />
          <RegisterProgressButton compact className="w-full" />
        </div>
      </div>
      <ProfileSummary
        profile={profile}
        topScore={topScore}
        topJobTitle={topJobTitle}
        insights={insights}
      />
    </div>
  )
}
