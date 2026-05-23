import {
  AGE_RANGE_OPTIONS,
  CURRENT_SITUATION_OPTIONS,
} from '../../constants/onboardingOptions'
import {
  getCityOptions,
  getDepartmentOptions,
} from '../../constants/colombiaLocations'
import Input from '../ui/Input'
import Select from '../ui/Select'

export default function StepPersonalInfo({ form, errors, update, patchForm }) {
  const cityOptions = getCityOptions(form.departamento)
  const departmentSelected = Boolean(form.departamento)

  const handleDepartmentChange = (e) => {
    const departamento = e.target.value
    const cities = getCityOptions(departamento).map((opt) => opt.value)
    const keepCity = cities.includes(form.city)

    patchForm({
      departamento,
      city: keepCity ? form.city : '',
    })
  }

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
      <Select
        label="Departamento"
        name="departamento"
        value={form.departamento}
        onChange={handleDepartmentChange}
        error={errors.departamento}
        options={getDepartmentOptions()}
        placeholder="Selecciona tu departamento"
      />
      <Select
        label="Ciudad"
        name="city"
        value={form.city}
        onChange={update('city')}
        error={errors.city}
        options={cityOptions}
        placeholder={
          departmentSelected
            ? 'Selecciona tu ciudad'
            : 'Primero elige un departamento'
        }
        disabled={!departmentSelected}
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
