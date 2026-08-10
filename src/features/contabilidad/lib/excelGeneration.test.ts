/// <reference types="node" />

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import ExcelJS from 'exceljs'
import * as XLSX from 'xlsx'
import { describe, expect, it } from 'vitest'
import type { AccountMap } from '../types'
import { exportWorkbook } from './excelExporter'
import { collectSourceRows } from './excelReader'

const SOURCE_HEADERS = [
  'Lote1',
  'Contabilidad',
  'N° de Comprobante',
  'No Docunento',
  'Comprador',
  'Fecha',
  'Medio de pago',
  'Contabilidad',
  '',
  'Comprador',
  'Por Copcento de',
  'Con descuento',
  'Porcentaje',
  'Abono Cuota Inicial',
  'Proyecto',
  'Numero de recibo',
]

const ACCOUNT_MAP: AccountMap = {
  EFECTIVO: 11050501,
  BONIFICACION: 11100504,
  CTA_ARQ: 11100504,
  CTA_KATHE: 11100504,
  BANCOLOMBIA: 11100504,
  DAVIVIENDA: 11100505,
  CAJA: 11050501,
}

function sourceRow(receipt: unknown): unknown[] {
  return [
    'M4 L 4',
    0.1841,
    61000,
    40326088,
    'YESENIA MARTINEZ CAMACHO',
    new Date(2026, 0, 2),
    'EFECTIVO',
    405020,
    '-',
    'YESENIA MARTINEZ CAMACHO',
    'Cuota 2',
    2200000,
    0,
    2200000,
    'APIAY RESERVADO',
    receipt,
  ]
}

function sourceWorksheet(receipt: unknown): XLSX.WorkSheet {
  return XLSX.utils.aoa_to_sheet([SOURCE_HEADERS, sourceRow(receipt)], { cellDates: true })
}

function asFile(bytes: Uint8Array | ArrayBuffer, name: string): File {
  const view = bytes instanceof ArrayBuffer
    ? new Uint8Array(bytes)
    : new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  const copy = Uint8Array.from(view)
  return {
    name,
    arrayBuffer: async () => copy.buffer,
  } as File
}

describe('generacion del Excel contable', () => {
  it('toma el Consecutivo de Numero de recibo y no del nombre del comprador', () => {
    const result = collectSourceRows(sourceWorksheet(409), 2, 'APIAY RESERVADO', 2026, 1)

    expect(result.rows).toHaveLength(1)
    expect(result.rows[0].receipt).toBe(409)
    expect(typeof result.rows[0].receipt).toBe('number')
  })

  it('convierte recibos compuestos solo por digitos a una celda numerica', () => {
    const result = collectSourceRows(sourceWorksheet('00409'), 2, 'APIAY RESERVADO', 2026, 1)

    expect(result.rows[0].receipt).toBe(409)
    expect(typeof result.rows[0].receipt).toBe('number')
  })

  it('impide generar un Consecutivo con nombres, texto o mas de 11 digitos', () => {
    expect(() =>
      collectSourceRows(sourceWorksheet('YESENIA MARTINEZ CAMACHO'), 2, 'APIAY RESERVADO', 2026, 1)
    ).toThrow('debe ser un entero de maximo 11 digitos')

    expect(() =>
      collectSourceRows(sourceWorksheet('123456789012'), 2, 'APIAY RESERVADO', 2026, 1)
    ).toThrow('debe ser un entero de maximo 11 digitos')
  })

  it('exporta ambos consecutivos como numeros y conserva la plantilla SIGO', async () => {
    const sourceBook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(sourceBook, sourceWorksheet(409), 'Origen')
    const sourceBytes = XLSX.write(sourceBook, { type: 'array', bookType: 'xlsx', cellDates: true })
    const templateBytes = readFileSync(resolve(process.cwd(), 'public/Modelodeimportacion.xlsx'))

    const result = await exportWorkbook(
      asFile(templateBytes, 'Modelodeimportacion.xlsx'),
      asFile(sourceBytes, 'origen.xlsx'),
      295,
      'APIAY RESERVADO',
      2026,
      1,
      ACCOUNT_MAP
    )

    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(result.output as unknown as ExcelJS.Buffer)
    const sheet = workbook.getWorksheet('Datos')

    expect(workbook.worksheets.map((item) => item.name)).toEqual(['Datos'])
    expect(sheet).toBeDefined()
    expect(sheet!.columnCount).toBe(27)
    expect(sheet!.getCell('B2').value).toBe(295)
    expect(sheet!.getCell('B3').value).toBe(295)
    expect(typeof sheet!.getCell('B2').value).toBe('number')
    expect(sheet!.getCell('N2').value).toBeNull()
    expect(sheet!.getCell('N3').value).toBe(409)
    expect(typeof sheet!.getCell('N3').value).toBe('number')
    expect(sheet!.getCell('P3').value).toBeInstanceOf(Date)
    expect(sheet!.getCell('P3').numFmt).toBe('mm-dd-yy')
  })
})
