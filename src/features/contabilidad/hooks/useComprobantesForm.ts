import { useState, useCallback } from 'react'
import type { ScanResult, AccountMap } from '../types'
import { ACCOUNT_CODE_OPTIONS } from '../lib/excelUtils'
import { scanWorkbook } from '../lib/excelReader'
import { exportWorkbook } from '../lib/excelExporter'
import { saveAs } from 'file-saver'

export function useComprobantesForm() {
  const [sourceFile, setSourceFile] = useState<File | null>(null)
  const [templateFile, setTemplateFile] = useState<File | null>(null)
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

  const loadSource = useCallback(async (file: File) => {
    setError(null)
    setSuccess(null)
    setSourceFile(file)
    try {
      const result = await scanWorkbook(file)
      setScanResult(result)
      const projects = Object.keys(result.projects)
      setSelectedProject(projects[0])
      setSelectedYear(result.years[0])
      setSelectedMonth(result.months[0])
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setScanResult(null)
    }
  }, [])

  const loadTemplate = useCallback((file: File) => {
    setTemplateFile(file)
  }, [])

  const generate = useCallback(async () => {
    if (!sourceFile || !templateFile || !selectedProject || selectedYear === null || selectedMonth === null) {
      setError('Completa todos los campos requeridos.')
      return
    }

    setGenerating(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await exportWorkbook(
        templateFile,
        sourceFile,
        startConsecutive,
        selectedProject,
        selectedYear,
        selectedMonth,
        accountMap
      )

      const blob = new Blob([result.output as BlobPart], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const filename = `comprobante_${selectedProject}_${selectedYear}_${String(selectedMonth).padStart(2, '0')}.xlsx`
      saveAs(blob, filename)

      const msg = result.skippedMissingAmount > 0
        ? `Archivo generado. Se omitieron ${result.skippedMissingAmount} filas sin monto.`
        : 'Archivo generado exitosamente.'
      setSuccess(msg)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setGenerating(false)
    }
  }, [sourceFile, templateFile, selectedProject, selectedYear, selectedMonth, startConsecutive, accountMap])

  const reset = useCallback(() => {
    setSourceFile(null)
    setTemplateFile(null)
    setScanResult(null)
    setSelectedProject('')
    setSelectedYear(null)
    setSelectedMonth(null)
    setStartConsecutive(1)
    setError(null)
    setSuccess(null)
  }, [])

  return {
    sourceFile,
    templateFile,
    scanResult,
    selectedProject,
    selectedYear,
    selectedMonth,
    startConsecutive,
    accountMap,
    generating,
    error,
    success,
    setSelectedProject,
    setSelectedYear,
    setSelectedMonth,
    setStartConsecutive,
    setAccountMap,
    loadSource,
    loadTemplate,
    generate,
    reset,
  }
}

export type ComprobantesFormReturn = ReturnType<typeof useComprobantesForm>
