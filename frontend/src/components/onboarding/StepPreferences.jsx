import {
  AVAILABILITY_OPTIONS,
  OPPORTUNITY_TYPE_OPTIONS,
  WORK_MODE_OPTIONS,
} from '../../constants/onboardingOptions'
import Input from '../ui/Input'
import Select from '../ui/Select'
import TextArea from '../ui/TextArea'

/**
 * @owner migue
 * @param {{
 *   form: import('../../store/useProfileStore').OnboardingFormState,
 *   errors: Record<string, string>,
 *   update: (field: string) => (e: import('react').ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void,
 * }} props
 */
export default function StepPreferences({ form, errors, update }) {
  return (
    <>
      <TextArea
        label="Intereses laborales"
        name="interests"
        placeholder="Ej. Marketing digital, contenido para redes, ventas..."
        value={form.interests}
        onChange={update('interests')}
        error={errors.interests}
      />
      <Select
        label="Modalidad de trabajo"
        name="work_mode"
        value={form.work_mode}
        onChange={update('work_mode')}
        error={errors.work_mode}
        options={WORK_MODE_OPTIONS}
      />
      <Select
        label="Tipo de oportunidad"
        name="opportunity_type"
        value={form.opportunity_type}
        onChange={update('opportunity_type')}
        error={errors.opportunity_type}
        options={OPPORTUNITY_TYPE_OPTIONS}
      />
      <Select
        label="Disponibilidad"
        name="availability"
        value={form.availability}
        onChange={update('availability')}
        error={errors.availability}
        options={AVAILABILITY_OPTIONS}
      />
      <TextArea
        label="Herramientas que manejas (opcional)"
        name="tools"
        placeholder="Ej. Canva, CapCut, Figma, Excel..."
        value={form.tools}
        onChange={update('tools')}
      />
      <Input
        label="LinkedIn o portafolio (opcional)"
        name="portfolio_url"
        type="url"
        placeholder="https://linkedin.com/in/tu-perfil"
        value={form.portfolio_url}
        onChange={update('portfolio_url')}
      />
    </>
  )
}
