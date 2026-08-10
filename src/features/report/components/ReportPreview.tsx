import type { Control } from 'react-hook-form'
import { useWatch } from 'react-hook-form'
import type { InformeFormData } from '../logic/validation'
import type { InformeTecnico } from '../types'
import { Card, Button, DocumentWatermark } from '@/components/ui'
import { Loader2 } from 'lucide-react'
import { formatDate } from '../lib/format'

interface ReportPreviewProps {
  control: Control<InformeFormData>
  onGeneratePdf: (informe: InformeTecnico) => void
  generating: boolean
  pdfError: string | null
}

export function ReportPreview({ control, onGeneratePdf, generating, pdfError }: ReportPreviewProps) {
  const values = useWatch({ control })

  const numero = values?.numero ?? 'IT-001'
  const fecha = values?.fecha ?? ''
  const cliente = values?.cliente || '[Cliente]'
  const nit = values?.nit
  const observaciones = values?.observaciones || ''
  const grupos = values?.grupos ?? []
  const tecnico = values?.tecnico || '[Técnico]'

  const hasFotos = grupos.some((g: any) => (g?.fotos?.length ?? 0) > 0)
  const hasContent = !!(values?.cliente && values?.observaciones && values?.tecnico && hasFotos)

  const handleGenerate = () => {
    if (!hasContent || generating) return

    const informe: InformeTecnico = {
      numero,
      titulo: 'INFORME TÉCNICO',
      fecha,
      cliente,
      nit: nit || '',
      observaciones,
      grupos: grupos.map((g: any) => ({
        id: g?.id ?? '',
        nombre: g?.nombre ?? '',
        fotos: (g?.fotos ?? []).map((f: any) => ({
          id: f?.id ?? '',
          src: f?.src ?? '',
        })),
      })),
      tecnico,
    }

    onGeneratePdf(informe)
  }

  return (
    <Card className="relative isolate overflow-hidden border-2 border-brand-orange shadow-md">
      <div className="text-center mb-4 pb-3 border-b border-brand-orange-light">
        <h2 className="text-xl font-bold text-brand-dark tracking-tight">INFORME TÉCNICO</h2>
        <p className="text-sm text-brand-gray">No. {numero}</p>
        {fecha && <p className="text-sm text-brand-gray">{formatDate(fecha)}</p>}
      </div>

      <div className="mb-4 text-sm">
        <p className="font-bold text-brand-dark">NEW POWER ENERGY SAS</p>
        <p className="text-brand-gray">NIT 901826285-6</p>
        <p className="text-brand-gray">VILLAVICENCIO-META</p>
        <p className="text-brand-gray">Tel: (57) 3204931541</p>
      </div>

      <div className="mb-4 text-sm border-t border-brand-orange-light pt-3">
        <p><span className="font-semibold">Cliente:</span> {cliente}</p>
        {nit && <p><span className="font-semibold">NIT:</span> {nit}</p>}
      </div>

      <div className="mb-4 text-sm">
        <h3 className="font-bold text-brand-dark mb-1">Observaciones</h3>
        <p className="text-brand-gray whitespace-pre-wrap">{observaciones || '—'}</p>
      </div>

      {grupos.length > 0 && (
        <div className="mb-4">
          {grupos.map((grupo: any, gi: number) => {
            const fotos = grupo?.fotos ?? []
            return (
              <div key={grupo?.id ?? gi} className="mb-3">
                <h3 className="font-bold text-brand-dark text-sm mb-2">
                  {grupo?.nombre || `Grupo ${gi + 1}`}
                </h3>
                {fotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-1">
                    {fotos.map((foto: any, fi: number) => (
                      <div key={foto?.id ?? fi}>
                        {foto?.src && (
                          <img src={foto.src} alt="" className="w-full aspect-square object-cover rounded border border-brand-orange-light" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="text-sm border-t border-brand-orange-light pt-3">
        <p><span className="font-semibold">Técnico:</span> {tecnico}</p>
      </div>

      <div className="mt-4">
        <Button className="w-full" onClick={handleGenerate} disabled={!hasContent || generating}>
          {generating ? (
            <><Loader2 size={16} className="mr-2 animate-spin" /> Generando...</>
          ) : (
            'Generar PDF'
          )}
        </Button>
        {!hasContent && (
          <p className="text-xs text-amber-600 mt-2 text-center">
            Completa todos los campos obligatorios y agrega al menos un grupo con fotos.
          </p>
        )}
        {pdfError && <p className="text-xs text-red-500 mt-2 text-center">{pdfError}</p>}
      </div>
      <DocumentWatermark />
    </Card>
  )
}
