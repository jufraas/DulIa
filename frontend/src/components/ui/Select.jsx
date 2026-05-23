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
      <label htmlFor={selectId} className="label-dl">
        {label}
      </label>
      <select
        id={selectId}
        className={`field-dl appearance-none ${error ? 'border-[color:var(--danger)]' : ''} ${!props.value ? 'text-[color:var(--fg-4)]' : ''} ${className}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint && !error && (
        <p className="text-xs text-[color:var(--fg-4)]">{hint}</p>
      )}
      {error && <p className="text-xs text-[color:var(--danger)]">{error}</p>}
    </div>
  )
}
