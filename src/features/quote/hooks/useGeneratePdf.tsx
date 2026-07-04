import { useState, useCallback } from 'react'
import { pdf } from '@react-pdf/renderer'
import { QuotePDF } from '../pdf/QuotePDF'
import type { Cotizacion } from '../types'
import logoUrl from '@/assets/logo.jpeg'

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

export function useGeneratePdf() {
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(async (cotizacion: Cotizacion) => {
    setGenerating(true)
    setError(null)

    try {
      let logoSrc: string | undefined

      try {
        logoSrc = await imagenABase64(logoUrl)
      } catch {
        console.warn('No se pudo cargar el logo, se omite')
      }

      const doc = <QuotePDF cotizacion={cotizacion} logoSrc={logoSrc} />
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
      const mensaje = err instanceof Error ? err.message : String(err)
      console.error('PDF generation error:', mensaje)
      setError(`Error al generar el PDF: ${mensaje}`)
    } finally {
      setGenerating(false)
    }
  }, [])

  return { generate, generating, error }
}
