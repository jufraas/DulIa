import { CV_ACCEPT, CV_MAX_SIZE_MB } from '../constants/onboardingOptions'

/** @param {File | null} file */
export function validateCvFile(file) {
  if (!file) return ''

  if (file.type !== CV_ACCEPT && !file.name.toLowerCase().endsWith('.pdf')) {
    return 'Solo se acepta PDF'
  }

  if (file.size > CV_MAX_SIZE_MB * 1024 * 1024) {
    return `El archivo supera ${CV_MAX_SIZE_MB} MB`
  }

  return ''
}
