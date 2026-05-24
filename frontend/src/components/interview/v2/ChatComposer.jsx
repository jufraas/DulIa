import { useEffect, useRef } from 'react'

const MAX_CHARS = 2000

/** @param {{ onSend: (text: string) => void, disabled?: boolean, sending?: boolean }} props */
export default function ChatComposer({ onSend, disabled = false, sending = false }) {
  const textareaRef = useRef(null)
  const valueRef = useRef('')

  useEffect(() => {
    if (!sending && !disabled && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [sending, disabled])

  function handleSubmit(e) {
    e.preventDefault()
    const text = valueRef.current.trim()
    if (!text || disabled || sending) return
    onSend(text)
    if (textareaRef.current) {
      textareaRef.current.value = ''
      textareaRef.current.style.height = 'auto'
      valueRef.current = ''
    }
  }

  function handleInput(e) {
    const el = e.target
    valueRef.current = el.value
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
    const counter = document.getElementById('composer-char-count')
    if (counter) {
      counter.textContent = `${el.value.length} / ${MAX_CHARS}`
      counter.classList.toggle('text-amber-400', el.value.length > 1500)
      counter.classList.toggle('text-white/35', el.value.length <= 1500)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="sticky bottom-0 border-t border-purple-500/20 bg-[#12121a]/95 px-4 py-3 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-2xl flex-col gap-2">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            rows={1}
            maxLength={MAX_CHARS}
            disabled={disabled || sending}
            placeholder="Escribe tu respuesta…"
            onInput={handleInput}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
            className="max-h-40 min-h-[44px] flex-1 resize-none rounded-xl border border-white/12 bg-white/[0.06] px-3.5 py-2.5 text-[15px] text-[#F1F0FB] outline-none transition-colors focus:border-purple-500/45 disabled:opacity-50"
            aria-label="Tu respuesta"
          />
          <button
            type="submit"
            disabled={disabled || sending}
            className="shrink-0 rounded-xl border-none bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Enviar
          </button>
        </div>
        <p id="composer-char-count" className="m-0 text-right text-xs text-white/35">
          0 / {MAX_CHARS}
        </p>
      </div>
    </form>
  )
}
