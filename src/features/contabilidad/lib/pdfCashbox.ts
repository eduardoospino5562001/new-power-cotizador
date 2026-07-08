import type { CashboxRecord } from '../types'
import * as XLSX from 'xlsx'
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

interface PdfWord {
  x: number
  y: number
  width: number
  height: number
  text: string
}

const FORM_EXPANSIONS: Record<string, string> = {
  'A ARQ BANCOLOMB': 'CTA ARQ BANCOLOMBIA',
  'AVIVIENDA P.N KAT': 'DAVIVIENDA P.N KATHE',
  'COLOMBIA HORIZO': 'BANCOLOMBIA HORIZONTES',
  'KATHE BANCOLOM': 'CTA KATHE BANCOLOMBIA',
  'OLOMBIA MONUM': 'BANCOLOMBIA MONUMENTAL',
  'VIENDA MONUMEN': 'DAVIVIENDA MONUMENTAL',
  'VIVIENDA DURAN P': 'DAVIVIENDA DURAN P.N',
  'VIVIENDA RANCHO': 'DAVIVIENDA RANCHO P.J',
}

const EXPORT_HEADERS = [
  'Número de registro',
  'Consecutivo',
  'Lote',
  'Forma de pago',
  'Concepto de pago',
  'Valor',
  'Asesor o responsable',
]

function cleanText(value: string): string {
  return value.replace(/\s+/g, ' ').replace(/\xa0/g, ' ').trim()
}

function normalizeText(value: string): string {
  return cleanText(value)
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function parseAmountText(value: string): number | null {
  const text = cleanText(value)
  const match = text.match(/\$?\s*(-?\d{1,3}(?:[.,]\d{3})*|-?\d+)/)
  if (!match) return null
  const digits = match[1].replace(/[^0-9-]/g, '')
  if (!digits || digits === '-') return null
  return parseInt(digits, 10)
}

function isExportableConcept(concept: string): boolean {
  const text = normalizeText(concept)
  if (text === 'INICIAL' || text === 'ABONO') return true
  return /^(CUOTA|COUTA)\s*\d+/i.test(text)
}

function formatExportConcept(concept: string): string {
  const text = normalizeText(concept)
  if (text === 'INICIAL') return 'Inicial'
  if (text === 'ABONO') return 'Abono'
  const match = text.match(/^(CUOTA|COUTA)\s*(\d+)/)
  if (match) return `Cuota ${parseInt(match[2], 10)}`
  return cleanText(concept)
}

function groupWordsByRow(words: PdfWord[], tolerance = 3.2): PdfWord[][] {
  const sorted = [...words].sort((a, b) => {
    const ay = (a.y + a.height) / 2
    const by = (b.y + b.height) / 2
    if (Math.abs(ay - by) > 0.1) return ay - by
    return a.x - b.x
  })

  const rows: PdfWord[][] = []
  for (const word of sorted) {
    const centerY = (word.y + word.height) / 2
    if (rows.length === 0 || Math.abs(rows[rows.length - 1][0].y + rows[rows.length - 1][0].height / 2 - centerY) > tolerance) {
      rows.push([word])
    } else {
      rows[rows.length - 1].push(word)
    }
  }
  return rows
}

function parseRow(words: PdfWord[]): CashboxRecord | null {
  const cells: Record<string, string[]> = {
    recordNumber: [],
    consecutive: [],
    lot: [],
    paymentMethod: [],
    paymentConcept: [],
    amount: [],
    advisor: [],
  }

  const sorted = [...words].sort((a, b) => a.x - b.x)

  for (const word of sorted) {
    const x0 = word.x
    const text = cleanText(word.text)
    const normalized = normalizeText(text)

    if (x0 < 58) {
      cells.recordNumber.push(text)
    } else if (x0 < 105) {
      cells.consecutive.push(text)
    } else if (x0 < 170) {
      cells.lot.push(text)
    } else if (x0 < 270) {
      if (normalized === 'MAS') {
        cells.lot.push(text)
      } else {
        cells.paymentMethod.push(text)
      }
    } else if (x0 < 350) {
      cells.paymentConcept.push(text)
    } else if (x0 < 430) {
      cells.amount.push(text)
    } else if (x0 >= 500) {
      cells.advisor.push(text)
    }
  }

  const parsedRecordNumber = cells.recordNumber.join(' ').trim()
  const parsedConsecutive = cells.consecutive.join(' ').trim()
  const parsedAmount = cells.amount.join(' ').trim()
  const parsedPaymentMethod = cells.paymentMethod.join(' ').trim()
  const parsedPaymentConcept = cells.paymentConcept.join(' ').trim()

  if (!/^\d+$/.test(parsedRecordNumber) || !/^\d+$/.test(parsedConsecutive)) return null

  const amount = parseAmountText(parsedAmount)
  if (amount === null) return null

  const expandedMethod = FORM_EXPANSIONS[normalizeText(parsedPaymentMethod)] ?? parsedPaymentMethod

  return {
    recordNumber: parseInt(parsedRecordNumber, 10),
    consecutive: parseInt(parsedConsecutive, 10),
    lot: cells.lot.join(' ').trim(),
    paymentMethod: expandedMethod,
    paymentConcept: parsedPaymentConcept,
    amount,
    advisor: cells.advisor.join(' ').trim(),
  }
}

async function extractCashboxRecords(pdfFile: File, includeOnlyExportable = true): Promise<CashboxRecord[]> {
  const arrayBuffer = await pdfFile.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const records: CashboxRecord[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()

    const words: PdfWord[] = textContent.items
      .filter((item: unknown) => {
        const it = item as { str?: string; transform?: number[]; width?: number }
        return !!(it.transform && it.str?.trim())
      })
      .map((item: unknown) => {
        const it = item as { str: string; transform: number[]; width?: number }
        return {
          x: it.transform[4],
          y: it.transform[5],
          width: it.width ?? 0,
          height: 0,
          text: it.str,
        }
      })

    const rows = groupWordsByRow(words)
    for (const rowWords of rows) {
      const record = parseRow(rowWords)
      if (record === null) continue
      if (includeOnlyExportable && !isExportableConcept(record.paymentConcept)) continue
      records.push(record)
    }
  }

  return records
}

export async function exportCashboxPdfToExcel(
  pdfFile: File
): Promise<{ output: ArrayBuffer; exportedCount: number; totalCount: number }> {
  const allRecords = await extractCashboxRecords(pdfFile, false)
  const exportableRecords = allRecords.filter((r) => isExportableConcept(r.paymentConcept))

  if (exportableRecords.length === 0) {
    throw new Error('No se encontraron registros de Inicial, Abono o Cuotas en el PDF.')
  }

  const wb = XLSX.utils.book_new()
  const data = [EXPORT_HEADERS]

  for (const record of exportableRecords) {
    data.push([
      String(record.recordNumber),
      String(record.consecutive),
      record.lot,
      record.paymentMethod,
      formatExportConcept(record.paymentConcept),
      String(record.amount),
      record.advisor,
    ])
  }

  const ws = XLSX.utils.aoa_to_sheet(data)

  const colWidths = [20, 14, 18, 26, 20, 16, 24]
  ws['!cols'] = colWidths.map((w) => ({ wch: w }))

  XLSX.utils.book_append_sheet(wb, ws, 'Datos')

  const output = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })

  return {
    output: output as ArrayBuffer,
    exportedCount: exportableRecords.length,
    totalCount: allRecords.length,
  }
}
