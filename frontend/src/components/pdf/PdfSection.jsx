/**
 * Bloque reutilizable del documento PDF — solo presentación.
 * @param {{ eyebrow: string, title: string, children: import('react').ReactNode, className?: string }} props
 */
export default function PdfSection({ eyebrow, title, children, className = '' }) {
  return (
    <section className={`pdf-section pdf-block ${className}`.trim()} data-pdf-block>
      <div className="pdf-section__head">
        <p className="eyebrow-dl pdf-section__eyebrow">{eyebrow}</p>
        <h2 className="pdf-section__title">{title}</h2>
      </div>
      <div className="card-dl pdf-section__card">{children}</div>
    </section>
  )
}
