import { useState, useCallback } from 'react'
import { exportCashboxPdfToExcel } from '../lib/pdfCashbox'
import { saveAs } from 'file-saver'

export function usePdfCajaForm() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const loadPdf = useCallback((file: File) => {
    setError(null)
    setSuccess(null)
    setPdfFile(file)
  }, [])

  const convert = useCallback(async () => {
    if (!pdfFile) {
      setError('Selecciona un archivo PDF.')
      return
    }

    setGenerating(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await exportCashboxPdfToExcel(pdfFile)

      const blob = new Blob([result.output as BlobPart], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const filename = pdfFile.name.replace(/\.pdf$/i, '') + '_iniciales_abonos.xlsx'
      saveAs(blob, filename)

      setSuccess(`Excel generado (${result.exportedCount} exportados, ${result.totalCount - result.exportedCount} omitidos)`)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setGenerating(false)
    }
  }, [pdfFile])

  const reset = useCallback(() => {
    setPdfFile(null)
    setError(null)
    setSuccess(null)
  }, [])

  return {
    pdfFile,
    generating,
    error,
    success,
    loadPdf,
    convert,
    reset,
  }
}

export type PdfCajaFormReturn = ReturnType<typeof usePdfCajaForm>
