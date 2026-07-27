import type { Control } from 'react-hook-form'
import { useWatch } from 'react-hook-form'
import type { CotizacionFormData } from '../logic/validation'
import { calcularTotales } from '../logic/calculations'
import { TotalsSummary } from './TotalsSummary'
import { Card, Button } from '@/components/ui'
import { formatCurrency, formatDate, calcularVencimiento } from '../lib/formatCurrency'
import type { Cotizacion } from '../types'
import { Loader2 } from 'lucide-react'

interface QuotePreviewProps {
  control: Control<CotizacionFormData>
  onGeneratePdf: (cotizacion: Cotizacion) => void
  generating: boolean
  pdfError: string | null
}

export function QuotePreview({ control, onGeneratePdf, generating, pdfError }: QuotePreviewProps) {
  const values = useWatch({ control })

  const numero = values?.numero ?? 'C-1-118'
  const fecha = values?.fecha ?? ''
  const validezDias = Number(values?.validezDias) || 15
  const clienteNombre = values?.cliente?.nombre || '[Nombre del cliente]'
  const clienteNit = values?.cliente?.nit || '[NIT del cliente]'
  const items = values?.items ?? []
  const notas = values?.notas

  const itemsCount = items.filter((it: any) => it?.descripcion?.trim()).length
  const hasItems = itemsCount > 0

  const tot = calcularTotales({
    numero,
    fecha,
    validezDias,
    cliente: {
      nombre: clienteNombre,
      nit: clienteNit,
      ciudad: values?.cliente?.ciudad,
      contacto: values?.cliente?.contacto,
      telefono: values?.cliente?.telefono,
    },
    items: items.map((it: any) => ({
      id: it?.id ?? '',
      descripcion: it?.descripcion ?? '',
      cantidad: Number(it?.cantidad) || 0,
      valorUnitario: Number(it?.valorUnitario) || 0,
      impuestoPorcentaje: Number(it?.impuestoPorcentaje) || 0,
    })),
    descuentoPorcentaje: Number(values?.descuentoPorcentaje) || 0,
    notas: {
      revisionInforme: notas?.revisionInforme ?? '',
      retenciones: notas?.retenciones ?? '',
      accesorios: notas?.accesorios ?? '',
    },
    vendedor: values?.vendedor,
  })

  const vencimiento = calcularVencimiento(fecha, validezDias)

  const handleGenerate = () => {
    if (!hasItems || generating) return

    const cotizacion: Cotizacion = {
      numero,
      fecha,
      validezDias,
      cliente: {
        nombre: clienteNombre,
        nit: clienteNit,
        ciudad: values?.cliente?.ciudad || undefined,
        contacto: values?.cliente?.contacto || undefined,
        telefono: values?.cliente?.telefono || undefined,
      },
      items: items
        .filter((it: any) => it?.descripcion?.trim())
        .map((it: any) => ({
          id: it?.id ?? '',
          descripcion: it?.descripcion ?? '',
          cantidad: Number(it?.cantidad) || 0,
          valorUnitario: Number(it?.valorUnitario) || 0,
          impuestoPorcentaje: Number(it?.impuestoPorcentaje) || 0,
        })),
      descuentoPorcentaje: Number(values?.descuentoPorcentaje) || 0,
      notas: {
        revisionInforme: notas?.revisionInforme ?? '',
        retenciones: notas?.retenciones ?? '',
        accesorios: notas?.accesorios ?? '',
      },
      vendedor: values?.vendedor || undefined,
    }

    onGeneratePdf(cotizacion)
  }

  return (
    <Card className="border-2 border-brand-orange shadow-md">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-brand-dark tracking-tight">COTIZACIÓN</h2>
        <p className="text-sm text-brand-gray">No. {numero}</p>
        <p className="text-sm text-brand-gray">{fecha ? formatDate(fecha) : '—'} &mdash; Válida por {validezDias} días</p>
        {vencimiento && <p className="text-xs text-brand-gray">Vence: {formatDate(vencimiento)}</p>}
      </div>

      <div className="mb-4 text-sm">
        <p className="font-bold text-brand-dark">NEW POWER ENERGY SAS</p>
        <p className="text-brand-gray">NIT 901826285-6</p>
        <p className="text-brand-gray">VILLAVICENCIO-META</p>
        <p className="text-brand-gray">Tel: (57) 3204931541</p>
      </div>

      <div className="mb-4 text-sm border-t border-brand-orange-light pt-3">
        <p><span className="font-semibold">Cliente:</span> {clienteNombre}</p>
        <p><span className="font-semibold">NIT:</span> {clienteNit}</p>
        {values?.cliente?.ciudad && <p><span className="font-semibold">Ciudad:</span> {values.cliente.ciudad}</p>}
        {values?.vendedor && <p><span className="font-semibold">Vendedor:</span> {values.vendedor}</p>}
      </div>

      <table className="w-full text-xs mb-4 border-collapse">
        <thead>
          <tr className="bg-brand-orange-light">
            <th className="text-left p-1.5 font-bold">Item</th>
            <th className="text-left p-1.5 font-bold">Descripción</th>
            <th className="text-right p-1.5 font-bold">Cant.</th>
            <th className="text-right p-1.5 font-bold">Vr. Unitario</th>
            <th className="text-right p-1.5 font-bold">Impto</th>
            <th className="text-right p-1.5 font-bold">Vr. Bruto</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td className="p-3 text-center text-brand-gray" colSpan={6}>Sin ítems agregados</td>
            </tr>
          ) : (
            items.map((item: any, i: number) => {
              const cant = Number(item?.cantidad) || 0
              const vr = Number(item?.valorUnitario) || 0
              const imp = Number(item?.impuestoPorcentaje) || 0
              const bruto = cant * vr
              return (
                <tr key={item?.id ?? i} className={i < items.length - 1 ? 'border-b border-brand-orange-light/50' : ''}>
                  <td className="p-1.5 align-top">{i + 1}</td>
                  <td className="p-1.5 align-top">{item?.descripcion || '—'}</td>
                  <td className="p-1.5 text-right align-top">{cant || '—'}</td>
                  <td className="p-1.5 text-right align-top">{vr ? formatCurrency(vr) : '—'}</td>
                  <td className="p-1.5 text-right align-top">{imp}%</td>
                  <td className="p-1.5 text-right align-top font-semibold">{bruto ? formatCurrency(bruto) : '—'}</td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>

      <TotalsSummary totals={tot} />

      <div className="mt-3 text-[10px] text-brand-gray space-y-0.5 border-t border-brand-orange-light pt-3">
        {notas?.revisionInforme && <p>{notas.revisionInforme}</p>}
        {notas?.retenciones && <p>{notas.retenciones}</p>}
        {notas?.accesorios && <p>{notas.accesorios}</p>}
        <p className="pt-2 font-semibold">VALIDEZ DE COTIZACION: ({validezDias}) DIAS</p>
      </div>

      <div className="mt-4">
        <Button
          className="w-full"
          onClick={handleGenerate}
          disabled={!hasItems || generating}
        >
          {generating ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Generando...
            </>
          ) : (
            'Generar PDF'
          )}
        </Button>

        {!hasItems && items.length > 0 && (
          <p className="text-xs text-amber-600 mt-2 text-center">
            Completa al menos un ítem con descripción para generar el PDF.
          </p>
        )}

        {items.length === 0 && (
          <p className="text-xs text-amber-600 mt-2 text-center">
            Agrega al menos un ítem para generar el PDF.
          </p>
        )}

        {pdfError && (
          <p className="text-xs text-red-500 mt-2 text-center">{pdfError}</p>
        )}
      </div>
    </Card>
  )
}
