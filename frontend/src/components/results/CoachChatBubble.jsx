import { useEffect, useRef, useState } from 'react'
import { MessageCircle, Send, Sparkles, X } from 'lucide-react'
import { useCoachChat } from '../../hooks/useCoachChat'

export default function CoachChatBubble() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const { messages, suggestions, loading, error, sendMessage } = useCoachChat()
  const listRef = useRef(/** @type {HTMLDivElement | null} */ (null))
  const inputRef = useRef(/** @type {HTMLInputElement | null} */ (null))

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages, loading, open])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    sendMessage(input)
    setInput('')
  }

  return (
    <>
      {open && (
        <div
          className="fixed bottom-24 right-4 z-[100] flex w-[min(100vw-2rem,380px)] flex-col overflow-hidden rounded-[20px] shadow-2xl sm:right-6"
          style={{
            background: 'var(--bg-2)',
            border: '1px solid rgba(168,85,247,0.35)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.45), 0 0 0 1px rgba(168,85,247,0.20)',
            maxHeight: 'min(70vh, 520px)',
          }}
          role="dialog"
          aria-label="Coach DulIA"
        >
          <div
            className="flex items-center justify-between gap-3 px-4 py-3"
            style={{
              background: 'var(--grad-brand)',
              borderBottom: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <div className="flex items-center gap-2 text-white">
              <Sparkles className="h-4 w-4" aria-hidden />
              <span className="text-sm font-bold">Coach DulIA</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 text-white/80 transition hover:bg-white/10 hover:text-white"
              aria-label="Cerrar chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div
            ref={listRef}
            className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4"
            style={{ minHeight: 200 }}
          >
            {messages.length === 0 && (
              <p className="m-0 text-center text-[13px] leading-relaxed text-[color:var(--fg-3)]">
                Pregúntame sobre vacantes, habilidades o tu plan de acción.
              </p>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${
                  msg.role === 'user' ? 'ml-auto' : 'mr-auto'
                }`}
                style={
                  msg.role === 'user'
                    ? {
                        background: 'var(--grad-cta)',
                        color: '#fff',
                      }
                    : {
                        background: 'var(--bg-1)',
                        border: '1px solid rgba(168,85,247,0.20)',
                        color: 'var(--fg-2)',
                      }
                }
              >
                {msg.text}
              </div>
            ))}
            {loading && (
              <p className="m-0 text-[13px] text-[color:var(--fg-3)]">DulIA está pensando…</p>
            )}
            {error && <p className="m-0 text-[13px] text-[#F87171]">{error}</p>}
          </div>

          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 border-t border-[rgba(168,85,247,0.12)] px-4 py-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => sendMessage(s)}
                  className="chip-dl text-[11px]"
                  disabled={loading}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="flex gap-2 border-t border-[rgba(168,85,247,0.12)] p-3"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pregunta…"
              disabled={loading}
              className="min-w-0 flex-1 rounded-xl px-3 py-2.5 text-[13px] outline-none"
              style={{
                background: 'var(--bg-1)',
                border: '1px solid rgba(168,85,247,0.25)',
                color: 'var(--fg-1)',
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white disabled:opacity-40"
              style={{ background: 'var(--grad-brand)' }}
              aria-label="Enviar"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-4 z-[100] flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105 sm:right-6"
        style={{
          background: 'var(--grad-cta)',
          boxShadow: '0 12px 32px rgba(236,72,153,0.45)',
        }}
        aria-label={open ? 'Cerrar coach DulIA' : 'Abrir coach DulIA'}
        aria-expanded={open}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </>
  )
}
