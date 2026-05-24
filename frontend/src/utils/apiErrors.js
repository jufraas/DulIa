import axios from 'axios'

/**
 * Mensaje legible desde respuestas FastAPI / errores de red.
 * @param {unknown} err
 * @param {string} [fallback]
 */
export function extractApiErrorMessage(err, fallback = 'No pudimos completar la solicitud.') {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status
    const detail = err.response?.data?.detail

    if (typeof detail === 'string' && detail.trim()) return detail
    if (Array.isArray(detail)) {
      const joined = detail
        .map((/** @type {{ msg?: string }} */ item) => item?.msg)
        .filter(Boolean)
        .join('. ')
      if (joined) return joined
    }

    if (status === 404) return 'Recurso no encontrado.'
    if (status === 422) return 'Datos inválidos. Revisa los campos e intenta de nuevo.'
    if (status === 429) return 'Demasiadas solicitudes. Espera un momento.'
    if (status && status >= 500) return 'Error del servidor. Intenta de nuevo en unos segundos.'
    if (!err.response) return 'Sin conexión al servidor. Usando datos locales.'
  }

  if (err instanceof Error && err.message.trim()) return err.message
  return fallback
}

/** @returns {boolean} */
export function isForceProgressMock() {
  const flag = import.meta.env.VITE_FORCE_PROGRESS_MOCK
  return flag === 'true' || flag === '1'
}
