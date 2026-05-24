import { useNavigate } from 'react-router-dom'
import ApiErrorBanner from '../components/onboarding/ApiErrorBanner'
import CvUploadZone from '../components/onboarding/CvUploadZone'
import StepPersonalInfo from '../components/onboarding/StepPersonalInfo'
import StepPreferences from '../components/onboarding/StepPreferences'
import StepWorkProfile from '../components/onboarding/StepWorkProfile'
import WizardActions from '../components/onboarding/WizardActions'
import WizardHeader from '../components/onboarding/WizardHeader'
import WizardStepper from '../components/onboarding/WizardStepper'
import PageShell from '../components/layout/PageShell'
import PrivacyNotice from '../components/shared/PrivacyNotice'
import CoachAskLink from '../components/results/CoachAskLink'
import ProcessStatusBar from '../components/shared/ProcessStatusBar'
import Container from '../components/ui/Container'
import { WIZARD_STEPS } from '../constants/onboardingOptions'
import { useOnboardingForm } from '../hooks/useOnboardingForm'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const {
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
  } = useOnboardingForm()

  const processActive = cvParsing || loading
  const processTitle = cvParsing ? 'Leyendo tu CV' : 'Analizando tu perfil'
  const processMessage = cvParsing
    ? 'Extrayendo datos con IA. No cierres esta pestaña — puede tardar hasta un minuto.'
    : 'Guardando tu perfil y preparando oportunidades, plan y análisis…'

  return (
    <PageShell>
      <WizardHeader
        progress={progress}
        step={step + 1}
        total={WIZARD_STEPS.length}
        onCancel={() => navigate('/')}
      />

      <main
        className={`relative z-[1] flex-1 pt-10 sm:pt-14 ${processActive ? 'pb-36' : 'pb-24'}`}
      >
        <Container className="max-w-[760px]">
          <WizardStepper step={step} />

          <div key={step} className="anim-in mt-10">
            <p className="eyebrow-dl mb-3 md:hidden">
              Paso {step + 1} de {WIZARD_STEPS.length} · {Math.round(progress)}%
            </p>
            <h1 className="h2 m-0">{WIZARD_STEPS[step].title}</h1>
            <p className="body mt-2">{WIZARD_STEPS[step].subtitle}</p>

            <form
              onSubmit={handleSubmit}
              className="card-dl mt-8 flex flex-col gap-5"
              style={{ padding: 28 }}
              noValidate
            >
              {step === 0 && (
                <>
                  <CvUploadZone
                    onFileSelect={handleCvFile}
                    parsing={cvParsing}
                    fileName={cvFileName}
                    fieldsCount={cvFieldsCount}
                    error={cvError}
                    onClear={clearCv}
                  />
                  {cvSuccessMessage && !cvError && (
                    <p
                      className="rounded-[14px] px-4 py-3 text-sm"
                      style={{
                        border: '1px solid rgba(52,211,153,0.35)',
                        background: 'rgba(52,211,153,0.08)',
                        color: 'var(--success, #34d399)',
                      }}
                    >
                      {cvSuccessMessage}
                    </p>
                  )}
                  <StepPersonalInfo
                    form={form}
                    errors={errors}
                    update={update}
                    patchForm={patchForm}
                  />
                </>
              )}
              {step === 1 && (
                <>
                  {form.cv_parsed === 'true' && (
                    <p className="text-sm text-[color:var(--fg-3)]">
                      Campos sugeridos desde tu CV — confirma o edita lo que necesites.
                    </p>
                  )}
                  <StepWorkProfile
                    form={form}
                    errors={errors}
                    update={update}
                    patchForm={patchForm}
                  />
                </>
              )}
              {step === 2 && (
                <>
                  {form.cv_parsed === 'true' && (
                    <p className="text-sm text-[color:var(--fg-3)]">
                      Preferencias iniciales desde tu CV — ajusta salario o modalidad si quieres.
                    </p>
                  )}
                  <StepPreferences
                    form={form}
                    errors={errors}
                    update={update}
                    patchForm={patchForm}
                  />
                </>
              )}

              <ApiErrorBanner message={apiError} />
              <PrivacyNotice />
              <p className="text-center text-[13px] text-[color:var(--fg-3)] sm:text-left">
                <CoachAskLink
                  question="Ayúdame a completar este paso del wizard"
                  label="¿Te trabas en algún campo? Pregúntale al coach"
                />
              </p>

              <WizardActions
                step={step}
                loading={loading}
                onBack={goBack}
                onNext={goNext}
              />
            </form>
          </div>
        </Container>
      </main>

      {processActive && (
        <ProcessStatusBar title={processTitle} message={processMessage} />
      )}
    </PageShell>
  )
}
