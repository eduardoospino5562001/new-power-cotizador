import { useState } from 'react'
import { useComprobantesForm } from './hooks/useComprobantesForm'
import { usePdfCajaForm } from './hooks/usePdfCajaForm'
import { ComprobantesForm } from './components/ComprobantesForm'
import { ComprobantesPreview } from './components/ComprobantesPreview'
import { PdfCajaForm } from './components/PdfCajaForm'
import { PdfCajaPreview } from './components/PdfCajaPreview'

type ContabilidadTab = 'comprobantes' | 'pdf'

export function Contabilidad() {
  const [tab, setTab] = useState<ContabilidadTab>('comprobantes')
  const comprobantesForm = useComprobantesForm()
  const pdfCajaForm = usePdfCajaForm()

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-brand-light rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab('comprobantes')}
          className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
            tab === 'comprobantes'
              ? 'bg-white text-brand-dark shadow-sm'
              : 'text-brand-gray hover:text-brand-dark'
          }`}
        >
          Comprobantes desde Excel
        </button>
        <button
          onClick={() => setTab('pdf')}
          className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
            tab === 'pdf'
              ? 'bg-white text-brand-dark shadow-sm'
              : 'text-brand-gray hover:text-brand-dark'
          }`}
        >
          Caja PDF a Excel
        </button>
      </div>

      {tab === 'comprobantes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <ComprobantesForm form={comprobantesForm} />
          </div>
          <div className="lg:sticky lg:top-6 lg:self-start">
            <ComprobantesPreview form={comprobantesForm} />
          </div>
        </div>
      )}

      {tab === 'pdf' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <PdfCajaForm form={pdfCajaForm} />
          </div>
          <div className="lg:sticky lg:top-6 lg:self-start">
            <PdfCajaPreview form={pdfCajaForm} />
          </div>
        </div>
      )}
    </div>
  )
}
