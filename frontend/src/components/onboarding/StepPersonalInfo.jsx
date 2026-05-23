import {
  AGE_RANGE_OPTIONS,
  CURRENT_SITUATION_OPTIONS,
} from '../../constants/onboardingOptions'
import Input from '../ui/Input'
import Select from '../ui/Select'

/**
 * @owner migue
 * @param {{
 *   form: import('../../store/useProfileStore').OnboardingFormState,
 *   errors: Record<string, string>,
 *   update: (field: string) => (e: import('react').ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void,
 * }} props
 */
export default function StepPersonalInfo({ form, errors, update }) {
  return (
    <>
      <Input
        label="Nombre"
        name="name"
        placeholder="Ej. María González"
        value={form.name}
        onChange={update('name')}
        error={errors.name}
        autoComplete="name"
      />
      <Input
        label="Ciudad"
        name="city"
        placeholder="Ej. Barranquilla"
        value={form.city}
        onChange={update('city')}
        error={errors.city}
        autoComplete="address-level2"
      />
      <Select
        label="Rango de edad"
        name="age_range"
        value={form.age_range}
        onChange={update('age_range')}
        error={errors.age_range}
        options={AGE_RANGE_OPTIONS}
      />
      <Select
        label="Situación actual"
        name="current_situation"
        value={form.current_situation}
        onChange={update('current_situation')}
        error={errors.current_situation}
        options={CURRENT_SITUATION_OPTIONS}
      />
    </>
  )
}
