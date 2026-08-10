import { useState, useCallback } from 'react'
import { pdf } from '@react-pdf/renderer'
import { ReportPDF } from '../pdf/ReportPDF'
import type { InformeTecnico } from '../types'
import logoUrl from '@/assets/logo.jpeg'
import { saveAndDownloadHistoryRecord } from '@/features/history/historyStore'

function slugify(text: string): string {
  return text.toUpperCase().trim().replace(/[^A-Z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
}

function generarNombreArchivo(informe: InformeTecnico): string {
  const base = `Informe-Tecnico-${informe.numero}`
  const cliente = informe.cliente ? `-${slugify(informe.cliente)}` : ''
  return `${base}${cliente}.pdf`
}

async function imagenABase64(url: string): Promise<string> {
  const respuesta = await fetch(url)
  const blob = await respuesta.blob()
  return new Promise((resolve, reject) => {
    const lector = new FileReader()
    lector.onloadend = () => resolve(lector.result as string)
    lector.onerror = reject
    lector.readAsDataURL(blob)
  })
}

export function useGenerateReportPdf() {
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(async (informe: InformeTecnico) => {
    setGenerating(true)
    setError(null)
    try {
      let logoSrc: string | undefined
      try { logoSrc = await imagenABase64(logoUrl) } catch { }

      const doc = <ReportPDF informe={informe} logoSrc={logoSrc} />
      const blob = await pdf(doc).toBlob()
      const filename = generarNombreArchivo(informe)
      await saveAndDownloadHistoryRecord({
        blob,
        name: filename,
        module: 'informes',
        moduleId: 'report',
        tool: 'Informe tecnico',
        mime: 'application/pdf',
        editableData: informe,
        isEditable: true,
      })
    } catch (err) {
      setError(`Error al generar el PDF: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setGenerating(false)
    }
  }, [])

  return { generate, generating, error }
}
