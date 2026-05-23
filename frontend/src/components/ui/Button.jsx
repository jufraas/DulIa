/**
 * @param {import('react').ButtonHTMLAttributes<HTMLButtonElement> & {
 *   variant?: 'primary' | 'secondary' | 'ghost',
 *   size?: 'sm' | 'md' | 'lg',
 *   loading?: boolean,
 *   iconLeft?: import('react').ReactNode,
 *   iconRight?: import('react').ReactNode,
 * }} props
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  iconLeft,
  iconRight,
  children,
  className = '',
  disabled,
  type = 'button',
  ...props
}) {
  const sizeClass = size !== 'md' ? ` ${size}` : ''
  const variantClass = `btn btn-${variant}${sizeClass}`

  return (
    <button
      type={type}
      className={`${variantClass} ${className}`.trim()}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
            aria-hidden
          />
          Analizando...
        </>
      ) : (
        <>
          {iconLeft}
          {children}
          {iconRight}
        </>
      )}
    </button>
  )
}
