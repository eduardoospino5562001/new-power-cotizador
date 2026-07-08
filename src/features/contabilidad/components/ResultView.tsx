import type { GeneratedResult } from '../hooks/useComprobantesForm'
import { Card, Button } from '@/components/ui'
import { Download, ArrowLeft, AlertTriangle } from 'lucide-react'

interface ResultViewProps {
  result: GeneratedResult
  onDownload: () => void
  onBack: () => void
}

export function ResultView({ result, onDownload, onBack }: ResultViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft size={16} className="mr-1" /> Volver
        </Button>
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
            <p className="font-semibold text-brand-dark">Registros</p>
            <p className="text-brand-gray">{result.rows.length} filas</p>
          </div>
          <div>
            <p className="font-semibold text-brand-dark">Consecutivo</p>
            <p className="text-brand-gray">{result.startConsecutive} - {result.startConsecutive + result.rows.length - 1}</p>
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

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-brand-orange-light">
                <th className="text-left p-2 font-bold">#</th>
                <th className="text-left p-2 font-bold">Lote</th>
                <th className="text-left p-2 font-bold">Fecha</th>
                <th className="text-left p-2 font-bold">Medio</th>
                <th className="text-right p-2 font-bold">Monto</th>
                <th className="text-left p-2 font-bold">Etiqueta</th>
                <th className="text-center p-2 font-bold">Cuota</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row, i) => {
                const consecutive = result.startConsecutive + i
                return (
                  <tr key={i} className={i < result.rows.length - 1 ? 'border-b border-brand-orange-light/50' : ''}>
                    <td className="p-2 align-top font-mono">{consecutive}</td>
                    <td className="p-2 align-top font-mono">{row.lot}</td>
                    <td className="p-2 align-top whitespace-nowrap">
                      {row.date.toLocaleDateString('es-CO')}
                    </td>
                    <td className="p-2 align-top">{row.medium}</td>
                    <td className="p-2 align-top text-right font-mono">
                      ${row.amount.toLocaleString('es-CO')}
                    </td>
                    <td className="p-2 align-top">{row.label || '—'}</td>
                    <td className="p-2 align-top text-center">
                      {row.installment !== null ? (row.installment === 0 ? 'Inicial/Contado' : `Cuota ${row.installment}`) : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-xs text-brand-gray text-center">
          Total: {result.rows.length} registros &middot; {result.rows.length * 2} líneas contables (débito + crédito)
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
