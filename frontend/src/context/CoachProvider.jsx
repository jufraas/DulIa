import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useCoachChat } from '../hooks/useCoachChat'
import {
  buildCoachStarterSuggestions,
  buildCoachWelcomeMessage,
} from '../utils/coachSuggestions'
import {
  CoachContext,
  SESSION_BANNER,
  SESSION_OPENED,
  SESSION_TEASER,
} from './coachContextState'

/**
 * @param {{
 *   children: import('react').ReactNode,
 *   profile?: import('../store/useProfileStore').SavedProfile | null,
 *   topScore?: number,
 *   topJob?: import('../store/useProfileStore').Job | null,
 *   insights?: import('../utils/analysisDisplay').AnalysisInsights | null,
 * }} props
 */
export function CoachProvider({ children, profile, topScore, topJob, insights }) {
  const chat = useCoachChat()
  const [open, setOpen] = useState(false)
  const [showTeaser, setShowTeaser] = useState(false)
  const [showBanner, setShowBanner] = useState(() => !sessionStorage.getItem(SESSION_BANNER))
  const [fabPulse, setFabPulse] = useState(() => !sessionStorage.getItem(SESSION_OPENED))

  const ctx = useMemo(() => ({ profile, topScore, topJob, insights }), [
    profile,
    topScore,
    topJob,
    insights,
  ])

  const welcomeMessage = useMemo(() => buildCoachWelcomeMessage(ctx), [ctx])
  const starterSuggestions = useMemo(() => buildCoachStarterSuggestions(ctx), [ctx])

  const markOpened = useCallback(() => {
    sessionStorage.setItem(SESSION_OPENED, '1')
    setShowTeaser(false)
    setFabPulse(false)
    sessionStorage.setItem(SESSION_TEASER, '1')
  }, [])

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_TEASER) || sessionStorage.getItem(SESSION_OPENED)) {
      return undefined
    }

    const showTimer = window.setTimeout(() => {
      setShowTeaser(true)
    }, 2800)

    return () => window.clearTimeout(showTimer)
  }, [])

  useEffect(() => {
    if (!showTeaser || open) return undefined

    const hideTimer = window.setTimeout(() => setShowTeaser(false), 9000)
    return () => window.clearTimeout(hideTimer)
  }, [showTeaser, open])

  const dismissTeaser = useCallback(() => {
    setShowTeaser(false)
    sessionStorage.setItem(SESSION_TEASER, '1')
  }, [])

  const dismissBanner = useCallback(() => {
    setShowBanner(false)
    sessionStorage.setItem(SESSION_BANNER, '1')
  }, [])

  const openCoach = useCallback(
    (opts = {}) => {
      markOpened()
      setOpen(true)
      const msg = opts.message?.trim()
      if (msg) chat.sendMessage(msg)
    },
    [markOpened, chat],
  )

  const askCoach = useCallback((message) => openCoach({ message }), [openCoach])

  const toggleOpen = useCallback(() => {
    setOpen((prev) => {
      const next = !prev
      if (next) markOpened()
      return next
    })
  }, [markOpened])

  const value = useMemo(
    () => ({
      ...chat,
      profile,
      topScore,
      topJob,
      open,
      setOpen,
      toggleOpen,
      openCoach,
      askCoach,
      showTeaser: showTeaser && !open,
      dismissTeaser,
      showBanner,
      dismissBanner,
      fabPulse,
      welcomeMessage,
      starterSuggestions,
    }),
    [
      chat,
      profile,
      topScore,
      topJob,
      open,
      toggleOpen,
      openCoach,
      askCoach,
      showTeaser,
      dismissTeaser,
      showBanner,
      dismissBanner,
      fabPulse,
      welcomeMessage,
      starterSuggestions,
    ],
  )

  return <CoachContext.Provider value={value}>{children}</CoachContext.Provider>
}
