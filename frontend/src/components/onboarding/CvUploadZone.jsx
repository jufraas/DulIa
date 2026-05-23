import { useCallback, useRef, useState } from 'react'
import { FileText, Loader2, Sparkles, Upload, X } from 'lucide-react'
import { CV_ACCEPT, CV_MAX_SIZE_MB } from '../../constants/onboardingOptions'
import { validateCvFile } from '../../utils/validateCvFile'
import Button from '../ui/Button'

/**
 * @param {{
 *   onFileSelect: (file: File | null, error?: string) => void | Promise<void>,
 *   parsing?: boolean,
 *   fileName?: string | null,
 *   fieldsCount?: number,
 *   error?: string,
 *   onClear?: () => void,
 * }} props
 */
export default function CvUploadZone({
  onFileSelect,
  parsing = false,
  fileName = null,
  fieldsCount = 0,
  error = '',
  onClear,
}) {
  const inputRef = useRef(/** @type {HTMLInputElement | null} */ (null))
  const [dragOver, setDragOver] = useState(false)

  const handleFiles = useCallback(
    (files) => {
      const file = files?.[0]
      if (!file) return
      const validationError = validateCvFile(file)
      if (validationError) {
        onFileSelect(null, validationError)
        return
      }
      onFileSelect(file)
    },
    [onFileSelect],
  )

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const hasFile = Boolean(fileName)

  return (
    <div
      className="mb-2 rounded-[20px] border border-dashed transition-colors"
      style={{
        borderColor: dragOver ? 'rgba(168,85,247,0.65)' : 'rgba(168,85,247,0.35)',
        background: dragOver ? 'rgba(168,85,247,0.10)' : 'rgba(168,85,247,0.06)',
      }}
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={CV_ACCEPT}
        className="sr-only"
        onChange={(e) => {
          handleFiles(e.target.files)
          e.target.value = ''
        }}
      />

      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white"
          style={{ background: 'var(--grad-brand)' }}
        >
          {parsing ? (
            <Loader2 className="h-6 w-6 animate-spin" aria-hidden />
          ) : (
            <FileText className="h-6 w-6" aria-hidden />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="m-0 font-[family-name:var(--font-display)] text-base font-bold text-[color:var(--fg-1)]">
                {hasFile ? 'CV cargado' : '¿Tienes hoja de vida en PDF?'}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-[color:var(--fg-3)]">
                {hasFile ? (
                  <>
                    <span className="text-[color:var(--violet-200)]">{fileName}</span>
                    {fieldsCount > 0 && (
                      <> · {fieldsCount} campos detectados — revisa y sigue al siguiente paso.</>
                    )}
                  </>
                ) : (
                  <>
                    Súbela y prellenamos nombre, estudios, experiencia y habilidades. Máx.{' '}
                    {CV_MAX_SIZE_MB} MB.
                  </>
                )}
              </p>
            </div>
            {hasFile && onClear && !parsing && (
              <button
                type="button"
                className="rounded-lg p-1.5 text-[color:var(--fg-3)] hover:bg-white/5 hover:text-[color:var(--fg-1)]"
                aria-label="Quitar CV"
                onClick={onClear}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {error && (
            <p className="mt-2 text-sm text-[color:var(--danger)]" role="alert">
              {error}
            </p>
          )}
        </div>

        {!hasFile && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            loading={parsing}
            iconLeft={parsing ? undefined : <Upload className="h-4 w-4" aria-hidden />}
            className="shrink-0"
            onClick={() => inputRef.current?.click()}
          >
            {parsing ? 'Leyendo CV…' : 'Subir PDF'}
          </Button>
        )}

        {hasFile && fieldsCount > 0 && !parsing && (
          <div className="eyebrow-dl shrink-0">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Listo para revisar
          </div>
        )}
      </div>
    </div>
  )
}
