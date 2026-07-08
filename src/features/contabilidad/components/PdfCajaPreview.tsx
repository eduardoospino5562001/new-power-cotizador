import type { PdfCajaFormReturn } from '../hooks/usePdfCajaForm'
import { Card } from '@/components/ui'
import { CheckCircle2, FileText } from 'lucide-react'

interface PdfCajaPreviewProps {
  form: PdfCajaFormReturn
}

export function PdfCajaPreview({ form }: PdfCajaPreviewProps) {
  const { pdfFile, success } = form

  return (
    <Card className="border-2 border-brand-orange shadow-md">
      <h2 className="text-xl font-bold text-brand-dark tracking-tight text-center mb-4">
        CAJA PDF A EXCEL
      </h2>

      {!pdfFile && (
        <div className="text-center py-8 text-brand-gray">
          <FileText size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">Selecciona un PDF de caja para convertir.</p>
        </div>
      )}

      {pdfFile && (
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-brand-orange shrink-0" />
            <div>
              <p className="font-semibold text-brand-dark">PDF seleccionado</p>
              <p className="text-brand-gray text-xs break-all">{pdfFile.name}</p>
              <p className="text-brand-gray text-xs">
                {(pdfFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>

          <div className="border-t border-brand-orange-light pt-3 text-xs text-brand-gray">
            <p>Se extraerán solo registros de tipo:</p>
            <ul className="list-disc list-inside mt-1">
              <li>Inicial</li>
              <li>Abono</li>
              <li>Cuotas</li>
            </ul>
          </div>
        </div>
      )}

      {success && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
          <CheckCircle2 size={18} className="text-green-600 mt-0.5 shrink-0" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}
    </Card>
  )
}
