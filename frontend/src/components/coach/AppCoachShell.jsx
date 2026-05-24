import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import CoachChatBubble from '../results/CoachChatBubble'
import { CoachProvider } from '../../context/CoachProvider'
import { useProfileStore } from '../../store/useProfileStore'
import {
  parseAnalysisResponse,
  resolveEmployabilityScore,
} from '../../utils/analysisDisplay'
import { COACH_HIDDEN_ROUTES } from '../../utils/coachPageContext'

/**
 * Coach global: FAB + contexto en todas las pantallas (excepto auth/construcción).
 *
 * @param {{ children: import('react').ReactNode }} props
 */
export default function AppCoachShell({ children }) {
  const routePath = useLocation().pathname
  const savedProfile = useProfileStore((s) => s.savedProfile)
  const jobs = useProfileStore((s) => s.jobs)
  const analysis = useProfileStore((s) => s.analysis)
  const radar = useProfileStore((s) => s.radar)

  const insights = useMemo(() => parseAnalysisResponse(analysis), [analysis])

  const topScore = useMemo(
    () => resolveEmployabilityScore({ insights, jobs, radar }),
    [insights, jobs, radar],
  )

  const topJob = useMemo(
    () =>
      jobs.reduce(
        (best, job) =>
          !best || (job.score_compatibilidad ?? 0) > (best.score_compatibilidad ?? 0)
            ? job
            : best,
        /** @type {import('../../store/useProfileStore').Job | null} */ (null),
      ),
    [jobs],
  )

  const hideCoach = COACH_HIDDEN_ROUTES.includes(routePath)

  return (
    <CoachProvider
      routePath={routePath}
      profile={savedProfile}
      topScore={topScore}
      topJob={topJob}
      insights={insights}
    >
      {children}
      {!hideCoach && <CoachChatBubble />}
    </CoachProvider>
  )
}
