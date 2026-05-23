/**
 * @param {import('react').ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary', loading?: boolean }} props
 */
export default function Button({
  variant = 'primary',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) {
  const base =
    'inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 text-base font-semibold transition disabled:cursor-not-allowed'
  const variants = {
    primary:
      'bg-cyan-500 text-slate-900 hover:bg-cyan-400 disabled:bg-cyan-500/50 disabled:text-slate-900/70',
    secondary:
      'border border-white/15 text-white hover:bg-white/5 disabled:opacity-50',
  }

  return (
    <button
      type="button"
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900/30 border-t-slate-900" />
          Analizando...
        </>
      ) : (
        children
      )}
    </button>
  )
}
