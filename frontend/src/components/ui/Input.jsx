/**
 * @param {import('react').InputHTMLAttributes<HTMLInputElement> & { label: string, error?: string, hint?: string }} props
 */
export default function Input({ label, error, hint, id, className = '', ...props }) {
  const inputId = id ?? props.name

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="label-dl">
        {label}
      </label>
      <input
        id={inputId}
        className={`field-dl ${error ? 'border-[color:var(--danger)]' : ''} ${className}`}
        {...props}
      />
      {hint && !error && (
        <p className="text-xs text-[color:var(--fg-4)]">{hint}</p>
      )}
      {error && <p className="text-xs text-[color:var(--danger)]">{error}</p>}
    </div>
  )
}
