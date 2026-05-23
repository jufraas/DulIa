import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const jsonPath =
  process.argv[2] ||
  path.join(__dirname, '../.tmp/colombia_completa.json')
const outPath = path.join(__dirname, '../src/constants/colombiaLocations.js')

/** @type {Record<string, string>} */
const DEPARTMENT_ALIASES = {
  Bolivar: 'Bolívar',
  Choco: 'Chocó',
  'Norte De Santander': 'Norte de Santander',
  'Valle Del Cauca': 'Valle del Cauca',
  'Archipiélago De San Andrés': 'San Andrés y Providencia',
  'Archipiélago de San Andrés': 'San Andrés y Providencia',
  'Archipiélago De San Andrés, Providencia y Santa Catalina':
    'San Andrés y Providencia',
}

/** @param {string} name */
function normalizeDepartment(name) {
  return DEPARTMENT_ALIASES[name] || name
}

/** @param {string} name */
function normalizeCity(name) {
  if (name === 'Bogotá D.C.' || name === 'Bogotá') return 'Bogotá D.C.'
  return name
}

const source = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))

/** @type {Map<string, Set<string>>} */
const byDepartment = new Map()

for (const dept of source.departamentos) {
  const rawName = dept.nombre
  if (rawName === 'Bogotá D.C.') {
    const target = byDepartment.get('Cundinamarca') || new Set()
    for (const city of dept.municipios) {
      target.add(normalizeCity(city.nombre))
    }
    byDepartment.set('Cundinamarca', target)
    continue
  }

  const deptName = normalizeDepartment(rawName)
  const set = byDepartment.get(deptName) || new Set()
  for (const city of dept.municipios) {
    set.add(normalizeCity(city.nombre))
  }
  byDepartment.set(deptName, set)
}

/** @type {Record<string, string[]>} */
const data = {}
for (const [dept, cities] of [...byDepartment.entries()].sort((a, b) =>
  a[0].localeCompare(b[0], 'es'),
)) {
  data[dept] = [...cities].sort((a, b) => a.localeCompare(b, 'es'))
}

const totalCities = Object.values(data).reduce((sum, list) => sum + list.length, 0)
const deptCount = Object.keys(data).length

const file = `/**
 * Departamentos y municipios de Colombia (32 departamentos; Bogotá D.C. en Cundinamarca).
 * Fuente: codificación DIVIPOLA / DANE (colombia-cities, ~1.119 municipios).
 * Total: ${deptCount} departamentos, ${totalCities} municipios.
 */

/** @type {Record<string, string[]>} */
export const COLOMBIA_CITIES_BY_DEPARTMENT = ${JSON.stringify(data, null, 2)}

/** @type {string[]} */
export const COLOMBIA_DEPARTMENTS = Object.keys(COLOMBIA_CITIES_BY_DEPARTMENT).sort(
  (a, b) => a.localeCompare(b, 'es'),
)

/** @returns {{ value: string, label: string }[]} */
export function getDepartmentOptions() {
  return COLOMBIA_DEPARTMENTS.map((dept) => ({ value: dept, label: dept }))
}

/** @param {string | undefined} department */
export function getCityOptions(department) {
  if (!department || !COLOMBIA_CITIES_BY_DEPARTMENT[department]) return []
  return COLOMBIA_CITIES_BY_DEPARTMENT[department].map((city) => ({
    value: city,
    label: city,
  }))
}

/** @param {string} value */
function normalizeName(value) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\\p{M}/gu, '')
    .replace(/[.,]/g, '')
}

/** @param {string} cityName */
export function findDepartmentForCity(cityName) {
  if (!cityName?.trim()) return null
  const target = normalizeName(cityName)
  for (const dept of COLOMBIA_DEPARTMENTS) {
    const match = COLOMBIA_CITIES_BY_DEPARTMENT[dept].find(
      (city) => normalizeName(city) === target,
    )
    if (match) return dept
  }
  return null
}

/**
 * @param {string | undefined} cityName
 * @param {string | undefined} department
 */
export function resolveLocationFields(cityName, department) {
  const city = cityName?.trim() || ''
  let departamento = department?.trim() || ''

  if (departamento && !COLOMBIA_CITIES_BY_DEPARTMENT[departamento]) {
    departamento = ''
  }

  if (departamento && city) {
    const canonical = COLOMBIA_CITIES_BY_DEPARTMENT[departamento].find(
      (item) => normalizeName(item) === normalizeName(city),
    )
    return { city: canonical || city, departamento }
  }

  if (!departamento && city) {
    const inferredDept = findDepartmentForCity(city)
    if (inferredDept) {
      const canonical = COLOMBIA_CITIES_BY_DEPARTMENT[inferredDept].find(
        (item) => normalizeName(item) === normalizeName(city),
      )
      return { city: canonical || city, departamento: inferredDept }
    }
  }

  return { city, departamento }
}
`

fs.writeFileSync(outPath, file, 'utf8')
console.log(`Wrote ${deptCount} departments, ${totalCities} municipalities`)
