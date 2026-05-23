/**
 * @param {import('react').InputHTMLAttributes<HTMLInputElement> & { label: string, error?: string }} props
 */
export default function Input({ label, error, id, className = '', ...props }) {
  const inputId = id ?? props.name

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-slate-200">
        {label}
      </label>
      <input
        id={inputId}
        className={`min-h-11 rounded-xl border bg-slate-900/80 px-4 text-white placeholder:text-slate-500 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 ${
          error ? 'border-red-500/60' : 'border-white/10'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
