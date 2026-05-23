import { submitProfile } from './api'

/**
 * @param {import('../store/useProfileStore').ProfileForm} profile
 * @param {File | null} [cvFile]
 */
export function submitProfileWithCv(profile, cvFile = null) {
  return submitProfile(profile, cvFile)
}
