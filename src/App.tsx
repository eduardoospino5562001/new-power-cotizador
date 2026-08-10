import { useState, useEffect, useCallback } from 'react'
import { Header, Footer, PageContainer } from '@/components/layout'
import { Button, Card } from '@/components/ui'
import { ChevronLeft, ChevronRight, FileText, Receipt, Calculator, FileSignature, Search, Truck } from 'lucide-react'
import { HistoryPage } from '@/features/history/HistoryPage'

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
import type { HistoryRecord } from '@/features/history/historyStore'

type Modulo = 'home' | 'quote' | 'report' | 'contabilidad' | 'contrato' | 'remision' | 'history'

function App() {
  const [modulo, setModulo] = useState<Modulo>('home')
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('npc-theme') !== 'light')
  const [toolQuery, setToolQuery] = useState('')
  const [toolPage, setToolPage] = useState(0)

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light'
    localStorage.setItem('npc-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

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

  const tools = [
    { module: 'quote' as const, title: 'Nueva cotización', description: 'Ítems, impuestos y totales.', icon: Receipt },
    { module: 'report' as const, title: 'Nuevo informe técnico', description: 'Registro fotográfico y observaciones.', icon: FileText },
    { module: 'contabilidad' as const, title: 'Herramientas contables', description: 'Comprobantes desde Excel.', icon: Calculator },
    { module: 'contrato' as const, title: 'Contrato de compraventa', description: 'Cláusulas, condiciones y firmas.', icon: FileSignature },
    { module: 'remision' as const, title: 'Remisión', description: 'Detalle de entrega y firmas.', icon: Truck },
  ]
  const filteredTools = tools.filter((tool) => tool.title.toLowerCase().includes(toolQuery.trim().toLowerCase()))
  const toolPages = Math.max(1, Math.ceil(filteredTools.length / 4))
  const visibleTools = filteredTools.slice(toolPage * 4, toolPage * 4 + 4)

  const resumeHistoryRecord = (record: HistoryRecord) => {
    if (!record.isEditable || !record.editableData || !record.moduleId) return
    if (record.moduleId === 'quote') {
      quoteForm.reset(record.editableData as CotizacionFormData)
      setDraftQuote(false)
      setModulo('quote')
    } else if (record.moduleId === 'report') {
      reportForm.reset(record.editableData as InformeFormData)
      setDraftReport(false)
      setModulo('report')
    } else if (record.moduleId === 'contract') {
      contratoForm.reset(record.editableData as ContratoFormData)
      setDraftContrato(false)
      setModulo('contrato')
    } else if (record.moduleId === 'remision') {
      remisionForm.reset(record.editableData as RemisionFormData)
      setDraftRemision(false)
      setModulo('remision')
    }
  }

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
        <Header onHome={irAHome} onHistory={() => setModulo('history')} darkMode={darkMode} onToggleTheme={() => setDarkMode((value) => !value)} />
        <PageContainer>
          <div className="mx-auto max-w-6xl py-5 sm:py-10">
            <div className="mb-6 flex flex-col gap-4 border-b border-brand-orange-light pb-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-orange">Centro de documentos</p><label className="relative block w-full sm:max-w-xs"><Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray" size={18} /><input value={toolQuery} onChange={(event) => { setToolQuery(event.target.value); setToolPage(0) }} placeholder="Buscar herramienta" className="w-full rounded-lg border border-brand-orange-light bg-white py-2.5 pl-10 pr-3 text-sm text-brand-dark outline-none focus:ring-2 focus:ring-brand-orange" /></label></div>
            <div className="flex snap-x gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible">
              {visibleTools.map((tool) => { const Icon = tool.icon; return <button key={tool.module} onClick={() => setModulo(tool.module)} className="w-[84vw] shrink-0 snap-start text-left sm:w-auto"><Card className="h-full min-h-52 p-7 shadow-none transition-colors hover:border-brand-orange hover:bg-brand-light sm:p-8"><div className="mb-9 flex size-12 items-center justify-center rounded-lg bg-brand-orange-light text-brand-orange-dark"><Icon size={29} /></div><h3 className="mb-2 text-lg font-bold text-brand-dark">{tool.title}</h3><p className="text-sm text-brand-gray">{tool.description}</p></Card></button> })}
              {visibleTools.length === 0 && <Card className="w-full py-12 text-center sm:col-span-2"><p className="text-sm text-brand-gray">No encontramos herramientas con ese nombre.</p></Card>}
            </div>
            {filteredTools.length > 4 && <div className="mt-6 flex items-center justify-center gap-3"><Button type="button" variant="secondary" size="sm" disabled={toolPage === 0} onClick={() => setToolPage(toolPage - 1)} aria-label="Ver herramientas anteriores"><ChevronLeft size={18} /><span className="hidden sm:inline">Anterior</span></Button><span className="min-w-10 text-center text-sm text-brand-gray">{toolPage + 1} / {toolPages}</span><Button type="button" variant="secondary" size="sm" disabled={toolPage >= toolPages - 1} onClick={() => setToolPage(toolPage + 1)} aria-label="Ver siguientes herramientas"><span className="hidden sm:inline">Siguiente</span><ChevronRight size={18} /></Button></div>}
          </div>
        </PageContainer>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header onHome={irAHome} onHistory={() => setModulo('history')} darkMode={darkMode} onToggleTheme={() => setDarkMode((value) => !value)} />

      {modulo === 'quote' && draftQuote && (
        <div className="px-4 py-3 lg:ml-64 lg:px-10">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 rounded-xl border border-brand-orange-light bg-brand-light px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-brand-dark">Borrador de cotización recuperado automáticamente.</p>
            <Button variant="ghost" size="sm" onClick={descartarBorradorQuote}>Descartar</Button>
          </div>
        </div>
      )}

      {modulo === 'report' && draftReport && (
        <div className="px-4 py-3 lg:ml-64 lg:px-10">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 rounded-xl border border-brand-orange-light bg-brand-light px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-brand-dark">Borrador de informe recuperado automáticamente.</p>
            <Button variant="ghost" size="sm" onClick={descartarBorradorReport}>Descartar</Button>
          </div>
        </div>
      )}

      {modulo === 'contrato' && draftContrato && (
        <div className="px-4 py-3 lg:ml-64 lg:px-10">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 rounded-xl border border-brand-orange-light bg-brand-light px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-brand-dark">Borrador de contrato recuperado automáticamente.</p>
            <Button variant="ghost" size="sm" onClick={descartarBorradorContrato}>Descartar</Button>
          </div>
        </div>
      )}

      {modulo === 'remision' && draftRemision && (
        <div className="px-4 py-3 lg:ml-64 lg:px-10">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 rounded-xl border border-brand-orange-light bg-brand-light px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
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

      {modulo === 'history' && <PageContainer><HistoryPage onResume={resumeHistoryRecord} /></PageContainer>}

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
