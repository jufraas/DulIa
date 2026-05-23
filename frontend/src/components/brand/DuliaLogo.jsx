/**
 * @param {{ height?: number, className?: string }} props
 */
export default function DuliaLogo({ height = 28, className = '' }) {
  return (
    <img
      src="/dulia-logo.svg"
      alt="DulIA"
      className={className}
      style={{ height, display: 'block' }}
      width={Math.round(height * 3.2)}
      height={height}
    />
  )
}
