import { useState } from 'react'
import type { GeneratedResult } from '../hooks/useComprobantesForm'
import { Card, Button } from '@/components/ui'
import { Download, ArrowLeft, ArrowRight, AlertTriangle } from 'lucide-react'

interface ResultViewProps {
  result: GeneratedResult
  onDownload: () => void
  onBack: () => void
}

const COLUMN_PAGES = [
  {
    label: 'Consecutivo y tipo',
    cols: [
      { key: 'consecutive', header: 'Consec.', width: 'w-16', render: (r: any) => r.consecutive },
      { key: 'type', header: 'Tipo', width: 'w-16', render: (r: any) => r.type },
    ],
  },
  {
    label: 'Fecha y moneda',
    cols: [
      { key: 'date', header: 'Fecha', width: 'w-24', render: (r: any) => r.date.toLocaleDateString('es-CO') },
      { key: 'currency', header: 'Moneda', width: 'w-14', render: () => 'COP' },
    ],
  },
  {
    label: 'Cuenta y tercero',
    cols: [
      { key: 'account', header: 'Cuenta', width: 'w-24', render: (r: any) => r.account },
      { key: 'thirdId', header: 'Tercero', width: 'w-20', render: (r: any) => r.thirdId || '—' },
    ],
  },
  {
    label: 'Documento',
    cols: [
      { key: 'docType', header: 'Tipo Doc.', width: 'w-16', render: (r: any) => r.docType || '—' },
      { key: 'receipt', header: 'Recibo', width: 'w-18', render: (r: any) => r.receipt || '—' },
      { key: 'installment', header: 'Cuota', width: 'w-14', render: (r: any) => {
        if (r.installment === null || r.installment === undefined) return '—'
        return r.installment === 0 ? 'Inicial' : `N° ${r.installment}`
      }},
    ],
  },
  {
    label: 'Vencimiento y descripción',
    cols: [
      { key: 'dueDate', header: 'Vence', width: 'w-24', render: (r: any) => r.dueDate ? r.dueDate.toLocaleDateString('es-CO') : '—' },
      { key: 'description', header: 'Descripción', width: 'w-48', render: (r: any) => r.description || '—' },
    ],
  },
  {
    label: 'Monto',
    cols: [
      { key: 'amount', header: 'Monto', width: 'w-28 text-right', render: (r: any) => `$${r.amount.toLocaleString('es-CO')}` },
    ],
  },
]

export function ResultView({ result, onDownload, onBack }: ResultViewProps) {
  const [pageIndex, setPageIndex] = useState(0)
  const currentPage = COLUMN_PAGES[pageIndex]

  const totalPages = COLUMN_PAGES.length
  const hasPrev = pageIndex > 0
  const hasNext = pageIndex < totalPages - 1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft size={16} className="mr-1" /> Volver
          </Button>
          <span className="text-sm text-brand-gray hidden sm:inline">
            {result.rows.length} registros &middot; {result.outputRows.length} líneas contables
          </span>
        </div>
        <Button onClick={onDownload}>
          <Download size={16} className="mr-1" /> Descargar Excel
        </Button>
      </div>

      <Card className="border-2 border-brand-orange shadow-md">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-brand-dark tracking-tight">COMPROBANTES CONTABLES</h2>
          <p className="text-sm text-brand-gray">Resultado de la generación</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-sm">
          <div>
            <p className="font-semibold text-brand-dark">Proyecto</p>
            <p className="text-brand-gray">{result.project}</p>
          </div>
          <div>
            <p className="font-semibold text-brand-dark">Período</p>
            <p className="text-brand-gray">{String(result.month).padStart(2, '0')} / {result.year}</p>
          </div>
          <div>
            <p className="font-semibold text-brand-dark">Registros origen</p>
            <p className="text-brand-gray">{result.rows.length} filas</p>
          </div>
          <div>
            <p className="font-semibold text-brand-dark">Líneas contables</p>
            <p className="text-brand-gray">{result.outputRows.length} (débito + crédito)</p>
          </div>
        </div>

        {result.skippedMissingAmount > 0 && (
          <div className="flex items-start gap-2 p-3 mb-4 bg-amber-50 border border-amber-200 rounded-lg text-sm">
            <AlertTriangle size={18} className="text-amber-600 mt-0.5 shrink-0" />
            <p className="text-amber-700">
              Se omitieron {result.skippedMissingAmount} filas sin monto.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <Button
            variant="ghost"
            size="sm"
            disabled={!hasPrev}
            onClick={() => setPageIndex(pageIndex - 1)}
          >
            <ArrowLeft size={16} className="mr-1" /> Anterior
          </Button>
          <span className="text-xs font-semibold text-brand-dark">
            {currentPage.label}
            <span className="text-brand-gray font-normal ml-1">
              ({pageIndex + 1} / {totalPages})
            </span>
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={!hasNext}
            onClick={() => setPageIndex(pageIndex + 1)}
          >
            Siguiente <ArrowRight size={16} className="ml-1" />
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-brand-orange-light">
                <th className="text-center p-2 font-bold w-10">#</th>
                {currentPage.cols.map((col) => (
                  <th key={col.key} className={`text-left p-2 font-bold ${col.width}`}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.outputRows.map((row, i) => (
                <tr key={i} className={
                  i < result.outputRows.length - 1 ? 'border-b border-brand-orange-light/50' : ''
                }>
                  <td className="p-2 text-center font-mono text-brand-gray">{i + 1}</td>
                  {currentPage.cols.map((col) => (
                    <td key={col.key} className={`p-2 align-top font-mono ${row.type === 'Crédito' ? 'text-brand-gray' : ''}`}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-brand-gray">
            Página {pageIndex + 1} de {totalPages} &middot; {result.outputRows.length} líneas
          </span>
          <div className="flex gap-1">
            {COLUMN_PAGES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setPageIndex(idx)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === pageIndex ? 'bg-brand-orange' : 'bg-brand-orange-light'
                }`}
              />
            ))}
          </div>
        </div>
      </Card>

      <div className="flex justify-center">
        <Button onClick={onDownload}>
          <Download size={16} className="mr-1" /> Descargar Excel
        </Button>
      </div>
    </div>
  )
}
