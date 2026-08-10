import * as XLSX from 'xlsx'
import ExcelJS from 'exceljs'
import type { AccountMap, SourceRow } from '../types'
import { ACCOUNT, debitAccountForMedium } from './excelUtils'
import { collectSourceRows } from './excelReader'

function cloneStyle<T>(value: T): T {
  return value ? JSON.parse(JSON.stringify(value)) as T : value
}

function copyRowStyle(ws: ExcelJS.Worksheet, sourceRowIndex: number, targetRowIndex: number) {
  const sourceRow = ws.getRow(sourceRowIndex)
  const targetRow = ws.getRow(targetRowIndex)

  for (let colIndex = 1; colIndex <= ws.columnCount; colIndex++) {
    const sourceCell = sourceRow.getCell(colIndex)
    const targetCell = targetRow.getCell(colIndex)
    targetCell.style = cloneStyle(sourceCell.style)
  }

  if (sourceRow.height) {
    targetRow.height = sourceRow.height
  }
}

function clearRow(ws: ExcelJS.Worksheet, rowIndex: number) {
  const row = ws.getRow(rowIndex)
  for (let colIndex = 1; colIndex <= ws.columnCount; colIndex++) {
    row.getCell(colIndex).value = null
  }
}

function asExcelDateOnly(value: Date): Date {
  return new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate(), 0, 0, 0, 0))
}

function normalizeEmptyCellFormats(ws: ExcelJS.Worksheet, requiredRows: number) {
  for (let rowIndex = 2; rowIndex <= requiredRows; rowIndex++) {
    const row = ws.getRow(rowIndex)
    for (let colIndex = 1; colIndex <= ws.columnCount; colIndex++) {
      const cell = row.getCell(colIndex)
      if (cell.value !== null && cell.value !== undefined && cell.value !== '') continue

      if (colIndex === 16 && rowIndex === 2) {
        cell.numFmt = 'mm-dd-yy'
      } else {
        cell.numFmt = 'General'
      }
    }
  }
}

export async function exportWorkbook(
  templateFile: File,
  sourceFile: File,
  startConsecutive: number,
  selectedProject: string,
  year: number,
  month: number,
  accountMap: AccountMap
): Promise<{ output: ArrayBuffer; skippedMissingAmount: number; rows: SourceRow[] }> {
  const sourceBuf = await sourceFile.arrayBuffer()
  const templateBuf = await templateFile.arrayBuffer()

  const sourceWb = XLSX.read(sourceBuf, { type: 'array', cellDates: true })
  const sourceWs = sourceWb.Sheets[sourceWb.SheetNames[0]]
  const sourceRef = sourceWs['!ref']
  if (!sourceRef) throw new Error('El archivo origen no tiene datos.')
  const sourceMaxRow = XLSX.utils.decode_range(sourceRef).e.r + 1

  const { rows, skippedMissingAmount } = collectSourceRows(sourceWs, sourceMaxRow, selectedProject, year, month)

  if (rows.length === 0) {
    throw new Error(`El proyecto '${selectedProject}' no tiene filas con monto para exportar en ese mes.`)
  }

  const lastConsecutive = startConsecutive + rows.length - 1
  if (
    !Number.isSafeInteger(startConsecutive) ||
    startConsecutive < 1 ||
    !Number.isSafeInteger(lastConsecutive) ||
    String(lastConsecutive).length > 11
  ) {
    throw new Error('El Consecutivo comprobante debe ser un entero positivo de maximo 11 digitos.')
  }

  const wb = new ExcelJS.Workbook()
  await wb.xlsx.load(templateBuf as unknown as ExcelJS.Buffer)

  const ws = wb.getWorksheet('Datos')
  const helperSheet = wb.getWorksheet('Hoja1')
  if (!ws) throw new Error("La plantilla no contiene la hoja 'Datos'.")

  function col(letter: string): number {
    if (letter.length === 1) return letter.charCodeAt(0) - 64
    return (letter.charCodeAt(0) - 64) * 26 + (letter.charCodeAt(1) - 64)
  }

  const requiredRows = rows.length * 2 + 1
  for (let rowIndex = ws.rowCount + 1; rowIndex <= requiredRows; rowIndex++) {
    copyRowStyle(ws, rowIndex % 2 === 0 ? 2 : 3, rowIndex)
  }
  if (helperSheet) {
    for (let rowIndex = helperSheet.rowCount + 1; rowIndex <= rows.length; rowIndex++) {
      copyRowStyle(helperSheet, 1, rowIndex)
    }
  }

  for (let rowIndex = 2; rowIndex <= ws.rowCount; rowIndex++) {
    clearRow(ws, rowIndex)
  }
  if (helperSheet) {
    for (let rowIndex = 1; rowIndex <= helperSheet.rowCount; rowIndex++) {
      clearRow(helperSheet, rowIndex)
    }
  }

  for (let idx = 0; idx < rows.length; idx++) {
    const src = rows[idx]
    const consecutive = startConsecutive + idx
    const debitRowNum = 2 + idx * 2
    const creditRowNum = 3 + idx * 2

    const amount = src.amount
    const dateValue = asExcelDateOnly(src.date)
    const description = src.label ? `${src.label}-${src.lot}` : src.lot
    const thirdId = src.thirdId
    const debitAccount = debitAccountForMedium(src.medium, accountMap)

    const dRow = ws.getRow(debitRowNum)
    dRow.getCell(col('A')).value = ACCOUNT.DEBIT_DEFAULT
    dRow.getCell(col('B')).value = consecutive
    dRow.getCell(col('C')).value = dateValue
    dRow.getCell(col('D')).value = ACCOUNT.CURRENCY_CODE
    dRow.getCell(col('F')).value = debitAccount
    dRow.getCell(col('G')).value = thirdId
    dRow.getCell(col('T')).value = description
    dRow.getCell(col('V')).value = amount
    dRow.getCell(col('V')).numFmt = '0'

    const cRow = ws.getRow(creditRowNum)
    cRow.getCell(col('A')).value = ACCOUNT.DEBIT_DEFAULT
    cRow.getCell(col('B')).value = consecutive
    cRow.getCell(col('C')).value = dateValue
    cRow.getCell(col('D')).value = ACCOUNT.CURRENCY_CODE
    cRow.getCell(col('F')).value = ACCOUNT.CREDIT_FUND
    cRow.getCell(col('G')).value = thirdId
    cRow.getCell(col('M')).value = ACCOUNT.DOC_TYPE
    cRow.getCell(col('N')).value = src.receipt
    cRow.getCell(col('O')).value = src.installment
    cRow.getCell(col('P')).value = dateValue
    cRow.getCell(col('T')).value = description
    cRow.getCell(col('W')).value = amount
    cRow.getCell(col('W')).numFmt = '0'

    if (helperSheet) {
      const helperRow = helperSheet.getRow(idx + 1)
      helperRow.getCell(1).value = null
      helperRow.getCell(2).value = debitAccount
      helperRow.getCell(3).value = debitAccount
    }
  }

  normalizeEmptyCellFormats(ws, requiredRows)

  if (ws.rowCount > requiredRows) {
    ws.spliceRows(requiredRows + 1, ws.rowCount - requiredRows)
  }

  const outBuf = await wb.xlsx.writeBuffer()
  return { output: outBuf as ArrayBuffer, skippedMissingAmount, rows }
}
