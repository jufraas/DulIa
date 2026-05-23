/**
 * @owner migue
 * @param {{
 *   label: string,
 *   name: string,
 *   accept?: string,
 *   file: File | null,
 *   onChange: (file: File | null) => void,
 *   error?: string,
 *   hint?: string,
 *   maxSizeMb?: number,
 * }} props
 */
export default function FileInput({
  label,
  name,
  accept = 'application/pdf',
  file,
  onChange,
  error,
  hint,
  maxSizeMb = 5,
}) {
  const handleChange = (e) => {
    const selected = e.target.files?.[0] ?? null
    onChange(selected)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="label-dl">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="file"
        accept={accept}
        onChange={handleChange}
        className={`field-dl cursor-pointer file:mr-3 file:rounded-full file:border-0 file:bg-[rgba(168,85,247,0.18)] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[color:var(--violet-200)] ${error ? 'border-[color:var(--danger)]' : ''}`}
      />
      {file && (
        <p className="text-xs text-[color:var(--violet-300)]">
          Archivo: {file.name} ({(file.size / 1024).toFixed(0)} KB)
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-[color:var(--fg-4)]">{hint}</p>
      )}
      {error && <p className="text-xs text-[color:var(--danger)]">{error}</p>}
      {!error && (
        <p className="text-xs text-[color:var(--fg-4)]">
          Máximo {maxSizeMb} MB · PDF únicamente
        </p>
      )}
    </div>
  )
}
