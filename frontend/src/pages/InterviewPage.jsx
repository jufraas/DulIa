import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import SiteHeader from '../components/layout/SiteHeader'
import Container from '../components/ui/Container'
import InterviewLauncher from '../components/interview/InterviewLauncher'
import InterviewSession from '../components/interview/InterviewSession'
import InterviewResults from '../components/interview/InterviewResults'
import InterviewHistory from '../components/interview/InterviewHistory'
import GeminiThinkingLoader from '../components/interview/GeminiThinkingLoader'
import { MOCK_QUESTIONS, MOCK_INTERVIEW_RESULT } from '../mocks/mockInterview'
import { useInterviewStore } from '../store/useInterviewStore'
import { useAuth } from '../hooks/useAuth'
import { mapHistoryToDisplay, mapInterviewResultToDisplay } from '../utils/interviewDisplay'

const TABS = [
  { id: 'nueva', label: 'Nueva entrevista' },
  { id: 'sesion', label: 'En curso' },
  { id: 'resultados', label: 'Resultados' },
  { id: 'historial', label: 'Historial' },
]

export default function InterviewPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const startInterviewAction = useInterviewStore((s) => s.startInterview)
  const submitAnswerAction = useInterviewStore((s) => s.submitAnswer)
  const finishInterviewAction = useInterviewStore((s) => s.finishInterview)
  const fetchHistory = useInterviewStore((s) => s.fetchHistory)
  const addTasksFromWeakSkills = useInterviewStore((s) => s.addTasksFromWeakSkills)
  const history = useInterviewStore((s) => s.history)
  const submitting = useInterviewStore((s) => s.submitting)
  const error = useInterviewStore((s) => s.error)
  const lastResult = useInterviewStore((s) => s.lastResult)

  const [view, setView] = useState('nueva')
  const [activeSkill, setActiveSkill] = useState(null)
  const [activeRol, setActiveRol] = useState('')
  const [resultado, setResultado] = useState(null)
  const [finishing, setFinishing] = useState(false)

  useEffect(() => {
    void fetchHistory()
  }, [fetchHistory])

  async function handleStart(skill, rol) {
    setResultado(null)
    const session = await startInterviewAction(skill, rol || null)
    if (!session) return
    setActiveSkill(skill)
    setActiveRol(rol)
    setView('sesion')
  }

  async function handleFinish(respuestas) {
    setFinishing(true)
    try {
      for (const answer of respuestas) {
        if (!answer?.trim()) continue
        const updated = await submitAnswerAction(answer)
        if (!updated) break
      }
      const apiResult = await finishInterviewAction(user?.id)
      const display = apiResult
        ? mapInterviewResultToDisplay(apiResult)
        : lastResult
          ? mapInterviewResultToDisplay(lastResult)
          : MOCK_INTERVIEW_RESULT
      setResultado(display)
      setView('resultados')
      await fetchHistory()
    } finally {
      setFinishing(false)
    }
  }

  function handleNewInterview() {
    setActiveSkill(null)
    setActiveRol('')
    setResultado(null)
    setView('nueva')
  }

  function handleTabClick(id) {
    if (id === 'sesion' && view !== 'sesion') return
    if (id === 'resultados' && !resultado) return
    setView(id)
  }

  async function handleAddToPlan() {
    const skills = resultado?.weakSkills ?? []
    if (!skills.length) return
    const ok = await addTasksFromWeakSkills(skills)
    if (ok) navigate('/progreso')
  }

  const questions = activeSkill ? (MOCK_QUESTIONS[activeSkill] ?? []) : []
  const historialDisplay = mapHistoryToDisplay(history)

  return (
    <PageShell>
      <SiteHeader />

      {(submitting || finishing) && <GeminiThinkingLoader visible minMs={4000} maxMs={9000} />}

      <main className="relative z-[1] flex-1 pb-28 pt-14">
        <Container>
          <div className="mb-8">
            <p className="eyebrow-dl mb-2">Entrevista · DulIA</p>
            <h1
              className="m-0 font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight text-[color:var(--fg-1)] sm:text-4xl"
            >
              Entrevistas con IA
            </h1>
            <p className="mt-2 text-base text-[color:var(--fg-2)]">
              Practica, recibe feedback y mejora tu desempeño.
            </p>
          </div>

          {error && (
            <p className="mb-4 text-sm text-[color:var(--danger)]" role="alert">
              {error}
            </p>
          )}

          <div className="mb-8 flex flex-wrap gap-2">
            {TABS.map((tab) => {
              const isActive = view === tab.id
              const isDisabled =
                (tab.id === 'sesion' && view !== 'sesion') ||
                (tab.id === 'resultados' && !resultado)
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabClick(tab.id)}
                  disabled={isDisabled}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow'
                      : isDisabled
                        ? 'cursor-not-allowed bg-gray-800 text-gray-600'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {view === 'nueva' && <InterviewLauncher onStart={handleStart} />}

          {view === 'sesion' && (
            <InterviewSession
              skill={activeSkill}
              rol={activeRol}
              questions={questions}
              onFinish={handleFinish}
            />
          )}

          {view === 'resultados' && resultado && (
            <InterviewResults
              resultado={resultado}
              onAddToPlan={handleAddToPlan}
              onNewInterview={handleNewInterview}
            />
          )}

          {view === 'historial' && (
            <InterviewHistory
              historial={historialDisplay}
              onVerFeedback={() => {
                if (lastResult) {
                  setResultado(mapInterviewResultToDisplay(lastResult))
                } else {
                  setResultado(MOCK_INTERVIEW_RESULT)
                }
                setView('resultados')
              }}
              onNuevaEntrevista={handleNewInterview}
            />
          )}

          <p className="mt-8 text-center text-sm text-[color:var(--fg-3)]">
            <Link to="/progreso" className="text-[color:var(--brand-violet)] hover:underline">
              ← Volver a Mi progreso
            </Link>
          </p>
        </Container>
      </main>
    </PageShell>
  )
}
