import { useCallback, useState } from 'react'
import { postCoachChat } from '../services/api'
import { getOrCreateSessionId } from '../utils/session'

/** @typedef {{ id: string, role: 'user' | 'coach', text: string }} ChatMessage */

export function useCoachChat() {
  const [messages, setMessages] = useState(/** @type {ChatMessage[]} */ ([]))
  const [suggestions, setSuggestions] = useState(/** @type {string[]} */ ([]))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const sendMessage = useCallback(async (text) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg = {
      id: `user-${Date.now()}`,
      role: /** @type {'user'} */ ('user'),
      text: trimmed,
    }

    setMessages((prev) => [...prev, userMsg])
    setSuggestions([])
    setError('')
    setLoading(true)

    try {
      const data = await postCoachChat(trimmed, getOrCreateSessionId())
      setMessages((prev) => [
        ...prev,
        {
          id: `coach-${Date.now()}`,
          role: 'coach',
          text: data.respuesta ?? 'No pude responder ahora. Intenta de nuevo.',
        },
      ])
      setSuggestions(data.sugerencias_rapidas ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al contactar al coach.')
    } finally {
      setLoading(false)
    }
  }, [loading])

  return { messages, suggestions, loading, error, sendMessage }
}
