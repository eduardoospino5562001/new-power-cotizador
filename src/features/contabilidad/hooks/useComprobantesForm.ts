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

      const filename = `comprobante_${selectedProject}_${selectedYear}_${String(selectedMonth).padStart(2, '0')}.xlsx`

      const outputRows: OutputRow[] = []
      for (let i = 0; i < r.rows.length; i++) {
        const src = r.rows[i]
        const consecutive = startConsecutive + i
        const debitAccount = debitAccountForMedium(src.medium, accountMap)
        const label = src.label
        const description = label ? `${label}-${src.lot}` : src.lot

        outputRows.push({
          consecutive,
          type: 'Débito',
          date: src.date,
          currency: 'COP',
          account: debitAccount,
          thirdId: src.thirdId,
          docType: null,
          receipt: null,
          installment: null,
          dueDate: null,
          description: '',
          amount: src.amount,
        })
        outputRows.push({
          consecutive,
          type: 'Crédito',
          date: src.date,
          currency: 'COP',
          account: ACCOUNT.CREDIT_FUND,
          thirdId: src.thirdId,
          docType: 'RCBO',
          receipt: src.receipt,
          installment: src.installment,
          dueDate: src.date,
          description,
          amount: src.amount,
        })
      }

      setResult({
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
      })

      setSuccess('Archivo generado exitosamente. Revisa el resultado antes de descargar.')
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
