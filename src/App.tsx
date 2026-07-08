import { useState, useEffect, useCallback } from 'react'
import { Header, Footer, PageContainer } from '@/components/layout'
import { Button, Card } from '@/components/ui'
import { FileText, Receipt, Calculator, Home } from 'lucide-react'

import { useQuoteForm } from '@/features/quote/hooks/useQuoteForm'
import { useGeneratePdf } from '@/features/quote/hooks/useGeneratePdf'
import { QuoteForm } from '@/features/quote/components/QuoteForm'
import { QuotePreview } from '@/features/quote/components/QuotePreview'
import { cargarBorrador as cargarBorradorQuote, borrarBorrador as borrarBorradorQuote } from '@/features/quote/lib/storage'
import type { CotizacionFormData } from '@/features/quote/logic/validation'
import type { Cotizacion } from '@/features/quote/types'

import { useReportForm } from '@/features/report/hooks/useReportForm'
import { useGenerateReportPdf } from '@/features/report/hooks/useGenerateReportPdf'
import { ReportForm } from '@/features/report/components/ReportForm'
import { ReportPreview } from '@/features/report/components/ReportPreview'
import { cargarBorrador as cargarBorradorReport, borrarBorrador as borrarBorradorReport } from '@/features/report/lib/storage'
import type { InformeFormData } from '@/features/report/logic/validation'
import type { InformeTecnico } from '@/features/report/types'

import { Contabilidad } from '@/features/contabilidad/Contabilidad'

type Modulo = 'home' | 'quote' | 'report' | 'contabilidad'

function App() {
  const [modulo, setModulo] = useState<Modulo>('home')

  const quoteForm = useQuoteForm()
  const { generate: generateQuote, generating: generatingQuote, error: pdfErrorQuote } = useGeneratePdf()
  const [draftQuote, setDraftQuote] = useState(false)

  const reportForm = useReportForm()
  const { generate: generateReport, generating: generatingReport, error: pdfErrorReport } = useGenerateReportPdf()
  const [draftReport, setDraftReport] = useState(false)

  useEffect(() => {
    const q = cargarBorradorQuote<CotizacionFormData>()
    if (q && q.numero) setDraftQuote(true)

    cargarBorradorReport<InformeFormData>().then((r) => {
      if (r && r.fecha) setDraftReport(true)
    })
  }, [])

  const irAHome = useCallback(() => setModulo('home'), [])

  const descartarBorradorQuote = () => {
    borrarBorradorQuote()
    setDraftQuote(false)
    quoteForm.empezarNueva()
  }

  const descartarBorradorReport = async () => {
    await borrarBorradorReport()
    setDraftReport(false)
    reportForm.empezarNueva()
  }

  const handleGenerateQuotePdf = (cotizacion: Cotizacion) => {
    generateQuote(cotizacion)
  }

  const handleGenerateReportPdf = (informe: InformeTecnico) => {
    generateReport(informe)
  }

  if (modulo === 'home') {
    return (
      <>
        <Header />
        <PageContainer>
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <h2 className="text-2xl font-bold text-brand-dark text-center">
              ¿Qué deseas crear?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl">
              <button onClick={() => setModulo('quote')} className="group">
                <Card className="p-8 text-center hover:border-brand-orange hover:shadow-lg transition-all cursor-pointer">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-orange-light flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Receipt size={32} className="text-brand-orange-dark" />
                  </div>
                  <h3 className="text-lg font-bold text-brand-dark mb-2">Nueva cotización</h3>
                  <p className="text-sm text-brand-gray">Genera una cotización profesional con ítems, impuestos y totales</p>
                </Card>
              </button>
              <button onClick={() => setModulo('report')} className="group">
                <Card className="p-8 text-center hover:border-brand-orange hover:shadow-lg transition-all cursor-pointer">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-orange-light flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText size={32} className="text-brand-orange-dark" />
                  </div>
                  <h3 className="text-lg font-bold text-brand-dark mb-2">Nuevo informe técnico</h3>
                  <p className="text-sm text-brand-gray">Crea un informe técnico con registro fotográfico y observaciones</p>
                </Card>
              </button>
              <button onClick={() => setModulo('contabilidad')} className="group">
                <Card className="p-8 text-center hover:border-brand-orange hover:shadow-lg transition-all cursor-pointer">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-orange-light flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Calculator size={32} className="text-brand-orange-dark" />
                  </div>
                  <h3 className="text-lg font-bold text-brand-dark mb-2">Herramientas contables</h3>
                  <p className="text-sm text-brand-gray">Genera comprobantes contables desde Excel</p>
                </Card>
              </button>
            </div>
          </div>
        </PageContainer>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header>
        <button onClick={irAHome} className="flex items-center gap-1 text-sm text-brand-orange-light hover:text-white transition-colors">
          <Home size={20} />
        </button>
      </Header>

      {modulo === 'quote' && draftQuote && (
        <div className="bg-brand-orange-light/60 border-b border-brand-orange-light px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
            <p className="text-brand-dark">Borrador de cotización recuperado automáticamente.</p>
            <Button variant="ghost" size="sm" onClick={descartarBorradorQuote}>Descartar</Button>
          </div>
        </div>
      )}

      {modulo === 'report' && draftReport && (
        <div className="bg-brand-orange-light/60 border-b border-brand-orange-light px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
            <p className="text-brand-dark">Borrador de informe recuperado automáticamente.</p>
            <Button variant="ghost" size="sm" onClick={descartarBorradorReport}>Descartar</Button>
          </div>
        </div>
      )}

      {modulo === 'quote' && (
        <PageContainer>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div><QuoteForm form={quoteForm} /></div>
            <div className="lg:sticky lg:top-6 lg:self-start">
              <QuotePreview control={quoteForm.control} onGeneratePdf={handleGenerateQuotePdf} generating={generatingQuote} pdfError={pdfErrorQuote} />
            </div>
          </div>
        </PageContainer>
      )}

      {modulo === 'report' && (
        <PageContainer>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div><ReportForm form={reportForm} /></div>
            <div className="lg:sticky lg:top-6 lg:self-start">
              <ReportPreview control={reportForm.control} onGeneratePdf={handleGenerateReportPdf} generating={generatingReport} pdfError={pdfErrorReport} />
            </div>
          </div>
        </PageContainer>
      )}

      {modulo === 'contabilidad' && (
        <PageContainer>
          <Contabilidad />
        </PageContainer>
      )}

      <Footer />
    </>
  )
}

export default App
