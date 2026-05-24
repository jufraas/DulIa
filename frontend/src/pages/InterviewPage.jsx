import { useSearchParams } from 'react-router-dom'
import InterviewLegacyPage from './InterviewLegacyPage'
import InterviewV2Page from './InterviewV2Page'

/**
 * Router de versión: V2 conversacional (default con flag) o V1 quiz (?legacy=1).
 */
export default function InterviewPage() {
  const [params] = useSearchParams()
  const version = import.meta.env.VITE_INTERVIEW_VERSION ?? 'v2'

  if (params.get('legacy') === '1') {
    return <InterviewLegacyPage />
  }

  if (version === 'v2') {
    return <InterviewV2Page />
  }

  return <InterviewLegacyPage />
}
