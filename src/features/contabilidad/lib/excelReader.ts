import * as XLSX from 'xlsx'
import type { ProjectInfo, SourceRow, ScanResult } from '../types'
import { normalizeText, parseCurrency, parseInstallment, parseReceiptConsecutive } from './excelUtils'

const COL_LOTE = 0
const COL_FECHA = 5
const COL_MEDIO = 6
const COL_MONTO = 7
const COL_COMPRADOR = 9
const COL_ETIQUETA = 10
const COL_PROYECTO = 14

const RECEIPT_HEADERS = new Set([
  'NUMERO DE RECIBO',
  'NUMERO RECIBO',
  'NO DE RECIBO',
  'N DE RECIBO',
])

function cellValue(ws: XLSX.WorkSheet, row: number, col: number): unknown {
  const ref = XLSX.utils.encode_cell({ r: row, c: col })
  const cell = ws[ref]
  return cell ? cell.v : undefined
}

function normalizeHeader(value: unknown): string {
  return normalizeText(value === null || value === undefined ? '' : String(value))
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim()
}

function findReceiptColumn(ws: XLSX.WorkSheet): number {
  const ref = ws['!ref']
  if (!ref) throw new Error('El archivo origen no tiene datos.')

  const maxColumn = XLSX.utils.decode_range(ref).e.c
  for (let col = 0; col <= maxColumn; col++) {
    if (RECEIPT_HEADERS.has(normalizeHeader(cellValue(ws, 0, col)))) return col
  }

  throw new Error("No se encontro la columna 'Numero de recibo' en el archivo origen.")
}

export function scanProjects(ws: XLSX.WorkSheet, maxRow: number): Record<string, ProjectInfo> {
  const projects: Record<string, ProjectInfo> = {}
  for (let r = 1; r < maxRow; r++) {
    const project = cellValue(ws, r, COL_PROYECTO)
    if (project === undefined || project === null || project === '') continue
    const key = String(project)
    if (!projects[key]) projects[key] = { total: 0, missingAmount: 0 }
    projects[key].total++
    if (parseCurrency(cellValue(ws, r, COL_MONTO)) === null) {
      projects[key].missingAmount++
    }
  }
  return projects
}

export function scanDocumentDates(ws: XLSX.WorkSheet, maxRow: number): { years: number[]; months: number[] } {
  const yearsSet = new Set<number>()
  const monthsSet = new Set<number>()
  for (let r = 1; r < maxRow; r++) {
    const dateValue = cellValue(ws, r, COL_FECHA)
    if (dateValue instanceof Date) {
      yearsSet.add(dateValue.getFullYear())
      monthsSet.add(dateValue.getMonth() + 1)
    }
  }
  return {
    years: [...yearsSet].sort((a, b) => a - b),
    months: [...monthsSet].sort((a, b) => a - b),
  }
}

export function scanWorkbook(file: File): Promise<ScanResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer)
        const wb = XLSX.read(data, { type: 'array', cellDates: true })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const ref = ws['!ref']
        if (!ref) throw new Error('La hoja esta vacia.')
        const maxRow = XLSX.utils.decode_range(ref).e.r + 1
        const projects = scanProjects(ws, maxRow)
        const { years, months } = scanDocumentDates(ws, maxRow)
        if (Object.keys(projects).length === 0) throw new Error('No se encontraron proyectos en el archivo seleccionado.')
        if (years.length === 0) throw new Error('No se encontraron fechas validas en la columna Fecha.')
        resolve({ projects, years, months })
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('Error al leer el archivo.'))
    reader.readAsArrayBuffer(file)
  })
}

export function collectSourceRows(
  ws: XLSX.WorkSheet,
  maxRow: number,
  selectedProject: string,
  selectedYear: number,
  selectedMonth: number
): { rows: SourceRow[]; skippedMissingAmount: number } {
  const rows: SourceRow[] = []
  let skippedMissingAmount = 0
  const receiptColumn = findReceiptColumn(ws)

  for (let r = 1; r < maxRow; r++) {
    const values: unknown[] = []
    for (let c = 0; c < 15; c++) values.push(cellValue(ws, r, c))

    if (values.every((v) => v === undefined || v === null || v === '')) continue

    const project = values[COL_PROYECTO]
    if (String(project) !== selectedProject) continue

    const dateValue = values[COL_FECHA]
    if (!(dateValue instanceof Date)) throw new Error(`Fila ${r + 1}: la fecha no es valida.`)
    if (dateValue.getFullYear() !== selectedYear || dateValue.getMonth() + 1 !== selectedMonth) continue

    const lot = values[COL_LOTE]
    const amount = parseCurrency(values[COL_MONTO])

    if (lot === undefined || lot === null || lot === '') throw new Error(`Fila ${r + 1}: falta Lote1.`)
    if (values[COL_FECHA] === undefined || values[COL_FECHA] === null || values[COL_FECHA] === '') throw new Error(`Fila ${r + 1}: falta Fecha.`)
    if (values[COL_MEDIO] === undefined || values[COL_MEDIO] === null || values[COL_MEDIO] === '') throw new Error(`Fila ${r + 1}: falta Medio de pago.`)
    if (amount === null) {
      skippedMissingAmount++
      continue
    }
    if (values[COL_COMPRADOR] === undefined || values[COL_COMPRADOR] === null || values[COL_COMPRADOR] === '') throw new Error(`Fila ${r + 1}: falta Comprador.`)

    const receipt = parseReceiptConsecutive(cellValue(ws, r, receiptColumn))
    if (receipt === null) {
      throw new Error(`Fila ${r + 1}: el Numero de recibo debe ser un entero de maximo 11 digitos.`)
    }

    rows.push({
      lot: String(lot).trim(),
      date: dateValue,
      medium: String(values[COL_MEDIO]),
      amount,
      label: values[COL_ETIQUETA] !== undefined && values[COL_ETIQUETA] !== null ? String(values[COL_ETIQUETA]).trim() : '',
      receipt,
      thirdId: values[3] !== undefined && values[3] !== null ? values[3] as string | number : null,
      installment: parseInstallment(values[COL_ETIQUETA]),
    })
  }

  return { rows, skippedMissingAmount }
}
