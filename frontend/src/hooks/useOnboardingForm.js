import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createProfile, getMarketDashboard, getRecommendedJobs } from '../services/api'
import { EMPTY_ONBOARDING_FORM } from '../constants/emptyForm'
import { WIZARD_STEPS } from '../constants/onboardingOptions'
import { buildProfilePayload } from '../utils/buildProfilePayload'
import { validateOnboardingStep } from '../utils/validateOnboardingStep'
import { getOrCreateSessionId } from '../utils/session'
import { useProfileStore } from '../store/useProfileStore'

export function useOnboardingForm() {
  const navigate = useNavigate()
  const setSavedProfile = useProfileStore((s) => s.setSavedProfile)
  const setFormSnapshot = useProfileStore((s) => s.setFormSnapshot)
  const setJobs = useProfileStore((s) => s.setJobs)
  const setMarket = useProfileStore((s) => s.setMarket)
  const setSessionId = useProfileStore((s) => s.setSessionId)

  const [step, setStep] = useState(0)
  const [form, setForm] = useState(EMPTY_ONBOARDING_FORM)
  const [errors, setErrors] = useState(/** @type {Record<string, string>} */ ({}))
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const update = useCallback(
    (field) => (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      setErrors((prev) => ({ ...prev, [field]: '' }))
      setApiError('')
    },
    [],
  )

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
      if (!validateCurrentStep()) return

      setLoading(true)
      setApiError('')

      try {
        const sessionId = getOrCreateSessionId()
        setSessionId(sessionId)

        const payload = buildProfilePayload(form)
        const savedProfile = await createProfile(payload)

        const [jobs, market] = await Promise.all([
          getRecommendedJobs(sessionId),
          getMarketDashboard({ city: savedProfile.ciudad || form.city.trim() }),
        ])

        setSavedProfile(savedProfile)
        setFormSnapshot(form)
        setJobs(jobs)
        setMarket(market)
        navigate('/resultados')
      } catch (err) {
        setApiError(err instanceof Error ? err.message : 'No pudimos procesar tu perfil.')
      } finally {
        setLoading(false)
      }
    },
    [
      validateCurrentStep,
      form,
      setSavedProfile,
      setFormSnapshot,
      setJobs,
      setMarket,
      setSessionId,
      navigate,
    ],
  )

  const progress = ((step + 1) / WIZARD_STEPS.length) * 100

  return {
    step,
    form,
    errors,
    loading,
    apiError,
    progress,
    update,
    goNext,
    goBack,
    handleSubmit,
  }
}
