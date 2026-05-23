const SESSION_KEY = 'dulia_session_id'

/** @returns {string} */
export function getOrCreateSessionId() {
  let id = localStorage.getItem(SESSION_KEY)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(SESSION_KEY, id)
  }
  return id
}

export function clearSessionId() {
  localStorage.removeItem(SESSION_KEY)
}
