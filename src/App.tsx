import { useState, useEffect } from 'react'
import { Header, Footer, PageContainer } from '@/components/layout'
import { useQuoteForm } from '@/features/quote/hooks/useQuoteForm'
import { useGeneratePdf } from '@/features/quote/hooks/useGeneratePdf'
import { QuoteForm } from '@/features/quote/components/QuoteForm'
import { QuotePreview } from '@/features/quote/components/QuotePreview'
import { cargarBorrador, borrarBorrador } from '@/features/quote/lib/storage'
import { Button } from '@/components/ui'
import type { CotizacionFormData } from '@/features/quote/logic/validation'
import type { Cotizacion } from '@/features/quote/types'

function App() {
  const form = useQuoteForm()
  const { generate, generating, error: pdfError } = useGeneratePdf()
  const [tab, setTab] = useState<'editar' | 'vistaprevia'>('editar')
  const [draftDetected, setDraftDetected] = useState(false)

  useEffect(() => {
    const draft = cargarBorrador<CotizacionFormData>()
    if (draft && draft.numero) {
      setDraftDetected(true)
    }
  }, [])

  const descartarBorrador = () => {
    borrarBorrador()
    setDraftDetected(false)
    form.empezarNueva()
  }

  const handleGeneratePdf = (cotizacion: Cotizacion) => {
    generate(cotizacion)
  }

  return (
    <>
      <Header />

      {draftDetected && (
        <div className="bg-brand-orange-light/60 border-b border-brand-orange-light px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
            <p className="text-brand-dark">
              Borrador recuperado automáticamente.
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={descartarBorrador}>
                Descartar
              </Button>
            </div>
          </div>
        </div>
      )}

      <nav className="lg:hidden flex border-b border-brand-orange-light">
        <button
          onClick={() => setTab('editar')}
          className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${
            tab === 'editar'
              ? 'text-brand-orange border-b-2 border-brand-orange bg-brand-orange-light/20'
              : 'text-brand-gray hover:text-brand-dark'
          }`}
        >
          Editar
        </button>
        <button
          onClick={() => setTab('vistaprevia')}
          className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${
            tab === 'vistaprevia'
              ? 'text-brand-orange border-b-2 border-brand-orange bg-brand-orange-light/20'
              : 'text-brand-gray hover:text-brand-dark'
          }`}
        >
          Vista previa
        </button>
      </nav>

      <PageContainer>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={tab === 'vistaprevia' ? 'hidden lg:block' : ''}>
            <QuoteForm form={form} />
          </div>

          <div className={`lg:sticky lg:top-6 lg:self-start ${tab === 'editar' ? 'hidden lg:block' : ''}`}>
            <QuotePreview
              control={form.control}
              onGeneratePdf={handleGeneratePdf}
              generating={generating}
              pdfError={pdfError}
            />
          </div>
        </div>
      </PageContainer>

      <Footer />
    </>
  )
}

export default App
