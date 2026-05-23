import Container from './Container'

/**
 * @param {{
 *   id?: string,
 *   title?: string,
 *   subtitle?: string,
 *   children?: import('react').ReactNode,
 *   className?: string,
 * }} props
 */
export default function Section({
  id,
  title,
  subtitle,
  children,
  className = '',
}) {
  return (
    <section id={id} className={`py-16 sm:py-20 ${className}`}>
      <Container>
        {(title || subtitle) && (
          <header className="mb-10 max-w-2xl sm:mb-12">
            {title && (
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-3 text-base leading-relaxed text-slate-400 sm:text-lg">
                {subtitle}
              </p>
            )}
          </header>
        )}
        {children}
      </Container>
    </section>
  )
}
