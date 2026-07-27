const dateFormat = new Intl.DateTimeFormat('es-CO', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

export function formatDate(isoDate: string): string {
  if (!isoDate) return ''
  const [y, m, d] = isoDate.split('-').map(Number)
  return dateFormat.format(new Date(y, m - 1, d))
}
