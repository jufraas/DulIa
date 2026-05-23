/**
 * @param {import('react').SelectHTMLAttributes<HTMLSelectElement> & {
 *   label: string,
 *   error?: string,
 *   hint?: string,
 *   options: { value: string, label: string }[],
 *   placeholder?: string,
 * }} props
 */
export default function Select({
  label,
  error,
  hint,
  options,
  placeholder = 'Selecciona una opción',
  id,
  className = '',
  ...props
}) {
  const selectId = id ?? props.name

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={selectId} className="text-sm font-medium text-slate-200">
        {label}
      </label>
      <select
        id={selectId}
        className={`min-h-11 rounded-xl border bg-slate-900/80 px-4 text-white outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 ${
          error ? 'border-red-500/60' : 'border-white/10'
        } ${!props.value ? 'text-slate-500' : ''} ${className}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="text-slate-900">
            {opt.label}
          </option>
        ))}
      </select>
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
