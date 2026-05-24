import { useEffect, useRef, useState } from 'react'
import { MessageCircle, Send, Sparkles, X } from 'lucide-react'
import { useCoachContext } from '../../hooks/useCoachContext'

export default function CoachChatBubble() {
  const [input, setInput] = useState('')
  const {
    open,
    toggleOpen,
    messages,
    suggestions,
    loading,
    error,
    sendMessage,
    showTeaser,
    dismissTeaser,
    openCoach,
    fabPulse,
    welcomeMessage,
    starterSuggestions,
    teaserTitle,
    teaserBody,
  } = useCoachContext()

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

  const displaySuggestions =
    messages.length === 0 && !loading ? starterSuggestions : suggestions

  return (
    <>
      {showTeaser && (
        <div
          className="fixed bottom-[5.25rem] right-4 z-[99] w-[min(calc(100vw-5.5rem),260px)] sm:right-6 sm:w-[min(calc(100vw-6rem),280px)]"
          role="status"
          aria-live="polite"
        >
          <div
            className="relative rounded-2xl px-3.5 py-3 pr-9 text-[13px] leading-snug text-[color:var(--fg-1)] shadow-lg"
            style={{
              background: 'var(--bg-2)',
              border: '1px solid rgba(168,85,247,0.35)',
              boxShadow: '0 12px 32px rgba(0,0,0,0.35)',
            }}
          >
            <button
              type="button"
              onClick={dismissTeaser}
              className="absolute right-2 top-2 rounded p-0.5 text-[color:var(--fg-3)] hover:text-[color:var(--fg-1)]"
              aria-label="Cerrar sugerencia"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <p className="m-0 font-semibold text-[color:var(--violet-200)]">{teaserTitle}</p>
            <p className="mt-1 mb-0 text-[color:var(--fg-2)]">{teaserBody}</p>
            <button
              type="button"
              onClick={() => openCoach()}
              className="mt-2 text-[12px] font-bold text-[color:var(--violet-200)] underline-offset-2 hover:underline"
            >
              Abrir chat
            </button>
          </div>
          <div
            className="absolute -bottom-1.5 right-6 h-3 w-3 rotate-45"
            style={{
              background: 'var(--bg-2)',
              borderRight: '1px solid rgba(168,85,247,0.35)',
              borderBottom: '1px solid rgba(168,85,247,0.35)',
            }}
            aria-hidden
          />
        </div>
      )}

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
              onClick={toggleOpen}
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
              <div
                className="mr-auto max-w-[95%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed"
                style={{
                  background: 'var(--bg-1)',
                  border: '1px solid rgba(168,85,247,0.20)',
                  color: 'var(--fg-2)',
                }}
              >
                {welcomeMessage}
              </div>
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

          {displaySuggestions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 border-t border-[rgba(168,85,247,0.12)] px-4 py-2">
              {displaySuggestions.map((s) => (
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
        onClick={toggleOpen}
        className={`fixed bottom-6 right-4 z-[100] flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105 sm:right-6 ${fabPulse ? 'coach-fab-pulse' : ''}`}
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
