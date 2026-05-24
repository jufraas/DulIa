import { useState } from 'react'
import PageShell from '../components/layout/PageShell'
import SiteHeader from '../components/layout/SiteHeader'
import Container from '../components/ui/Container'
import InterviewLauncher from '../components/interview/InterviewLauncher'
import InterviewSession from '../components/interview/InterviewSession'
import InterviewResults from '../components/interview/InterviewResults'
import InterviewHistory from '../components/interview/InterviewHistory'
import { MOCK_QUESTIONS, MOCK_INTERVIEW_RESULT, MOCK_HISTORY } from '../mocks/mockInterview'

const TABS = [
  { id: 'nueva', label: 'Nueva entrevista' },
  { id: 'sesion', label: 'En curso' },
  { id: 'resultados', label: 'Resultados' },
  { id: 'historial', label: 'Historial' },
]

export default function InterviewPage() {
  const [view, setView] = useState('nueva')
  const [activeSkill, setActiveSkill] = useState(null)
  const [activeRol, setActiveRol] = useState('')
  const [resultado, setResultado] = useState(null)

  function handleStart(skill, rol) {
    setActiveSkill(skill)
    setActiveRol(rol)
    setView('sesion')
  }

  function handleFinish() {
    setResultado(MOCK_INTERVIEW_RESULT)
    setView('resultados')
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

  const questions = activeSkill ? (MOCK_QUESTIONS[activeSkill] ?? []) : []

  return (
    <PageShell>
      <SiteHeader />

      <main className="relative z-[1] flex-1 pb-28 pt-14">
        <Container>

          <div className="mb-8">
            <h1 className="m-0 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Entrevistas con IA
            </h1>
            <p className="mt-2 text-base text-gray-400">
              Practica, recibe feedback y mejora tu desempeño.
            </p>
          </div>

          <div className="mb-8 flex flex-wrap gap-2">
            {TABS.map(tab => {
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

          {view === 'nueva' && (
            <InterviewLauncher onStart={handleStart} />
          )}

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
              onAddToPlan={() => {}}
              onNewInterview={handleNewInterview}
            />
          )}

          {view === 'historial' && (
            <InterviewHistory
              historial={MOCK_HISTORY}
              onVerFeedback={() => {
                setResultado(MOCK_INTERVIEW_RESULT)
                setView('resultados')
              }}
              onNuevaEntrevista={handleNewInterview}
            />
          )}

        </Container>
      </main>
    </PageShell>
  )
}
