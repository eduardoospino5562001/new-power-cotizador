export const formatCurrency = (n: number): string =>
  '$ ' + Math.round(n).toLocaleString('es-CO')

export const formatCurrencyInput = (value: string): string => {
  const digits = value.replace(/[^\d]/g, '')
  if (!digits) return ''
  const num = parseInt(digits, 10)
  return num.toLocaleString('es-CO')
}

export const parseCurrencyInput = (formatted: string): number => {
  const digits = formatted.replace(/[^\d]/g, '')
  return digits ? parseInt(digits, 10) : 0
}

export const formatDate = (date: string): string => {
  if (!date) return ''
  const d = new Date(date + 'T12:00:00')
  return d.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
