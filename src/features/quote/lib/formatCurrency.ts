const currencyFormat = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

const dateFormat = new Intl.DateTimeFormat('es-CO', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

export function formatCurrency(value: number): string {
  return currencyFormat.format(Math.round(value))
}

export function formatDate(isoDate: string): string {
  if (!isoDate) return ''
  const [y, m, d] = isoDate.split('-').map(Number)
  return dateFormat.format(new Date(y, m - 1, d))
}

export function calcularVencimiento(fechaEmision: string, validezDias: number): string {
  if (!fechaEmision) return ''
  const [y, m, d] = fechaEmision.split('-').map(Number)
  const fecha = new Date(y, m - 1, d)
  fecha.setDate(fecha.getDate() + validezDias)
  const yy = fecha.getFullYear()
  const mm = String(fecha.getMonth() + 1).padStart(2, '0')
  const dd = String(fecha.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}
