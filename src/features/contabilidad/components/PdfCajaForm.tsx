import { useRef } from 'react'
import type { PdfCajaFormReturn } from '../hooks/usePdfCajaForm'
import { Card, Button } from '@/components/ui'
import { Upload, FileText } from 'lucide-react'

interface PdfCajaFormProps {
  form: PdfCajaFormReturn
}

export function PdfCajaForm({ form }: PdfCajaFormProps) {
  const pdfRef = useRef<HTMLInputElement>(null)

  const { pdfFile, generating, error, loadPdf, convert } = form

  const handlePdfFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) loadPdf(file)
  }

  return (
    <section className="space-y-6">
      <Card>
        <h2 className="text-lg font-bold text-brand-dark mb-4">PDF de caja</h2>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-brand-dark mb-1">Archivo PDF</p>
            <input ref={pdfRef} type="file" accept=".pdf" onChange={handlePdfFile} className="hidden" />
            <Button type="button" variant="secondary" size="sm" onClick={() => pdfRef.current?.click()}>
              <Upload size={16} className="mr-1" /> Seleccionar PDF
            </Button>
            {pdfFile && (
              <div className="flex items-center gap-2 mt-2 text-sm text-brand-gray">
                <FileText size={16} />
                <span>{pdfFile.name}</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}

      <Button
        className="w-full"
        onClick={convert}
        disabled={!pdfFile || generating}
      >
        {generating ? 'Convirtiendo...' : 'Convertir PDF a Excel'}
      </Button>
    </section>
  )
}
