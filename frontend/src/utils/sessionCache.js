const SESSION_DATA_KEY = 'dulia_session_data'
const WIZARD_DRAFT_KEY = 'dulia_wizard_draft'

/**
 * @typedef {Object} SessionCachePayload
 * @property {string} sessionId
 * @property {import('../store/useProfileStore').SavedProfile} savedProfile
 * @property {import('../store/useProfileStore').OnboardingFormState | null} [formSnapshot]
 * @property {import('../store/useProfileStore').Job[]} [jobs]
 * @property {import('../store/useProfileStore').MarketDashboard | null} [market]
 * @property {import('../store/useProfileStore').ThirtyDayPlan | null} [plan]
 * @property {number} [updatedAt]
 */

/** @param {string} sessionId @returns {SessionCachePayload | null} */
export function readSessionCache(sessionId) {
  try {
    const raw = localStorage.getItem(SESSION_DATA_KEY)
    if (!raw) return null
    const data = /** @type {SessionCachePayload} */ (JSON.parse(raw))
    if (data.sessionId !== sessionId) return null
    return data
  } catch {
    return null
  }
}

/** @param {SessionCachePayload} payload */
export function writeSessionCache(payload) {
  localStorage.setItem(
    SESSION_DATA_KEY,
    JSON.stringify({ ...payload, updatedAt: Date.now() }),
  )
}

export function clearSessionCache() {
  localStorage.removeItem(SESSION_DATA_KEY)
}

/**
 * @param {{
 *   sessionId: string | null
 *   savedProfile: import('../store/useProfileStore').SavedProfile | null
 *   formSnapshot: import('../store/useProfileStore').OnboardingFormState | null
 *   jobs: import('../store/useProfileStore').Job[]
 *   market: import('../store/useProfileStore').MarketDashboard | null
 *   plan: import('../store/useProfileStore').ThirtyDayPlan | null
 * }} state
 */
export function persistSessionCacheFromState(state) {
  if (!state.sessionId || !state.savedProfile) {
    clearSessionCache()
    return
  }

  writeSessionCache({
    sessionId: state.sessionId,
    savedProfile: state.savedProfile,
    formSnapshot: state.formSnapshot,
    jobs: state.jobs,
    market: state.market,
    plan: state.plan,
  })
}

/**
 * @typedef {Object} WizardDraft
 * @property {string} sessionId
 * @property {number} step
 * @property {import('../store/useProfileStore').OnboardingFormState} form
 * @property {number} updatedAt
 */

/** @param {string} sessionId @returns {WizardDraft | null} */
export function readWizardDraft(sessionId) {
  try {
    const raw = localStorage.getItem(WIZARD_DRAFT_KEY)
    if (!raw) return null
    const data = /** @type {WizardDraft} */ (JSON.parse(raw))
    if (data.sessionId !== sessionId) return null
    return data
  } catch {
    return null
  }
}

/** @param {WizardDraft} draft */
export function writeWizardDraft(draft) {
  localStorage.setItem(WIZARD_DRAFT_KEY, JSON.stringify({ ...draft, updatedAt: Date.now() }))
}

export function clearWizardDraft() {
  localStorage.removeItem(WIZARD_DRAFT_KEY)
}
