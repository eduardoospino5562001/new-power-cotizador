export const formatCurrency = (n: number): string =>
  '$ ' + Math.round(n).toLocaleString('es-CO')

export const formatDate = (date: string): string => {
  if (!date) return ''
  const d = new Date(date + 'T12:00:00')
  return d.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
