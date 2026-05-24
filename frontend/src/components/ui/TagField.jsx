import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { parseTags } from '../../utils/parseTags'
import Button from './Button'

/**
 * Campo de tags — guarda valor como string separado por comas (compatible con el formulario).
 * @param {{
 *   label: string,
 *   name: string,
 *   value?: string,
 *   onChange: (e: { target: { value: string } }) => void,
 *   error?: string,
 *   hint?: string,
 *   placeholder?: string,
 *   suggestions?: string[],
 *   id?: string,
 * }} props
 */
export default function TagField({
  label,
  name,
  value = '',
  onChange,
  error,
  hint,
  placeholder = 'Escribe una habilidad y pulsa Enter',
  suggestions = [],
  id,
}) {
  const [draft, setDraft] = useState('')
  const inputId = id ?? name
  const tags = parseTags(value)

  const emitTags = (nextTags) => {
    onChange({ target: { value: nextTags.join(', ') } })
  }

  const hasTag = (tag) =>
    tags.some((t) => t.toLowerCase() === tag.trim().toLowerCase())

  const addTag = (raw) => {
    const tag = raw.trim()
    if (!tag || hasTag(tag)) return
    emitTags([...tags, tag])
    setDraft('')
  }

  const removeTag = (tag) => {
    emitTags(tags.filter((t) => t !== tag))
  }

  const toggleSuggestion = (suggestion) => {
    if (hasTag(suggestion)) {
      const match = tags.find((t) => t.toLowerCase() === suggestion.toLowerCase())
      if (match) removeTag(match)
    } else {
      emitTags([...tags, suggestion])
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(draft)
    }
    if (e.key === 'Backspace' && !draft && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="label-dl">
        {label}
      </label>

      <div className="flex gap-2">
        <input
          id={inputId}
          name={name}
          type="text"
          className={`field-dl min-w-0 flex-1 ${error ? 'border-[color:var(--danger)]' : ''}`}
          placeholder={placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="shrink-0 self-stretch px-4"
          iconLeft={<Plus className="h-4 w-4" aria-hidden />}
          onClick={() => addTag(draft)}
          disabled={!draft.trim()}
        >
          Agregar
        </Button>
      </div>

      {suggestions.length > 0 && (
        <div className="mt-1">
          <p className="mb-2 text-xs font-semibold text-[color:var(--fg-3)]">Sugerencias</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className={`chip-dl ${hasTag(suggestion) ? 'selected' : ''}`}
                onClick={() => toggleSuggestion(suggestion)}
                aria-pressed={hasTag(suggestion)}
              >
                {hasTag(suggestion) ? '✓ ' : '+ '}
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {tags.length > 0 && (
        <div
          className="mt-2 rounded-2xl p-3.5"
          style={{
            background: 'rgba(168,85,247,0.08)',
            border: '1px solid rgba(168,85,247,0.25)',
          }}
        >
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-[color:var(--violet-200)]">
            Tus habilidades ({tags.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="chip-dl selected cursor-default gap-1.5 pr-2"
              >
                {tag}
                <button
                  type="button"
                  className="inline-flex rounded-full p-0.5 text-[color:var(--fg-3)] hover:bg-white/10 hover:text-[color:var(--fg-1)]"
                  aria-label={`Quitar ${tag}`}
                  onClick={() => removeTag(tag)}
                >
                  <X className="h-3.5 w-3.5" aria-hidden />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs text-[color:var(--fg-4)]">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-[color:var(--danger)]" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
