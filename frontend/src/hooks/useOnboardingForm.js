import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createProfile,
  loadResultsBundle,
  parseCvPdf,
} from '../services/api'
import { resolveLocationFields } from '../constants/colombiaLocations'
import { mergeCvPrefillIntoForm } from '../services/mockCvPrefill'
import { EMPTY_ONBOARDING_FORM } from '../constants/emptyForm'
import { WIZARD_STEPS } from '../constants/onboardingOptions'
import { buildProfilePayload } from '../utils/buildProfilePayload'
import { validateOnboardingStep, validateOnboardingForm } from '../utils/validateOnboardingStep'
import { getOrCreateSessionId } from '../utils/session'
import {
  clearWizardDraft,
  readWizardDraft,
  writeWizardDraft,
} from '../utils/sessionCache'
import { useProfileStore } from '../store/useProfileStore'

export function useOnboardingForm() {
  const navigate = useNavigate()
  const setSavedProfile = useProfileStore((s) => s.setSavedProfile)
  const setFormSnapshot = useProfileStore((s) => s.setFormSnapshot)
  const setJobs = useProfileStore((s) => s.setJobs)
  const setMarket = useProfileStore((s) => s.setMarket)
  const setPlan = useProfileStore((s) => s.setPlan)
  const setRadar = useProfileStore((s) => s.setRadar)
  const setTimeline = useProfileStore((s) => s.setTimeline)
  const setAnalysis = useProfileStore((s) => s.setAnalysis)
  const setSessionId = useProfileStore((s) => s.setSessionId)
  const savedProfile = useProfileStore((s) => s.savedProfile)
  const sessionHydrated = useProfileStore((s) => s.sessionHydrated)

  const [step, setStep] = useState(0)
  const [form, setForm] = useState(EMPTY_ONBOARDING_FORM)
  const [draftRestored, setDraftRestored] = useState(false)
  const [errors, setErrors] = useState(/** @type {Record<string, string>} */ ({}))
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const [cvParsing, setCvParsing] = useState(false)
  const [cvFileName, setCvFileName] = useState(/** @type {string | null} */ (null))
  const [cvFieldsCount, setCvFieldsCount] = useState(0)
  const [cvError, setCvError] = useState('')
  const [cvSuccessMessage, setCvSuccessMessage] = useState('')

  useEffect(() => {
    if (!sessionHydrated || draftRestored || savedProfile) return undefined

    const sessionId = getOrCreateSessionId()
    const draft = readWizardDraft(sessionId)

    const id = window.requestAnimationFrame(() => {
      if (draft) {
        setStep(draft.step)
        setForm(draft.form)
      }
      setDraftRestored(true)
    })

    return () => window.cancelAnimationFrame(id)
  }, [sessionHydrated, draftRestored, savedProfile])

  useEffect(() => {
    if (!sessionHydrated || savedProfile) return

    const sessionId = getOrCreateSessionId()
    writeWizardDraft({ sessionId, step, form })
  }, [sessionHydrated, savedProfile, step, form])

  const update = useCallback(
    (field) => (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      setErrors((prev) => ({ ...prev, [field]: '' }))
      setApiError('')
    },
    [],
  )

  const patchForm = useCallback((patch) => {
    setForm((prev) => ({ ...prev, ...patch }))
    setErrors((prev) => {
      const next = { ...prev }
      Object.keys(patch).forEach((field) => {
        next[field] = ''
      })
      return next
    })
    setApiError('')
  }, [])

  const applyCvResult = useCallback((result, fileName) => {
    const merged = mergeCvPrefillIntoForm(result.prefill || {}, result.fields_found || [])
    const location = resolveLocationFields(merged.city, merged.departamento)
    setForm((prev) => ({
      ...prev,
      ...merged,
      city: location.city,
      departamento: location.departamento,
      cv_file_name: fileName,
      cv_parsed: 'true',
    }))
    setCvFileName(fileName)
    setCvFieldsCount(result.fields_found?.length || Object.keys(merged).length)
    setCvSuccessMessage(
      result.message ||
        `Listo: detectamos ${Object.keys(merged).length} campos. Revisa y continúa.`,
    )
    setErrors({})
  }, [])

  const handleCvFile = useCallback(
    async (file, validationError) => {
      if (validationError) {
        setCvError(validationError)
        return
      }
      if (!file) return

      setCvParsing(true)
      setCvError('')
      setCvSuccessMessage('')
      setCvFileName(file.name)

      try {
        const result = await parseCvPdf(file)
        applyCvResult(result, file.name)
      } catch (err) {
        setCvFileName(null)
        setCvError(
          err instanceof Error ? err.message : 'No pudimos leer tu CV. Intenta de nuevo.',
        )
      } finally {
        setCvParsing(false)
      }
    },
    [applyCvResult],
  )

  const clearCv = useCallback(() => {
    setCvFileName(null)
    setCvFieldsCount(0)
    setCvError('')
    setCvSuccessMessage('')
    setForm((prev) => ({ ...prev, cv_file_name: '', cv_parsed: '' }))
  }, [])

  const validateCurrentStep = useCallback(() => {
    const next = validateOnboardingStep(step, form)
    setErrors(next)
    return Object.keys(next).length === 0
  }, [step, form])

  const goNext = useCallback(() => {
    if (!validateCurrentStep()) return
    setStep((s) => Math.min(s + 1, WIZARD_STEPS.length - 1))
  }, [validateCurrentStep])

  const goBack = useCallback(() => {
    setErrors({})
    if (step === 0) {
      navigate('/')
      return
    }
    setStep((s) => Math.max(s - 1, 0))
  }, [step, navigate])

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      const allErrors = validateOnboardingForm(form)
      setErrors(allErrors)
      if (Object.keys(allErrors).length > 0) return

      setLoading(true)
      setApiError('')

      try {
        const sessionId = getOrCreateSessionId()
        setSessionId(sessionId)

        const payload = buildProfilePayload(form)
        const savedProfile = await createProfile(payload)

        const { jobs, market, plan, radar, timeline, analysis } = await loadResultsBundle(
          sessionId,
          savedProfile,
        )

        setSavedProfile(savedProfile)
        setFormSnapshot(form)
        setJobs(jobs)
        setMarket(market)
        if (plan) setPlan(plan)
        if (radar) setRadar(radar)
        if (timeline) setTimeline(timeline)
        if (analysis) setAnalysis(analysis)
        clearWizardDraft()
        navigate('/resultados')
      } catch (err) {
        setApiError(err instanceof Error ? err.message : 'No pudimos procesar tu perfil.')
      } finally {
        setLoading(false)
      }
    },
    [
      form,
      setSavedProfile,
      setFormSnapshot,
      setJobs,
      setMarket,
      setPlan,
      setRadar,
      setTimeline,
      setAnalysis,
      setSessionId,
      navigate,
    ],
  )

  const progress = step === 0 ? 0 : step >= WIZARD_STEPS.length - 1 ? 90 : (step / WIZARD_STEPS.length) * 100

  return {
    step,
    form,
    errors,
    loading,
    apiError,
    progress,
    cvParsing,
    cvFileName,
    cvFieldsCount,
    cvError,
    cvSuccessMessage,
    update,
    patchForm,
    goNext,
    goBack,
    handleSubmit,
    handleCvFile,
    clearCv,
  }
}
