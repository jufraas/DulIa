/**
 * @param {{ children: import('react').ReactNode, variant?: 'violet' | 'magenta', size?: number }} props
 */
export default function IconBox({
  children,
  variant = 'violet',
  size = 56,
}) {
  return (
    <div
      className={`iconbox${variant === 'magenta' ? ' magenta' : ''}`}
      style={{ width: size, height: size }}
    >
      {children}
    </div>
  )
}
