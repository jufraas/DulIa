import {
  AGE_RANGE_OPTIONS,
  CURRENT_SITUATION_OPTIONS,
} from '../../constants/onboardingOptions'
import Input from '../ui/Input'
import Select from '../ui/Select'

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
      <Input
        label="Departamento (opcional)"
        name="departamento"
        placeholder="Ej. Atlántico"
        value={form.departamento}
        onChange={update('departamento')}
        error={errors.departamento}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Edad"
          name="edad"
          type="number"
          min={16}
          max={99}
          placeholder="Ej. 22"
          value={form.edad}
          onChange={update('edad')}
          error={errors.edad}
        />
        <Select
          label="O rango de edad"
          name="age_range"
          value={form.age_range}
          onChange={update('age_range')}
          error={errors.age_range}
          options={AGE_RANGE_OPTIONS}
        />
      </div>
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
