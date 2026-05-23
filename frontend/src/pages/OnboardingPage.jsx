import { useNavigate } from 'react-router-dom'
import ApiErrorBanner from '../components/onboarding/ApiErrorBanner'
import StepPersonalInfo from '../components/onboarding/StepPersonalInfo'
import StepPreferences from '../components/onboarding/StepPreferences'
import StepWorkProfile from '../components/onboarding/StepWorkProfile'
import WizardActions from '../components/onboarding/WizardActions'
import WizardHeader from '../components/onboarding/WizardHeader'
import WizardStepper from '../components/onboarding/WizardStepper'
import PageShell from '../components/layout/PageShell'
import SiteFooter from '../components/layout/SiteFooter'
import PrivacyNotice from '../components/shared/PrivacyNotice'
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
    update,
    goNext,
    goBack,
    handleSubmit,
  } = useOnboardingForm()

  return (
    <PageShell>
      <WizardHeader
        progress={progress}
        step={step + 1}
        total={WIZARD_STEPS.length}
        onCancel={() => navigate('/')}
      />

      <main className="relative z-[1] flex-1 pb-24 pt-10 sm:pt-14">
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
                <StepPersonalInfo form={form} errors={errors} update={update} />
              )}
              {step === 1 && (
                <StepWorkProfile form={form} errors={errors} update={update} />
              )}
              {step === 2 && (
                <StepPreferences form={form} errors={errors} update={update} />
              )}

              <ApiErrorBanner message={apiError} />
              <PrivacyNotice />

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
      <SiteFooter />
    </PageShell>
  )
}
