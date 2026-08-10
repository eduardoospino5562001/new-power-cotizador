import { useState } from 'react'
import type { GeneratedResult } from '../hooks/useComprobantesForm'
import type { OutputRow } from '../types'
import { Card, Button } from '@/components/ui'
import { Download, ChevronLeft, ChevronRight } from 'lucide-react'

interface ResultViewProps {
  result: GeneratedResult
  onDownload: () => void
}

const ROWS_PER_PAGE = 10

const COLUMNS: { key: keyof OutputRow; header: string; width: string; render: (r: OutputRow) => string | number | null }[] = [
  { key: 'tipoComprobante', header: 'Tipo comprobante', width: 'w-20', render: (r) => r.tipoComprobante },
  { key: 'consecutivo', header: 'Consecutivo comprobante', width: 'w-20', render: (r) => r.consecutivo },
  { key: 'fechaElaboracion', header: 'Fecha de elaboración', width: 'w-24', render: (r) => r.fechaElaboracion.toLocaleDateString('es-CO') },
  { key: 'siglaMoneda', header: 'Sigla moneda', width: 'w-14', render: (r) => r.siglaMoneda },
  { key: 'tasaCambio', header: 'Tasa de cambio', width: 'w-14', render: () => '' },
  { key: 'codigoCuenta', header: 'Código cuenta contable', width: 'w-24', render: (r) => String(r.codigoCuenta) },
  { key: 'identificacionTercero', header: 'Identificación tercero', width: 'w-20', render: (r) => r.identificacionTercero ?? '' },
  { key: 'sucursal', header: 'Sucursal', width: 'w-14', render: () => '' },
  { key: 'codigoProducto', header: 'Código producto', width: 'w-14', render: () => '' },
  { key: 'codigoBodega', header: 'Código bodega', width: 'w-14', render: () => '' },
  { key: 'accion', header: 'Acción', width: 'w-14', render: () => '' },
  { key: 'cantidadProducto', header: 'Cantidad producto', width: 'w-14', render: () => '' },
  { key: 'prefijo', header: 'Prefijo', width: 'w-14', render: (r) => r.prefijo ?? '' },
  { key: 'reciboConsecutivo', header: 'Consecutivo', width: 'w-16', render: (r) => r.reciboConsecutivo ?? '' },
  { key: 'numeroCuota', header: 'No. cuota', width: 'w-14', render: (r) => r.numeroCuota !== null ? r.numeroCuota : '' },
  { key: 'fechaVencimiento', header: 'Fecha vencimiento', width: 'w-24', render: (r) => r.fechaVencimiento ? r.fechaVencimiento.toLocaleDateString('es-CO') : '' },
  { key: 'codigoImpuesto', header: 'Código impuesto', width: 'w-14', render: () => '' },
  { key: 'codigoGrupoActivo', header: 'Código grupo activo', width: 'w-14', render: () => '' },
  { key: 'codigoActivoFijo', header: 'Código activo fijo', width: 'w-14', render: () => '' },
  { key: 'descripcion', header: 'Descripción', width: 'w-48', render: (r) => r.descripcion },
  { key: 'codigoCentroCostos', header: 'Código centro costos', width: 'w-20', render: () => '' },
  { key: 'debito', header: 'Débito', width: 'w-24', render: (r) => r.debito !== null ? `$${r.debito.toLocaleString('es-CO')}` : '' },
  { key: 'credito', header: 'Crédito', width: 'w-24', render: (r) => r.credito !== null ? `$${r.credito.toLocaleString('es-CO')}` : '' },
  { key: 'observaciones', header: 'Observaciones', width: 'w-14', render: () => '' },
  { key: 'baseGravable', header: 'Base gravable', width: 'w-20', render: () => '' },
  { key: 'baseExenta', header: 'Base exenta', width: 'w-20', render: () => '' },
  { key: 'mesCierre', header: 'Mes de cierre', width: 'w-14', render: () => '' },
]

const COL_PAGES = [
  { label: 'Comp. y fecha', cols: COLUMNS.slice(0, 4) },
  { label: 'Cuenta y tercero', cols: COLUMNS.slice(4, 7) },
  { label: 'Producto', cols: COLUMNS.slice(7, 12) },
  { label: 'Documento', cols: COLUMNS.slice(12, 16) },
  { label: 'Activos', cols: COLUMNS.slice(16, 19) },
  { label: 'Descripción y débito', cols: COLUMNS.slice(19, 23) },
  { label: 'Otros', cols: COLUMNS.slice(23, 27) },
]

export function ResultView({ result, onDownload }: ResultViewProps) {
  const [page, setPage] = useState(0)
  const totalPages = Math.ceil(result.outputRows.length / ROWS_PER_PAGE)
  const paginatedRows = result.outputRows.slice(page * ROWS_PER_PAGE, (page + 1) * ROWS_PER_PAGE)

  const [colPage, setColPage] = useState(0)
  const currentCols = COL_PAGES[colPage].cols

  return (
    <div className="space-y-6">
      <Card className="border-2 border-brand-orange shadow-md">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-brand-dark tracking-tight">VISOR DE EXCEL</h2>
          <p className="text-sm text-brand-gray">
            {result.outputRows.length} líneas contables &middot; Página {page + 1} de {totalPages}
          </p>
        </div>

        <div className="mb-3 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between gap-2 sm:justify-start">
            <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => setPage(Math.max(0, page - 1))}>
              <ChevronLeft size={16} />
            </Button>
            <span className="font-semibold text-brand-dark min-w-16 text-center">
              {page + 1} / {totalPages}
            </span>
            <Button variant="ghost" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(Math.min(totalPages - 1, page + 1))}>
              <ChevronRight size={16} />
            </Button>
          </div>
          <div className="flex items-center justify-between gap-2 sm:justify-start">
            <Button variant="ghost" size="sm" disabled={colPage === 0} onClick={() => setColPage(colPage - 1)}>
              <ChevronLeft size={16} />
            </Button>
            <span className="text-brand-gray text-xs">{COL_PAGES[colPage].label}</span>
            <Button variant="ghost" size="sm" disabled={colPage >= COL_PAGES.length - 1} onClick={() => setColPage(colPage + 1)}>
              <ChevronRight size={16} />
            </Button>
          </div>
          <Button size="sm" onClick={onDownload}>
            <Download size={14} className="mr-1" /> Descargar
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-brand-orange-light">
                <th className="text-center p-1.5 font-bold w-8 sticky left-0 bg-brand-orange-light z-10">#</th>
                {currentCols.map((col) => (
                  <th key={col.key} className={`text-left p-1.5 font-bold whitespace-nowrap ${col.width}`}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((row, i) => {
                const globalIdx = page * ROWS_PER_PAGE + i
                return (
                  <tr key={globalIdx} className={globalIdx < result.outputRows.length - 1 ? 'border-b border-brand-orange-light/30' : ''}>
                    <td className="p-1.5 text-center font-mono text-brand-gray text-[10px] sticky left-0 bg-white z-10">{globalIdx + 1}</td>
                    {currentCols.map((col) => (
                      <td key={col.key} className={`p-1.5 align-top font-mono text-[11px] whitespace-nowrap ${row.credito !== null ? 'text-brand-gray' : ''}`}>
                        {col.render(row)}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex flex-col gap-3 text-xs text-brand-gray sm:flex-row sm:items-center sm:justify-between">
          <span>Mostrando {paginatedRows.length} de {result.outputRows.length} líneas</span>
          <div className="flex gap-1">
            {COL_PAGES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setColPage(idx)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === colPage ? 'bg-brand-orange' : 'bg-brand-orange-light'
                }`}
              />
            ))}
          </div>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === page ? 'bg-brand-orange' : 'bg-brand-orange-light'
                }`}
              />
            ))}
            {totalPages > 5 && <span className="text-[10px]">...</span>}
          </div>
        </div>
      </Card>
    </div>
  )
}
