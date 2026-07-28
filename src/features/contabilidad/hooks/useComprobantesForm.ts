import { useState, useCallback } from 'react'
import type { ScanResult, AccountMap, SourceRow, OutputRow } from '../types'
import { ACCOUNT_CODE_OPTIONS, ACCOUNT, debitAccountForMedium } from '../lib/excelUtils'
import { scanWorkbook } from '../lib/excelReader'
import { exportWorkbook } from '../lib/excelExporter'
import { saveAs } from 'file-saver'

const TEMPLATE_URL = '/Modelodeimportacion.xlsx'

export interface GeneratedResult {
  output: ArrayBuffer
  skippedMissingAmount: number
  rows: SourceRow[]
  outputRows: OutputRow[]
  filename: string
  project: string
  year: number
  month: number
  startConsecutive: number
  accountMap: AccountMap
}

export function useComprobantesForm() {
  const [sourceFile, setSourceFile] = useState<File | null>(null)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [selectedProject, setSelectedProject] = useState('')
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const [startConsecutive, setStartConsecutive] = useState(1)
  const [accountMap, setAccountMap] = useState<AccountMap>({
    EFECTIVO: ACCOUNT_CODE_OPTIONS.EFECTIVO,
    BONIFICACION: ACCOUNT_CODE_OPTIONS.BANCOLOMBIA,
    CTA_ARQ: ACCOUNT_CODE_OPTIONS.BANCOLOMBIA,
    CTA_KATHE: ACCOUNT_CODE_OPTIONS.BANCOLOMBIA,
    BANCOLOMBIA: ACCOUNT_CODE_OPTIONS.BANCOLOMBIA,
    DAVIVIENDA: ACCOUNT_CODE_OPTIONS.DAVIVIENDA,
    CAJA: ACCOUNT_CODE_OPTIONS.CAJA,
  })
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [result, setResult] = useState<GeneratedResult | null>(null)

  const loadSource = useCallback(async (file: File) => {
    setError(null)
    setSuccess(null)
    setResult(null)
    setSourceFile(file)
    try {
      const r = await scanWorkbook(file)
      setScanResult(r)
      const projects = Object.keys(r.projects)
      setSelectedProject(projects[0])
      setSelectedYear(r.years[0])
      setSelectedMonth(r.months[0])
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setScanResult(null)
    }
  }, [])

  const generate = useCallback(async () => {
    if (!sourceFile || !selectedProject || selectedYear === null || selectedMonth === null) {
      setError('Completa todos los campos requeridos.')
      return
    }

    setGenerating(true)
    setError(null)
    setSuccess(null)
    setResult(null)

    try {
      const templateResp = await fetch(TEMPLATE_URL)
      if (!templateResp.ok) throw new Error('No se encontro la plantilla.')
      const templateBuf = await templateResp.arrayBuffer()
      const templateFile = new File([templateBuf], 'Modelodeimportacion.xlsx')

      const r = await exportWorkbook(
        templateFile,
        sourceFile,
        startConsecutive,
        selectedProject,
        selectedYear,
        selectedMonth,
        accountMap
      )

      const lastConsecutive = startConsecutive + r.rows.length - 1
      if (String(lastConsecutive).length > 11) {
        throw new Error(
          `El consecutivo final ${lastConsecutive} supera el limite de 11 digitos. ` +
          `Reduce el valor de "Consecutivo inicio" (actual: ${startConsecutive}).`
        )
      }

      const filename = `comprobante_${selectedProject}_${selectedYear}_${String(selectedMonth).padStart(2, '0')}.xlsx`

      const outputRows: OutputRow[] = []
      for (let i = 0; i < r.rows.length; i++) {
        const src = r.rows[i]
        const consecutive = startConsecutive + i
        const debitAccount = debitAccountForMedium(src.medium, accountMap)
        const description = src.label ? `${src.label}-${src.lot}` : src.lot

        outputRows.push({
          tipoComprobante: ACCOUNT.DEBIT_DEFAULT as number,
          consecutivo: consecutive,
          fechaElaboracion: src.date,
          siglaMoneda: 'COP',
          tasaCambio: null,
          codigoCuenta: debitAccount,
          identificacionTercero: src.thirdId,
          sucursal: null,
          codigoProducto: null,
          codigoBodega: null,
          accion: null,
          cantidadProducto: null,
          prefijo: null,
          reciboConsecutivo: null,
          numeroCuota: null,
          fechaVencimiento: null,
          codigoImpuesto: null,
          codigoGrupoActivo: null,
          codigoActivoFijo: null,
          descripcion: '',
          codigoCentroCostos: null,
          debito: src.amount,
          credito: null,
          observaciones: null,
          baseGravable: null,
          baseExenta: null,
          mesCierre: null,
        })

        outputRows.push({
          tipoComprobante: ACCOUNT.DEBIT_DEFAULT as number,
          consecutivo: consecutive,
          fechaElaboracion: src.date,
          siglaMoneda: 'COP',
          tasaCambio: null,
          codigoCuenta: ACCOUNT.CREDIT_FUND,
          identificacionTercero: src.thirdId,
          sucursal: null,
          codigoProducto: null,
          codigoBodega: null,
          accion: null,
          cantidadProducto: null,
          prefijo: 'RCBO',
          reciboConsecutivo: src.receipt,
          numeroCuota: src.installment,
          fechaVencimiento: src.date,
          codigoImpuesto: null,
          codigoGrupoActivo: null,
          codigoActivoFijo: null,
          descripcion: description,
          codigoCentroCostos: null,
          debito: null,
          credito: src.amount,
          observaciones: null,
          baseGravable: null,
          baseExenta: null,
          mesCierre: null,
        })
      }

      const genResult: GeneratedResult = {
        output: r.output,
        skippedMissingAmount: r.skippedMissingAmount,
        rows: r.rows,
        outputRows,
        filename,
        project: selectedProject,
        year: selectedYear,
        month: selectedMonth,
        startConsecutive,
        accountMap,
      }

      const blob = new Blob([r.output as BlobPart], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      saveAs(blob, filename)
      setResult(genResult)
      setSuccess('Archivo generado y descargado. Revisa el contenido en el visor.')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setGenerating(false)
    }
  }, [sourceFile, selectedProject, selectedYear, selectedMonth, startConsecutive, accountMap])

  const download = useCallback(() => {
    if (!result) return
    const blob = new Blob([result.output as BlobPart], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    saveAs(blob, result.filename)
  }, [result])

  const reset = useCallback(() => {
    setSourceFile(null)
    setScanResult(null)
    setSelectedProject('')
    setSelectedYear(null)
    setSelectedMonth(null)
    setStartConsecutive(1)
    setError(null)
    setSuccess(null)
    setResult(null)
  }, [])

  const backToForm = useCallback(() => {
    setResult(null)
    setSuccess(null)
    setError(null)
  }, [])

  return {
    sourceFile,
    scanResult,
    selectedProject,
    selectedYear,
    selectedMonth,
    startConsecutive,
    accountMap,
    generating,
    error,
    success,
    result,
    setSelectedProject,
    setSelectedYear,
    setSelectedMonth,
    setStartConsecutive,
    setAccountMap,
    loadSource,
    generate,
    download,
    reset,
    backToForm,
  }
}

export type ComprobantesFormReturn = ReturnType<typeof useComprobantesForm>
