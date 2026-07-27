import { useState, useEffect, useCallback } from 'react'
import { Header, Footer, PageContainer } from '@/components/layout'
import { Button, Card } from '@/components/ui'
import { FileText, Receipt, Calculator, Home, FileSignature, Truck } from 'lucide-react'

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

import { useContractForm } from '@/features/contrato/hooks/useContractForm'
import { useGenerateContractPdf } from '@/features/contrato/hooks/useGenerateContractPdf'
import { ContractForm } from '@/features/contrato/components/ContractForm'
import { ContractPreview } from '@/features/contrato/components/ContractPreview'
import { cargarBorrador as cargarBorradorContrato, borrarBorrador as borrarBorradorContrato } from '@/features/contrato/lib/storage'
import type { ContratoFormData } from '@/features/contrato/logic/validation'
import type { ContratoCompraventa } from '@/features/contrato/types'

import { useRemisionForm } from '@/features/remision/hooks/useRemisionForm'
import { useGenerateRemisionPdf } from '@/features/remision/hooks/useGenerateRemisionPdf'
import { RemisionForm } from '@/features/remision/components/RemisionForm'
import { RemisionPreview } from '@/features/remision/components/RemisionPreview'
import { cargarBorrador as cargarBorradorRemision, borrarBorrador as borrarBorradorRemision } from '@/features/remision/lib/storage'
import type { RemisionFormData } from '@/features/remision/logic/validation'
import type { Remision } from '@/features/remision/types'

type Modulo = 'home' | 'quote' | 'report' | 'contabilidad' | 'contrato' | 'remision'

function App() {
  const [modulo, setModulo] = useState<Modulo>('home')

  const quoteForm = useQuoteForm()
  const { generate: generateQuote, generating: generatingQuote, error: pdfErrorQuote } = useGeneratePdf()
  const [draftQuote, setDraftQuote] = useState(false)

  const reportForm = useReportForm()
  const { generate: generateReport, generating: generatingReport, error: pdfErrorReport } = useGenerateReportPdf()
  const [draftReport, setDraftReport] = useState(false)

  const contratoForm = useContractForm()
  const { generate: generateContrato, generating: generatingContrato, error: pdfErrorContrato } = useGenerateContractPdf()
  const [draftContrato, setDraftContrato] = useState(false)

  const remisionForm = useRemisionForm()
  const { generate: generateRemision, generating: generatingRemision, error: pdfErrorRemision } = useGenerateRemisionPdf()
  const [draftRemision, setDraftRemision] = useState(false)

  useEffect(() => {
    const q = cargarBorradorQuote<CotizacionFormData>()
    if (q && q.numero) setDraftQuote(true)

    cargarBorradorReport<InformeFormData>().then((r) => {
      if (r && r.fecha) setDraftReport(true)
    })

    const c = cargarBorradorContrato<ContratoFormData>()
    if (c && c.numero) setDraftContrato(true)

    const r = cargarBorradorRemision<RemisionFormData>()
    if (r && r.numero) setDraftRemision(true)
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

  const descartarBorradorContrato = () => {
    borrarBorradorContrato()
    setDraftContrato(false)
    contratoForm.empezarNueva()
  }

  const descartarBorradorRemision = () => {
    borrarBorradorRemision()
    setDraftRemision(false)
    remisionForm.empezarNueva()
  }

  const handleGenerateQuotePdf = (cotizacion: Cotizacion) => {
    generateQuote(cotizacion)
  }

  const handleGenerateReportPdf = (informe: InformeTecnico) => {
    generateReport(informe)
  }

  const handleGenerateContratoPdf = (data: ContratoFormData) => {
    const contrato: ContratoCompraventa = {
      numero: data.numero,
      fecha: data.fecha,
      vendedor: data.vendedor,
      comprador: data.comprador,
      grupos: (data.grupos || []).map((g) => ({
        id: g.id,
        nombre: g.nombre || '',
        items: (g.items || []).map((e) => ({
          id: e.id,
          nombre: e.nombre,
          valor: e.valor ?? '',
        })),
      })),
      clausulas: (data.clausulas || []).map((c) => ({
        id: c.id,
        titulo: c.titulo,
        texto: c.texto ?? '',
      })),
      economico: {
        valorTotal: Number(data.economico.valorTotal) || 0,
        pagoInicial: Number(data.economico.pagoInicial) || 0,
        saldo: Number(data.economico.saldo) || 0,
        fechaLimite: data.economico.fechaLimite || '',
      },
      observaciones: data.observaciones || '',
    }
    generateContrato(contrato)
  }

  const handleGenerateRemisionPdf = (data: RemisionFormData) => {
    const remision: Remision = {
      numero: data.numero,
      fecha: data.fecha,
      pedido: data.pedido || '',
      contrato: data.contrato || '',
      cliente: {
        nombre: data.cliente.nombre,
        ccNit: data.cliente.ccNit,
        direccion: data.cliente.direccion || '',
        ciudad: data.cliente.ciudad || '',
        telefono: data.cliente.telefono || '',
      },
      logistica: (data.logistica || []).map((l) => ({
        id: l.id,
        nombre: l.nombre,
        valor: l.valor ?? '',
      })),
      detalles: (data.detalles || []).map((d) => ({
        id: d.id,
        cantidad: d.cantidad || '',
        codigo: d.codigo || '',
        descripcion: d.descripcion || '',
        serial: d.serial || '',
        observaciones: d.observaciones || '',
      })),
      observaciones: data.observaciones || '',
      entrega: {
        firma: '',
        nombre: data.entrega?.nombre || '',
        cargo: data.entrega?.cargo || '',
        documento: data.entrega?.documento || '',
        fecha: data.entrega?.fecha || '',
        hora: data.entrega?.hora || '',
      },
      recibe: {
        firma: '',
        nombre: data.recibe?.nombre || '',
        cargo: data.recibe?.cargo || '',
        documento: data.recibe?.documento || '',
        fecha: data.recibe?.fecha || '',
        hora: data.recibe?.hora || '',
      },
    }
    generateRemision(remision)
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 w-full max-w-7xl">
              <button onClick={() => setModulo('quote')} className="group w-full h-full">
                <Card className="p-8 text-center hover:border-brand-orange hover:shadow-lg transition-all cursor-pointer h-full flex flex-col">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-orange-light flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Receipt size={32} className="text-brand-orange-dark" />
                  </div>
                  <h3 className="text-lg font-bold text-brand-dark mb-2">Nueva cotización</h3>
                  <p className="text-sm text-brand-gray">Genera una cotización profesional con ítems, impuestos y totales</p>
                </Card>
              </button>
              <button onClick={() => setModulo('report')} className="group w-full h-full">
                <Card className="p-8 text-center hover:border-brand-orange hover:shadow-lg transition-all cursor-pointer h-full flex flex-col">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-orange-light flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText size={32} className="text-brand-orange-dark" />
                  </div>
                  <h3 className="text-lg font-bold text-brand-dark mb-2">Nuevo informe técnico</h3>
                  <p className="text-sm text-brand-gray">Crea un informe técnico con registro fotográfico y observaciones</p>
                </Card>
              </button>
              <button onClick={() => setModulo('contabilidad')} className="group w-full h-full">
                <Card className="p-8 text-center hover:border-brand-orange hover:shadow-lg transition-all cursor-pointer h-full flex flex-col">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-orange-light flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Calculator size={32} className="text-brand-orange-dark" />
                  </div>
                  <h3 className="text-lg font-bold text-brand-dark mb-2">Herramientas contables</h3>
                  <p className="text-sm text-brand-gray">Genera comprobantes contables desde Excel</p>
                </Card>
              </button>
              <button onClick={() => setModulo('contrato')} className="group w-full h-full">
                <Card className="p-8 text-center hover:border-brand-orange hover:shadow-lg transition-all cursor-pointer h-full flex flex-col">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-orange-light flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileSignature size={32} className="text-brand-orange-dark" />
                  </div>
                  <h3 className="text-lg font-bold text-brand-dark mb-2">Contrato de compraventa</h3>
                  <p className="text-sm text-brand-gray">Genera un contrato de compraventa con cláusulas y firmas</p>
                </Card>
              </button>
              <button onClick={() => setModulo('remision')} className="group w-full h-full">
                <Card className="p-8 text-center hover:border-brand-orange hover:shadow-lg transition-all cursor-pointer h-full flex flex-col">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-orange-light flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Truck size={32} className="text-brand-orange-dark" />
                  </div>
                  <h3 className="text-lg font-bold text-brand-dark mb-2">Remisión</h3>
                  <p className="text-sm text-brand-gray">Genera una remisión con detalle de entrega y firmas</p>
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

      {modulo === 'contrato' && draftContrato && (
        <div className="bg-brand-orange-light/60 border-b border-brand-orange-light px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
            <p className="text-brand-dark">Borrador de contrato recuperado automáticamente.</p>
            <Button variant="ghost" size="sm" onClick={descartarBorradorContrato}>Descartar</Button>
          </div>
        </div>
      )}

      {modulo === 'remision' && draftRemision && (
        <div className="bg-brand-orange-light/60 border-b border-brand-orange-light px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
            <p className="text-brand-dark">Borrador de remisión recuperado automáticamente.</p>
            <Button variant="ghost" size="sm" onClick={descartarBorradorRemision}>Descartar</Button>
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

      {modulo === 'contrato' && (
        <PageContainer>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div><ContractForm form={contratoForm} /></div>
            <div className="lg:sticky lg:top-6 lg:self-start">
              <ContractPreview control={contratoForm.control} onGeneratePdf={handleGenerateContratoPdf} generating={generatingContrato} pdfError={pdfErrorContrato} />
            </div>
          </div>
        </PageContainer>
      )}

      {modulo === 'remision' && (
        <PageContainer>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div><RemisionForm form={remisionForm} /></div>
            <div className="lg:sticky lg:top-6 lg:self-start">
              <RemisionPreview control={remisionForm.control} onGeneratePdf={handleGenerateRemisionPdf} generating={generatingRemision} pdfError={pdfErrorRemision} />
            </div>
          </div>
        </PageContainer>
      )}

      <Footer />
    </>
  )
}

export default App
