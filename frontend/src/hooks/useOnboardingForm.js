import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EMPTY_ONBOARDING_FORM } from '../constants/emptyForm'
import { WIZARD_STEPS } from '../constants/onboardingOptions'
import { buildProfilePayload } from '../utils/buildProfilePayload'
import { validateCvFile } from '../utils/validateCvFile'
import { validateOnboardingStep } from '../utils/validateOnboardingStep'
import { submitProfileWithCv } from '../services/submitProfileWithCv'
import { useProfileStore } from '../store/useProfileStore'

/**
 * @owner migue
 * Estado, validación y navegación del wizard de onboarding.
 */
export function useOnboardingForm() {
  const navigate = useNavigate()
  const setProfile = useProfileStore((s) => s.setProfile)
  const setResult = useProfileStore((s) => s.setResult)
  const setCvFile = useProfileStore((s) => s.setCvFileName)

  const [step, setStep] = useState(0)
  const [form, setForm] = useState(EMPTY_ONBOARDING_FORM)
  const [cvFile, setLocalCvFile] = useState(/** @type {File | null} */ (null))
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

  const setCv = useCallback((file) => {
    if (!file) {
      setLocalCvFile(null)
      setErrors((prev) => ({ ...prev, cv: '' }))
      setApiError('')
      return
    }
    const cvError = validateCvFile(file)
    if (cvError) {
      setLocalCvFile(null)
      setErrors((prev) => ({ ...prev, cv: cvError }))
      return
    }
    setLocalCvFile(file)
    setErrors((prev) => ({ ...prev, cv: '' }))
    setApiError('')
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
      if (!validateCurrentStep()) return

      setLoading(true)
      setApiError('')

      try {
        const payload = buildProfilePayload(form)
        const result = await submitProfileWithCv(payload, cvFile)
        setProfile(payload)
        setCvFile(cvFile?.name ?? null)
        setResult(result)
        navigate('/resultados')
      } catch {
        setApiError('No pudimos procesar tu perfil. Intenta de nuevo.')
      } finally {
        setLoading(false)
      }
    },
    [
      validateCurrentStep,
      form,
      cvFile,
      setProfile,
      setCvFile,
      setResult,
      navigate,
    ],
  )

  const progress = ((step + 1) / WIZARD_STEPS.length) * 100

  return {
    step,
    form,
    cvFile,
    errors,
    loading,
    apiError,
    progress,
    update,
    setCv,
    goNext,
    goBack,
    handleSubmit,
  }
}
