import { CV_MAX_SIZE_MB } from '../constants/onboardingOptions'

/**
 * @param {File} file
 * @returns {string|null} mensaje de error o null si válido
 */
export function validateCvFile(file) {
  if (!file) return 'Selecciona un archivo PDF'
  const name = file.name?.toLowerCase() ?? ''
  const isPdf =
    file.type === 'application/pdf' ||
    file.type === 'application/x-pdf' ||
    file.type === 'application/octet-stream' ||
    !file.type ||
    name.endsWith('.pdf')
  if (!isPdf) return 'Solo aceptamos archivos PDF'
  const maxBytes = CV_MAX_SIZE_MB * 1024 * 1024
  if (file.size > maxBytes) {
    return `El PDF no puede superar ${CV_MAX_SIZE_MB} MB`
  }
  return null
}
