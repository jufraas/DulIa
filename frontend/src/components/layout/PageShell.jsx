import Atmosphere from './Atmosphere'

/**
 * @param {{ children: import('react').ReactNode, className?: string }} props
 */
export default function PageShell({ children, className = '' }) {
  return (
    <div className={`page flex min-h-screen flex-col ${className}`}>
      <Atmosphere />
      {children}
    </div>
  )
}
