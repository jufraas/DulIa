import { createContext } from 'react'

export const SESSION_TEASER = 'dulia_coach_teaser_dismissed'
export const SESSION_BANNER = 'dulia_coach_banner_dismissed'
export const SESSION_OPENED = 'dulia_coach_opened'

export const CoachContext = createContext(/** @type {null | Record<string, unknown>} */ (null))
