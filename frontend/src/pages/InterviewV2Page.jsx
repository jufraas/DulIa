import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import SiteHeader from '../components/layout/SiteHeader'
import Container from '../components/ui/Container'
import InterviewLauncherV2 from '../components/interview/v2/InterviewLauncherV2'
import InterviewChatHeader from '../components/interview/v2/InterviewChatHeader'
import StageStepper from '../components/interview/v2/StageStepper'
import ChatBubble from '../components/interview/v2/ChatBubble'
import ChatComposer from '../components/interview/v2/ChatComposer'
import TypingIndicator from '../components/interview/v2/TypingIndicator'
import InterviewSummaryV2 from '../components/interview/v2/InterviewSummaryV2'
import InterviewHistory from '../components/interview/InterviewHistory'
import ProgressDataSourceBanner from '../components/progress/ProgressDataSourceBanner'
import ProcessStatusBar from '../components/shared/ProcessStatusBar'
import { useInterviewV2Store } from '../store/useInterviewV2Store'
import { useProfileStore } from '../store/useProfileStore'
import { mapV2HistoryToDisplay } from '../utils/interviewV2Display'
import useProfileCheck from '../hooks/useProfileCheck'

const TABS = [
  { id: 'nueva', label: 'Nueva' },
  { id: 'chat', label: 'Conversación' },
  { id: 'resumen', label: 'Resumen' },
  { id: 'historial', label: 'Historial' },
]

export default function InterviewV2Page() {
  const navigate = useNavigate()
  const chatEndRef = useRef(null)
  const { hasProfile, loading: checking } = useProfileCheck()
  const savedProfile = useProfileStore((s) => s.savedProfile)

  const start = useInterviewV2Store((s) => s.start)
  const sendMessage = useInterviewV2Store((s) => s.sendMessage)
  const abort = useInterviewV2Store((s) => s.abort)
  const reset = useInterviewV2Store((s) => s.reset)
  const hydrate = useInterviewV2Store((s) => s.hydrate)
  const fetchHistory = useInterviewV2Store((s) => s.fetchHistory)
  const loadSummaryFromHistory = useInterviewV2Store((s) => s.loadSummaryFromHistory)
  const addTasksFromWeakSkills = useInterviewV2Store((s) => s.addTasksFromWeakSkills)

  const interviewId = useInterviewV2Store((s) => s.interviewId)
  const persona = useInterviewV2Store((s) => s.persona)
  const messages = useInterviewV2Store((s) => s.messages)
  const stage = useInterviewV2Store((s) => s.stage)
  const stageProgress = useInterviewV2Store((s) => s.stageProgress)
  const finished = useInterviewV2Store((s) => s.finished)
  const summaryDisplay = useInterviewV2Store((s) => s.summaryDisplay)
  const sending = useInterviewV2Store((s) => s.sending)
  const starting = useInterviewV2Store((s) => s.starting)
  const loading = useInterviewV2Store((s) => s.loading)
  const error = useInterviewV2Store((s) => s.error)
  const dataSource = useInterviewV2Store((s) => s.dataSource)
  const dataSourceDetail = useInterviewV2Store((s) => s.dataSourceDetail)
  const history = useInterviewV2Store((s) => s.history)
  const stageTransitionPending = useInterviewV2Store((s) => s.stageTransitionPending)
  const stageTransitionMessage = useInterviewV2Store((s) => s.stageTransitionMessage)

  const [view, setView] = useState('nueva')
  const [showAbortConfirm, setShowAbortConfirm] = useState(false)

  useEffect(() => {
    void hydrate().then((ok) => {
      if (ok) setView(finished ? 'resumen' : 'chat')
    })
    void fetchHistory()
  }, [hydrate, fetchHistory, finished])

  useEffect(() => {
    if (!checking && hasProfile === false && !savedProfile) {
      navigate('/comenzar', { replace: true })
    }
  }, [checking, hasProfile, savedProfile, navigate])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, sending, stageTransitionPending])

  async function handleStart(skill, rol) {
    const ok = await start(skill, rol === 'Ninguno' ? null : rol)
    if (ok) setView('chat')
  }

  async function handleSend(text) {
    await sendMessage(text)
    if (useInterviewV2Store.getState().finished) {
      setView('resumen')
    }
  }

  async function handleAbort() {
    const ok = await abort()
    if (ok) {
      setShowAbortConfirm(false)
      setView('nueva')
    }
  }

  async function handleAddToPlan() {
    const skills = summaryDisplay?.weakSkills ?? []
    if (!skills.length) return
    const ok = await addTasksFromWeakSkills(skills)
    if (ok) navigate('/progreso')
  }

  function handleNewInterview() {
    reset()
    setView('nueva')
  }

  async function handleVerFeedback(id) {
    const ok = await loadSummaryFromHistory(id)
    if (ok) setView('resumen')
  }

  function handleTabClick(id) {
    if (id === 'chat' && !interviewId && !finished) return
    if (id === 'resumen' && !summaryDisplay) return
    setView(id)
  }

  const historialDisplay = mapV2HistoryToDisplay(history)

  const stageLabelFlags = useMemo(() => {
    /** @type {boolean[]} */
    const flags = []
    let prevStage = ''
    for (const msg of messages) {
      const show = msg.stage !== prevStage && msg.role === 'interviewer'
      flags.push(show)
      if (show) prevStage = msg.stage
    }
    return flags
  }, [messages])

  return (
    <PageShell>
      <SiteHeader />

      <main className="relative flex min-h-[calc(100vh-4rem)] flex-1 flex-col pb-0 pt-14">
        {view !== 'chat' && (
          <Container className="pb-4">
            <div className="mb-6">
              <p className="eyebrow-dl mb-2">Entrevista · DulIA</p>
              <h1 className="m-0 font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-tight text-[color:var(--fg-1)] sm:text-4xl">
                Entrevistas con IA
              </h1>
              <p className="mt-2 text-base text-[color:var(--fg-2)]">
                Conversación en vivo con una entrevistadora del sector.
              </p>
            </div>

            <ProgressDataSourceBanner
              dataSource={dataSource}
              detail={
                dataSource === 'mock'
                  ? dataSourceDetail || 'Modo demo — el entrevistador es simulado'
                  : undefined
              }
            />

            {error && (
              <p className="mb-4 text-sm text-[color:var(--danger)]" role="alert">
                {error}
              </p>
            )}

            <div className="mb-6 flex flex-wrap gap-2">
              {TABS.map((tab) => {
                const isActive = view === tab.id
                const isDisabled =
                  (tab.id === 'chat' && !interviewId && !finished) ||
                  (tab.id === 'resumen' && !summaryDisplay)
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
          </Container>
        )}

        {view === 'nueva' && (
          <Container className="pb-28">
            <InterviewLauncherV2 onStart={handleStart} starting={starting} />
            <p className="mt-8 text-center text-sm text-[color:var(--fg-3)]">
              <Link to="/progreso" className="text-[color:var(--brand-violet)] hover:underline">
                ← Volver a Mi progreso
              </Link>
            </p>
          </Container>
        )}

        {view === 'chat' && (
          <div className="flex flex-1 flex-col">
            <InterviewChatHeader persona={persona} stage={stage} />
            <StageStepper steps={stageProgress} />

            {dataSource === 'mock' && (
              <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-100">
                Modo demo — el entrevistador es simulado
              </div>
            )}

            <div
              className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-3 overflow-y-auto px-4 py-4"
              aria-live="polite"
              aria-relevant="additions"
            >
              {messages.map((msg, i) => (
                  <ChatBubble
                    key={`${msg.t}-${i}`}
                    role={msg.role}
                    text={msg.text}
                    stage={msg.stage}
                    showStageLabel={stageLabelFlags[i]}
                  />
              ))}
              {(sending || stageTransitionPending) && (
                <TypingIndicator
                  label={
                    stageTransitionPending
                      ? stageTransitionMessage
                      : `${persona?.nombre?.split(' ')[0] ?? 'Andrea'} está escribiendo…`
                  }
                />
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="mx-auto flex w-full max-w-2xl justify-end px-4 pb-2">
              {!finished && (
                <button
                  type="button"
                  onClick={() => setShowAbortConfirm(true)}
                  className="text-xs font-semibold text-white/40 underline-offset-2 hover:text-white/60 hover:underline"
                >
                  Pausar entrevista
                </button>
              )}
            </div>

            <ChatComposer
              onSend={handleSend}
              disabled={finished || stageTransitionPending}
              sending={sending || stageTransitionPending}
            />
          </div>
        )}

        {view === 'resumen' && summaryDisplay && (
          <Container className="pb-28">
            <InterviewSummaryV2
              resultado={summaryDisplay}
              onAddToPlan={handleAddToPlan}
              onNewInterview={handleNewInterview}
              loading={loading}
            />
            <p className="mt-8 text-center text-sm text-[color:var(--fg-3)]">
              <Link to="/progreso" className="text-[color:var(--brand-violet)] hover:underline">
                ← Volver a Mi progreso
              </Link>
            </p>
          </Container>
        )}

        {view === 'historial' && (
          <Container className="pb-28">
            <InterviewHistory
              historial={historialDisplay}
              onVerFeedback={handleVerFeedback}
              onNuevaEntrevista={handleNewInterview}
              showV2Badge
            />
            <p className="mt-8 text-center text-sm text-[color:var(--fg-3)]">
              <Link to="/progreso" className="text-[color:var(--brand-violet)] hover:underline">
                ← Volver a Mi progreso
              </Link>
            </p>
          </Container>
        )}
      </main>

      {showAbortConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-purple-500/30 bg-[#1A1A24] p-6">
            <h3 className="mt-0 text-lg font-bold text-[#F1F0FB]">¿Pausar entrevista?</h3>
            <p className="text-sm text-white/55">
              Se descartará el progreso de esta sesión. Podrás iniciar una nueva cuando quieras.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setShowAbortConfirm(false)}
                className="flex-1 rounded-xl border border-white/18 py-2.5 text-sm font-semibold text-white/70"
              >
                Continuar
              </button>
              <button
                type="button"
                onClick={() => void handleAbort()}
                className="flex-1 rounded-xl border-none bg-red-500/90 py-2.5 text-sm font-bold text-white"
              >
                Pausar
              </button>
            </div>
          </div>
        </div>
      )}

      {starting && (
        <ProcessStatusBar
          title="Preparando tu entrevista"
          message="Conectando con la entrevistadora y armando la conversación…"
        />
      )}
    </PageShell>
  )
}
