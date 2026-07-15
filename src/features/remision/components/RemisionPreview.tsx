import { useWatch } from 'react-hook-form'
import type { Control } from 'react-hook-form'
import type { RemisionFormData } from '../logic/validation'
import { Button } from '@/components/ui'
import { formatDate } from '../lib/format'
import Logo from '@/assets/logo.jpeg'

interface RemisionPreviewProps {
  control: Control<RemisionFormData>
  onGeneratePdf: (data: RemisionFormData) => void
  generating?: boolean
  pdfError?: string | null
}

export function RemisionPreview({ control, onGeneratePdf, generating, pdfError }: RemisionPreviewProps) {
  const data = useWatch({ control }) as RemisionFormData | undefined

  if (!data) return null

  const detalles = data.detalles?.filter((d) => d?.descripcion) ?? []

  return (
    <section className="space-y-6">
      <div className="rounded-xl bg-white border border-brand-orange-light p-6 shadow-sm">
        <div className="flex items-start justify-between border-b-2 border-brand-orange pb-4 mb-6">
          <div className="flex items-center gap-3">
            <img src={Logo} alt="Logo" className="w-16 h-16 object-contain rounded" />
            <div>
              <p className="text-sm font-bold text-brand-dark">NEW POWER ENERGY S.A.S.</p>
              <p className="text-xs text-brand-gray">NIT 901.826.285-6</p>
              <p className="text-xs text-brand-gray">Villavicencio - Meta</p>
              <p className="text-xs text-brand-gray">Teléfono: (57) 3204931541</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold text-brand-orange">REMISIÓN</h2>
            <p className="text-xs text-brand-gray">No. {data.numero}</p>
            <p className="text-xs text-brand-gray">Fecha: {formatDate(data.fecha)}</p>
            {data.pedido && <p className="text-xs text-brand-gray">Pedido: {data.pedido}</p>}
            {data.contrato && <p className="text-xs text-brand-gray">Contrato: {data.contrato}</p>}
          </div>
        </div>

        <div className="bg-brand-light p-3 rounded mb-6">
          <p className="text-xs font-bold text-brand-gray uppercase mb-1">CLIENTE</p>
          <p className="text-sm font-semibold text-brand-dark">{data.cliente?.nombre || '—'}</p>
          <p className="text-xs text-brand-gray">CC/NIT: {data.cliente?.ccNit || '—'}</p>
          {data.cliente?.direccion && <p className="text-xs text-brand-gray">Dirección: {data.cliente.direccion}</p>}
          {data.cliente?.ciudad && <p className="text-xs text-brand-gray">Ciudad: {data.cliente.ciudad}</p>}
          {data.cliente?.telefono && <p className="text-xs text-brand-gray">Teléfono: {data.cliente.telefono}</p>}
        </div>

        <div className="bg-brand-light p-3 rounded mb-6">
          <p className="text-xs font-bold text-brand-gray uppercase mb-1">INFORMACIÓN LOGÍSTICA</p>
          <p className="text-xs text-brand-gray">Lugar despacho: {data.logistica?.lugarDespacho || '—'}</p>
          <p className="text-xs text-brand-gray">Lugar entrega: {data.logistica?.lugarEntrega || '—'}</p>
          {data.logistica?.responsableTransporte && <p className="text-xs text-brand-gray">Responsable: {data.logistica.responsableTransporte}</p>}
          {data.logistica?.vehiculo && <p className="text-xs text-brand-gray">Vehículo: {data.logistica.vehiculo}</p>}
          {data.logistica?.placa && <p className="text-xs text-brand-gray">Placa: {data.logistica.placa}</p>}
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-bold text-brand-dark mb-3 border-b border-brand-orange-light pb-1">DETALLE DE ENTREGA</h3>
          {detalles.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-brand-orange-light text-left">
                    <th className="p-2 font-bold text-brand-dark w-[10%]">Cant.</th>
                    <th className="p-2 font-bold text-brand-dark w-[15%]">Código</th>
                    <th className="p-2 font-bold text-brand-dark w-[30%]">Descripción</th>
                    <th className="p-2 font-bold text-brand-dark w-[20%]">Serial</th>
                    <th className="p-2 font-bold text-brand-dark w-[25%]">Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {detalles.map((det) => (
                    <tr key={det.id} className="border-b border-brand-orange-light">
                      <td className="p-2 text-brand-dark">{det.cantidad}</td>
                      <td className="p-2 text-brand-dark">{det.codigo}</td>
                      <td className="p-2 text-brand-dark font-medium">{det.descripcion}</td>
                      <td className="p-2 text-brand-gray">{det.serial || '—'}</td>
                      <td className="p-2 text-brand-gray">{det.observaciones || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-brand-gray italic">No hay items en el detalle de entrega.</p>
          )}
        </div>

        {data.observaciones && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-brand-dark mb-2 border-b border-brand-orange-light pb-1">OBSERVACIONES</h3>
            <p className="text-xs text-brand-gray whitespace-pre-wrap">{data.observaciones}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-8 mt-8 pt-4 border-t border-brand-orange-light">
          <div>
            <p className="text-xs font-bold text-brand-gray uppercase mb-3">ENTREGA</p>
            <div className="border-b border-brand-dark h-6 mb-1" /><p className="text-xs text-brand-gray mb-1">Firma</p>
            <p className="text-xs text-brand-gray">Nombre: {data.entrega?.nombre || '—'}</p>
            <p className="text-xs text-brand-gray">Cargo: {data.entrega?.cargo || '—'}</p>
            <p className="text-xs text-brand-gray">Documento: {data.entrega?.documento || '—'}</p>
            <p className="text-xs text-brand-gray">Fecha: {data.entrega?.fecha || '—'}</p>
            <p className="text-xs text-brand-gray">Hora: {data.entrega?.hora || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-brand-gray uppercase mb-3">RECIBE</p>
            <div className="border-b border-brand-dark h-6 mb-1" /><p className="text-xs text-brand-gray mb-1">Firma</p>
            <p className="text-xs text-brand-gray">Nombre: {data.recibe?.nombre || '—'}</p>
            <p className="text-xs text-brand-gray">Cargo: {data.recibe?.cargo || '—'}</p>
            <p className="text-xs text-brand-gray">Documento: {data.recibe?.documento || '—'}</p>
            <p className="text-xs text-brand-gray">Fecha: {data.recibe?.fecha || '—'}</p>
            <p className="text-xs text-brand-gray">Hora: {data.recibe?.hora || '—'}</p>
          </div>
        </div>
      </div>

      {pdfError && (
        <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-3">
          Error al generar PDF: {pdfError}
        </div>
      )}

      <Button className="w-full" size="lg" onClick={() => onGeneratePdf(data)} disabled={generating}>
        {generating ? 'Generando PDF...' : 'Generar PDF'}
      </Button>
    </section>
  )
}
