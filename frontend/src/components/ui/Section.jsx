import Container from './Container'

/**
 * @param {{
 *   id?: string,
 *   title?: string,
 *   subtitle?: string,
 *   eyebrow?: import('react').ReactNode,
 *   children?: import('react').ReactNode,
 *   className?: string,
 *   centered?: boolean,
 * }} props
 */
export default function Section({
  id,
  title,
  subtitle,
  eyebrow,
  children,
  className = '',
  centered = false,
}) {
  return (
    <section id={id} className={`py-16 sm:py-20 ${className}`}>
      <Container>
        {(eyebrow || title || subtitle) && (
          <header
            className={`mb-10 max-w-2xl sm:mb-12 ${centered ? 'mx-auto text-center' : ''}`}
          >
            {eyebrow && (
              <div className="eyebrow-dl mb-4 inline-flex">{eyebrow}</div>
            )}
            {title && (
              <h2 className="h2 m-0 text-[color:var(--fg-1)]">{title}</h2>
            )}
            {subtitle && (
              <p className="body-lg mt-3">{subtitle}</p>
            )}
          </header>
        )}
        {children}
      </Container>
    </section>
  )
}
