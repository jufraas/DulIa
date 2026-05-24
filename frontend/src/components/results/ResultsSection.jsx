/**
 * Ancla de sección con offset para el header sticky.
 * @param {{
 *   id: string,
 *   children: import('react').ReactNode,
 *   className?: string,
 *   ariaLabel?: string,
 * }} props
 */
export default function ResultsSection({ id, children, className = '', ariaLabel }) {
  return (
    <section
      id={id}
      className={`results-section scroll-mt-[88px] ${className}`.trim()}
      aria-label={ariaLabel}
    >
      {children}
    </section>
  )
}
