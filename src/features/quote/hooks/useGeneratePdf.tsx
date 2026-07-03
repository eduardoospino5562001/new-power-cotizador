import { useState, useCallback } from 'react'
import { pdf } from '@react-pdf/renderer'
import { QuotePDF } from '../pdf/QuotePDF'
import type { Cotizacion } from '../types'
import logoImg from '@/assets/logo.jpeg'

function slugify(text: string): string {
  return text
    .toUpperCase()
    .trim()
    .replace(/[^A-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function generarNombreArchivo(cotizacion: Cotizacion): string {
  const base = `Cotizacion-${cotizacion.numero}`
  const cliente = cotizacion.cliente.nombre
    ? `-${slugify(cotizacion.cliente.nombre)}`
    : ''
  return `${base}${cliente}.pdf`
}

export function useGeneratePdf() {
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(async (cotizacion: Cotizacion) => {
    setGenerating(true)
    setError(null)

    try {
      const doc = <QuotePDF cotizacion={cotizacion} logoSrc={logoImg} />
      const blob = await pdf(doc).toBlob()
      const url = URL.createObjectURL(blob)
      const filename = generarNombreArchivo(cotizacion)

      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError('Error al generar el PDF. Intenta de nuevo.')
      console.error('PDF generation error:', err)
    } finally {
      setGenerating(false)
    }
  }, [])

  return { generate, generating, error }
}
