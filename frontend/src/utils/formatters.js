/** @param {number | undefined} min @param {number | undefined} max */
export function formatSalary(min, max) {
  const fmt = (n) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(n)

  if (min && max) return `${fmt(min)} – ${fmt(max)}`
  if (min) return `Desde ${fmt(min)}`
  if (max) return `Hasta ${fmt(max)}`
  return 'Salario a convenir'
}

/** @param {number | null | undefined} value */
export function formatPercent(value) {
  if (value == null) return '—'
  return `${value > 0 ? '+' : ''}${value}%`
}
