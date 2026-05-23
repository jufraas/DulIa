/**
 * @param {{ children: import('react').ReactNode, className?: string }} props
 */
export default function Container({ children, className = '' }) {
  return <div className={`dl-container ${className}`.trim()}>{children}</div>
}
