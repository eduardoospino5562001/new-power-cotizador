import * as XLSX from 'xlsx'
import ExcelJS from 'exceljs'
import type { AccountMap, SourceRow } from '../types'
import { ACCOUNT, debitAccountForMedium } from './excelUtils'
import { collectSourceRows } from './excelReader'

export async function exportWorkbook(
  _templateFile: File,
  sourceFile: File,
  startConsecutive: number,
  selectedProject: string,
  year: number,
  month: number,
  accountMap: AccountMap
): Promise<{ output: ArrayBuffer; skippedMissingAmount: number; rows: SourceRow[] }> {
  const sourceBuf = await sourceFile.arrayBuffer()

  const sourceWb = XLSX.read(sourceBuf, { type: 'array', cellDates: true })
  const sourceWs = sourceWb.Sheets[sourceWb.SheetNames[0]]
  const sourceRef = sourceWs['!ref']
  if (!sourceRef) throw new Error('El archivo origen no tiene datos.')
  const sourceMaxRow = XLSX.utils.decode_range(sourceRef).e.r + 1

  const { rows, skippedMissingAmount } = collectSourceRows(sourceWs, sourceMaxRow, selectedProject, year, month)

  if (rows.length === 0) {
    throw new Error(`El proyecto '${selectedProject}' no tiene filas con monto para exportar en ese mes.`)
  }

  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet('Datos')

  const COL_WIDTHS: Record<string, number> = {
    A: 13.14, B: 13.57, C: 11.43, D: 8.71, E: 14.57, F: 17,
    G: 14.14, H: 11.43, I: 11.43, J: 11.86, K: 9.71, L: 9,
    M: 11.86, N: 13.29, O: 12.43, P: 12.14, Q: 13.86, R: 11.43,
    S: 25.57, T: 14.43, U: 23.29, V: 17.86, W: 20.43, X: 17.14,
    Y: 17.86, Z: 17.14,
  }
  for (const [col, w] of Object.entries(COL_WIDTHS)) {
    const idx = col.charCodeAt(0) - 65
    ws.getColumn(idx + 1).width = w
  }

  const REQUIRED_COLS = new Set(['A', 'B', 'C', 'F', 'G'])

  const HEADERS: Record<string, string> = {
    A: 'Tipo de comprobante', B: 'Consecutivo comprobante', C: 'Fecha de elaboración',
    D: 'Sigla moneda', E: 'Tasa de cambio', F: 'Código cuenta contable',
    G: 'Identificación tercero', H: 'Sucursal', I: 'Código producto',
    J: 'Código de bodega', K: 'Acción', L: 'Cantidad producto',
    M: 'Prefijo', N: 'Consecutivo', O: 'No. cuota', P: 'Fecha vencimiento',
    Q: 'Código impuesto', R: 'Código grupo activo fijo', S: 'Código activo fijo',
    T: 'Descripción', U: 'Código centro/subcentro de costos',
    V: 'Débito', W: 'Crédito', X: 'Observaciones',
    Y: 'Base gravable libro compras/ventas', Z: 'Base exenta libro compras/ventas',
    AA: 'Mes de cierre',
  }

  const headerRow = ws.getRow(1)
  headerRow.height = 30
  for (let c = 0; c < 27; c++) {
    const colLetter = String.fromCharCode(65 + c)
    const cell = headerRow.getCell(c + 1)
    cell.value = HEADERS[colLetter] ?? ''
    cell.fill = {
      type: 'pattern', pattern: 'solid',
      fgColor: { argb: REQUIRED_COLS.has(colLetter) ? 'FFFF0000' : 'FF0070C0' },
    }
    cell.font = { color: { argb: 'FFFFFFFF' }, bold: false }
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    cell.border = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' },
    }
  }

  function col(letter: string): number {
    if (letter.length === 1) return letter.charCodeAt(0) - 64
    return (letter.charCodeAt(0) - 64) * 26 + (letter.charCodeAt(1) - 64)
  }

  for (let idx = 0; idx < rows.length; idx++) {
    const src = rows[idx]
    const consecutive = startConsecutive + idx
    const debitRowNum = 2 + idx * 2
    const creditRowNum = 3 + idx * 2

    const amount = src.amount
    const dateValue = src.date
    const description = src.label ? `${src.label}-${src.lot}` : src.lot
    const thirdId = src.thirdId
    const debitAccount = debitAccountForMedium(src.medium, accountMap)

    const dRow = ws.getRow(debitRowNum)
    dRow.getCell(col('A')).value = ACCOUNT.DEBIT_DEFAULT
    dRow.getCell(col('B')).value = consecutive
    dRow.getCell(col('C')).value = dateValue
    dRow.getCell(col('C')).numFmt = 'DD/MM/YYYY'
    dRow.getCell(col('D')).value = ACCOUNT.CURRENCY_CODE
    dRow.getCell(col('F')).value = debitAccount
    dRow.getCell(col('G')).value = thirdId ? Number(thirdId) : ''
    dRow.getCell(col('V')).value = amount
    dRow.getCell(col('V')).numFmt = '0'

    const cRow = ws.getRow(creditRowNum)
    cRow.getCell(col('A')).value = ACCOUNT.DEBIT_DEFAULT
    cRow.getCell(col('B')).value = consecutive
    cRow.getCell(col('C')).value = dateValue
    cRow.getCell(col('C')).numFmt = 'DD/MM/YYYY'
    cRow.getCell(col('D')).value = ACCOUNT.CURRENCY_CODE
    cRow.getCell(col('F')).value = ACCOUNT.CREDIT_FUND
    cRow.getCell(col('G')).value = thirdId ? Number(thirdId) : ''
    cRow.getCell(col('M')).value = ACCOUNT.DOC_TYPE
    cRow.getCell(col('N')).value = src.receipt ? Number(src.receipt) : ''
    cRow.getCell(col('O')).value = src.installment ?? ''
    cRow.getCell(col('P')).value = dateValue
    cRow.getCell(col('P')).numFmt = 'DD/MM/YYYY'
    cRow.getCell(col('T')).value = description
    cRow.getCell(col('W')).value = amount
    cRow.getCell(col('W')).numFmt = '0'

    cRow.getCell(col('O')).alignment = { horizontal: 'left', wrapText: true }
    cRow.getCell(col('O')).border = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' },
    }
    cRow.getCell(col('P')).border = {
      top: { style: 'thin' }, left: { style: 'thin' },
      bottom: { style: 'thin' }, right: { style: 'thin' },
    }
  }

  const helperSheet = wb.addWorksheet('Hoja1')
  for (let idx = 0; idx < rows.length; idx++) {
    const debitAccount = debitAccountForMedium(rows[idx].medium, accountMap)
    const r = helperSheet.getRow(idx + 1)
    r.getCell(1).value = ''
    r.getCell(2).value = debitAccount
    r.getCell(3).value = debitAccount
  }

  const outBuf = await wb.xlsx.writeBuffer()
  return { output: outBuf as ArrayBuffer, skippedMissingAmount, rows }
}
