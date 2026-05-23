import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react'
import { WIZARD_STEPS } from '../../constants/onboardingOptions'
import Button from '../ui/Button'

/**
 * @owner migue
 * @param {{
 *   step: number,
 *   loading: boolean,
 *   onBack: () => void,
 *   onNext: () => void,
 * }} props
 */
export default function WizardActions({ step, loading, onBack, onNext }) {
  const isLast = step >= WIZARD_STEPS.length - 1

  return (
    <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row">
      <Button
        type="button"
        variant="secondary"
        onClick={onBack}
        iconLeft={<ArrowLeft className="h-4 w-4" aria-hidden />}
        className="sm:w-auto"
      >
        {step === 0 ? 'Volver al inicio' : 'Atrás'}
      </Button>
      {isLast ? (
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          iconRight={<Sparkles className="h-5 w-5" aria-hidden />}
          className="sm:ml-auto"
        >
          Analizar mi perfil
        </Button>
      ) : (
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={onNext}
          iconRight={<ArrowRight className="h-5 w-5" aria-hidden />}
          className="sm:ml-auto"
        >
          Siguiente
        </Button>
      )}
    </div>
  )
}
