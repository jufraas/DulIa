/**
 * @param {import('react').TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string, error?: string, hint?: string }} props
 */
export default function TextArea({ label, error, hint, id, className = '', ...props }) {
  const inputId = id ?? props.name

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="label-dl">
        {label}
      </label>
      <textarea
        id={inputId}
        className={`field-dl min-h-24 resize-y ${error ? 'border-[color:var(--danger)]' : ''} ${className}`}
        {...props}
      />
      {hint && !error && (
        <p className="text-xs text-[color:var(--fg-4)]">{hint}</p>
      )}
      {error && <p className="text-xs text-[color:var(--danger)]">{error}</p>}
    </div>
  )
}
