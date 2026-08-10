import type { AccountMap } from '../types'

export const ACCOUNT_CODE_OPTIONS: Record<string, number> = {
  EFECTIVO: 11050501,
  BANCOLOMBIA: 11100504,
  DAVIVIENDA: 11100505,
}

export const SOURCE_MEDIUM_KEYS: [string, string][] = [
  ['DAVIVIENDA', 'DAVIVIENDA'],
  ['BANCOLOMBIA', 'BANCOLOMBIA'],
  ['EFECTIVO', 'EFECTIVO'],
  ['CAJA', 'CAJA'],
  ['BONIFICACION', 'BONIFICACION'],
  ['CTA ARQ', 'CTA ARQ'],
  ['CTA KATHE', 'CTA KATHE'],
]

export const ACCOUNT = {
  DEBIT_DEFAULT: 556,
  CREDIT_FUND: 28050501,
  CURRENCY_CODE: 'COP',
  DOC_TYPE: 'RCBO',
}

export function normalizeText(value: string | null | undefined): string {
  return (value ?? '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function parseCurrency(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'number') return Math.round(value)
  const text = String(value).trim()
  const digits = text.replace(/[^0-9-]/g, '')
  if (!digits || digits === '-') return null
  return parseInt(digits, 10)
}

export function parseInstallment(label: unknown): number | null {
  if (typeof label !== 'string') return null
  const text = label.trim().toLowerCase()
  if (!text) return null
  if (['inicial', 'separacion', 'contado', 'abono', 'abono contado'].includes(text)) return 0
  const match = text.match(/^cuota\s*(\d+)/)
  if (!match) return null
  return parseInt(match[1], 10)
}

export function parseReceiptConsecutive(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null

  if (typeof value === 'number') {
    if (!Number.isSafeInteger(value) || value < 0 || String(value).length > 11) return null
    return value
  }

  const text = String(value).trim()
  if (!/^\d{1,11}$/.test(text)) return null

  const parsed = Number(text)
  return Number.isSafeInteger(parsed) ? parsed : null
}

export function debitAccountForMedium(medium: string, accountMap?: AccountMap): number {
  const mediumText = normalizeText(medium)
  const map = accountMap ?? ACCOUNT_CODE_OPTIONS

  for (const [sourceKey, groupKey] of SOURCE_MEDIUM_KEYS) {
    if (mediumText.includes(sourceKey)) {
      const mappedKey = groupKey.replace(' ', '_') as keyof AccountMap
      if (!(mappedKey in map)) throw new Error('Selecciona una cuenta contable valida.')
      return map[mappedKey]
    }
  }

  return map.EFECTIVO
}
