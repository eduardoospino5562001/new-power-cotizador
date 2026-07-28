import * as XLSX from 'xlsx'
import type { AccountMap, SourceRow } from '../types'
import { ACCOUNT, debitAccountForMedium } from './excelUtils'
import { collectSourceRows } from './excelReader'

export async function exportWorkbook(
  templateFile: File,
  sourceFile: File,
  startConsecutive: number,
  selectedProject: string,
  year: number,
  month: number,
  accountMap: AccountMap
): Promise<{ output: ArrayBuffer; skippedMissingAmount: number; rows: SourceRow[] }> {
  const [templateBuf, sourceBuf] = await Promise.all([
    templateFile.arrayBuffer(),
    sourceFile.arrayBuffer(),
  ])

  const templateWb = XLSX.read(templateBuf, { type: 'array', cellDates: true, cellStyles: true })
  const sourceWb = XLSX.read(sourceBuf, { type: 'array', cellDates: true })

  const sourceWs = sourceWb.Sheets[sourceWb.SheetNames[0]]
  const sourceRef = sourceWs['!ref']
  if (!sourceRef) throw new Error('El archivo origen no tiene datos.')
  const sourceMaxRow = XLSX.utils.decode_range(sourceRef).e.r + 1

  const { rows, skippedMissingAmount } = collectSourceRows(sourceWs, sourceMaxRow, selectedProject, year, month)

  if (rows.length === 0) {
    throw new Error(`El proyecto '${selectedProject}' no tiene filas con monto para exportar en ese mes.`)
  }

  const mainWsName = 'Datos'
  const helperWsName = 'Hoja1'

  let mainWs = templateWb.Sheets[mainWsName]
  let helperWs = templateWb.Sheets[helperWsName]

  if (!mainWs) {
    mainWs = XLSX.utils.aoa_to_sheet([[]])
    templateWb.SheetNames.push(mainWsName)
    templateWb.Sheets[mainWsName] = mainWs
  }
  if (!helperWs) {
    helperWs = XLSX.utils.aoa_to_sheet([[]])
    templateWb.SheetNames.push(helperWsName)
    templateWb.Sheets[helperWsName] = helperWs
  }

  const requiredRows = rows.length * 2 + 1
  const mainRange = XLSX.utils.decode_range(mainWs['!ref'] ?? 'A1:AA1')
  const helperRange = XLSX.utils.decode_range(helperWs['!ref'] ?? 'A1:C1')

  const currentMainEnd = mainRange.e.r + 1
  if (currentMainEnd < requiredRows) {
    const newRange = XLSX.utils.decode_range(`A1:AA${requiredRows}`)
    mainWs['!ref'] = XLSX.utils.encode_range(newRange)
  }

  const currentHelperEnd = helperRange.e.r + 1
  if (currentHelperEnd < rows.length) {
    const newHelperRange = XLSX.utils.decode_range(`A1:C${rows.length}`)
    helperWs['!ref'] = XLSX.utils.encode_range(newHelperRange)
  }

  for (let r = 1; r < requiredRows; r++) {
    for (let c = 0; c < 27; c++) {
      const ref = XLSX.utils.encode_cell({ r, c })
      delete mainWs[ref]
    }
  }
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < 3; c++) {
      const ref = XLSX.utils.encode_cell({ r, c })
      delete helperWs[ref]
    }
  }

  function dateToExcelSerial(date: Date): number {
    const utcDays = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000
    return utcDays + 25569
  }

  const makeCell = (value: unknown): XLSX.CellObject => {
    if (value instanceof Date) return { t: 'n', v: dateToExcelSerial(value) }
    if (value === null || value === undefined) return { t: 's', v: '' }
    if (typeof value === 'number') return { t: 'n', v: value }
    return { t: 's', v: String(value) }
  }

  const makeCellWithFormat = (value: unknown, numberFormat: string): XLSX.CellObject => {
    const cell = makeCell(value)
    cell.z = numberFormat
    return cell
  }

  const makeNumeric = (value: string | null | undefined): XLSX.CellObject => {
    if (value === null || value === undefined) return { t: 's', v: '' }
    const trimmed = value.trim()
    if (trimmed === '') return { t: 's', v: '' }
    const num = Number(trimmed)
    if (!isNaN(num)) return { t: 'n', v: num }
    return { t: 's', v: trimmed }
  }

  for (let idx = 0; idx < rows.length; idx++) {
    const src = rows[idx]
    const consecutive = startConsecutive + idx
    const debitRow = 1 + idx * 2
    const creditRow = 2 + idx * 2

    const amount = src.amount
    const dateValue = src.date
    const lot = src.lot
    const label = src.label
    const description = label ? `${label}-${lot}` : lot
    const installment = src.installment
    const thirdId = src.thirdId
    const receipt = src.receipt

    const debitAccount = debitAccountForMedium(src.medium, accountMap)

    const debitCells: Record<string, XLSX.CellObject> = {
      A: makeCell(ACCOUNT.DEBIT_DEFAULT),
      B: makeCell(consecutive),
      C: makeCellWithFormat(dateValue, 'DD/MM/YYYY'),
      D: makeCell(ACCOUNT.CURRENCY_CODE),
      F: makeCell(debitAccount),
      G: makeNumeric(thirdId),
      V: makeCellWithFormat(amount, '0'),
    }
    for (const [col, cell] of Object.entries(debitCells)) {
      const ref = `${col}${debitRow + 1}`
      mainWs[ref] = cell
    }

    const creditCells: Record<string, XLSX.CellObject> = {
      A: makeCell(ACCOUNT.DEBIT_DEFAULT),
      B: makeCell(consecutive),
      C: makeCellWithFormat(dateValue, 'DD/MM/YYYY'),
      D: makeCell(ACCOUNT.CURRENCY_CODE),
      F: makeCell(ACCOUNT.CREDIT_FUND),
      G: makeNumeric(thirdId),
      M: makeCell(ACCOUNT.DOC_TYPE),
      N: makeNumeric(receipt),
      O: makeCell(installment ?? ''),
      P: makeCellWithFormat(dateValue, 'DD/MM/YYYY'),
      T: makeCell(description),
      W: makeCellWithFormat(amount, '0'),
    }
    for (const [col, cell] of Object.entries(creditCells)) {
      const ref = `${col}${creditRow + 1}`
      mainWs[ref] = cell
    }

    const helperRef = idx + 1
    helperWs[`A${helperRef}`] = makeCell(null)
    helperWs[`B${helperRef}`] = makeCell(debitAccount)
    helperWs[`C${helperRef}`] = makeCell(debitAccount)
  }

  delete mainWs['!comments']
  delete helperWs['!comments']

  const range = XLSX.utils.decode_range(`A1:AA${requiredRows}`)
  if (!mainWs['!ref']) mainWs['!ref'] = XLSX.utils.encode_range(range)

  const output = XLSX.write(templateWb, { type: 'array', bookType: 'xlsx', cellDates: true, cellStyles: true })

  return { output: output as ArrayBuffer, skippedMissingAmount, rows }
}
