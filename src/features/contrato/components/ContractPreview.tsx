import { useWatch } from 'react-hook-form'
import type { Control } from 'react-hook-form'
import type { ContratoFormData } from '../logic/validation'
import { Button } from '@/components/ui'
import { calcularSaldo } from '../logic/calculations'
import { formatCurrency, formatDate } from '../lib/format'
import Logo from '@/assets/logo.jpeg'

const CLAUSULAS = [
  { titulo: 'PRIMERA. OBJETO', texto: 'EL VENDEDOR vende a EL COMPRADOR una planta eléctrica de segunda, con las características descritas en las especificaciones del equipo. Lo anterior conforme a la cotización No. correspondiente.' },
  { titulo: 'SEGUNDA. VALOR', texto: 'El valor total de la compraventa es el indicado en el resumen económico del presente contrato.' },
  { titulo: 'TERCERA. FORMA DE PAGO', texto: 'EL COMPRADOR pagará el valor del contrato según lo establecido en el resumen económico: un pago inicial y el saldo en la fecha acordada.' },
  { titulo: 'CUARTA. ENTREGA', texto: 'EL VENDEDOR hará entrega de la planta eléctrica en la ciudad de Medellín, una vez se cumplan las condiciones de pago pactadas entre las partes.' },
  { titulo: 'QUINTA. GARANTÍA', texto: 'La planta eléctrica cuenta con una garantía de quinientas (500) horas de funcionamiento o tres (3) meses, lo que ocurra primero.' },
  { titulo: 'SEXTA. INSTALACIÓN Y TRANSPORTE', texto: 'En caso de requerirse instalación, los gastos de transporte, viáticos y demás costos asociados serán asumidos por EL COMPRADOR.' },
  { titulo: 'SÉPTIMA. ESTADO DEL BIEN', texto: 'EL COMPRADOR declara conocer que el equipo objeto de este contrato corresponde a una planta eléctrica usada (de segunda), aceptando su estado de funcionamiento al momento de la entrega.' },
  { titulo: 'OCTAVA. PERFECCIONAMIENTO', texto: 'El presente contrato se entiende perfeccionado con la firma de las partes.' },
  { titulo: 'NOVENA. OBLIGACIONES DEL VENDEDOR', texto: 'EL VENDEDOR se obliga a entregar el equipo en el estado acordado, con todos sus accesorios y documentación asociada.' },
  { titulo: 'DÉCIMA. OBLIGACIONES DEL COMPRADOR', texto: 'EL COMPRADOR se obliga a pagar el valor acordado en la forma y plazos estipulados.' },
  { titulo: 'UNDÉCIMA. INCUMPLIMIENTO', texto: 'En caso de incumplimiento por cualquiera de las partes, la parte afectada podrá exigir el cumplimiento o la resolución del contrato.' },
  { titulo: 'DUODÉCIMA. CLÁUSULA PENAL', texto: 'En caso de mora en el pago, EL COMPRADOR pagará un interés moratorio equivalente al máximo legal permitido.' },
]

interface ContractPreviewProps {
  control: Control<ContratoFormData>
  onGeneratePdf: (data: ContratoFormData) => void
  generating?: boolean
  pdfError?: string | null
}

export function ContractPreview({ control, onGeneratePdf, generating, pdfError }: ContractPreviewProps) {
  const data = useWatch({ control }) as ContratoFormData | undefined

  if (!data) return null

  const saldo = calcularSaldo(
    Number(data.economico?.valorTotal) || 0,
    Number(data.economico?.pagoInicial) || 0,
  )

  const specs = data.especificaciones?.filter((s) => s?.nombre) ?? []

  return (
    <section className="space-y-6">
      <div className="rounded-xl bg-white border border-brand-orange-light p-6 shadow-sm">
        <div className="flex items-start justify-between border-b-2 border-brand-orange pb-4 mb-6">
          <div className="flex items-center gap-3">
            <img src={Logo} alt="Logo" className="w-16 h-16 object-contain rounded" />
            <div>
              <p className="text-sm font-bold text-brand-dark">{data.vendedor?.razonSocial || 'NEW POWER ENERGY S.A.S.'}</p>
              <p className="text-xs text-brand-gray">NIT {data.vendedor?.nit || '901.826.285-6'}</p>
              <p className="text-xs text-brand-gray">{data.vendedor?.direccion}</p>
              <p className="text-xs text-brand-gray">Tel: {data.vendedor?.telefono}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-lg font-bold text-brand-orange">CONTRATO DE COMPRAVENTA</h2>
            <p className="text-xs text-brand-gray">No. {data.numero}</p>
            <p className="text-xs text-brand-gray">{formatDate(data.fecha)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-brand-light p-3 rounded">
            <p className="text-xs font-bold text-brand-gray uppercase mb-1">VENDEDOR</p>
            <p className="text-sm font-semibold text-brand-dark">{data.vendedor?.razonSocial}</p>
            <p className="text-xs text-brand-gray">NIT {data.vendedor?.nit}</p>
            <p className="text-xs text-brand-gray">{data.vendedor?.direccion}</p>
            <p className="text-xs text-brand-gray">{data.vendedor?.ciudad}</p>
            <p className="text-xs text-brand-gray">Tel: {data.vendedor?.telefono}</p>
            {data.vendedor?.correo && <p className="text-xs text-brand-gray">{data.vendedor.correo}</p>}
          </div>
          <div className="bg-brand-light p-3 rounded">
            <p className="text-xs font-bold text-brand-gray uppercase mb-1">COMPRADOR</p>
            <p className="text-sm font-semibold text-brand-dark">{data.comprador?.nombre || '—'}</p>
            <p className="text-xs text-brand-gray">CC/NIT {data.comprador?.ccNit || '—'}</p>
            {data.comprador?.direccion && <p className="text-xs text-brand-gray">{data.comprador.direccion}</p>}
            {data.comprador?.ciudad && <p className="text-xs text-brand-gray">{data.comprador.ciudad}</p>}
            {data.comprador?.telefono && <p className="text-xs text-brand-gray">Tel: {data.comprador.telefono}</p>}
            {data.comprador?.correo && <p className="text-xs text-brand-gray">{data.comprador.correo}</p>}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-bold text-brand-dark mb-3 border-b border-brand-orange-light pb-1">ESPECIFICACIONES DEL EQUIPO</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
            {specs.map((s) => (
              <PreviewRow key={s.id} label={s.nombre} value={s.valor} />
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-bold text-brand-dark mb-3 border-b border-brand-orange-light pb-1">RESUMEN ECONÓMICO</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-brand-gray">Valor total</span><span className="font-semibold">{formatCurrency(Number(data.economico?.valorTotal) || 0)}</span></div>
            <div className="flex justify-between"><span className="text-brand-gray">Pago inicial</span><span className="font-semibold">{formatCurrency(Number(data.economico?.pagoInicial) || 0)}</span></div>
            <div className="flex justify-between"><span className="text-brand-gray">Saldo</span><span className="font-semibold">{formatCurrency(saldo)}</span></div>
            {data.economico?.fechaLimite && <div className="flex justify-between"><span className="text-brand-gray">Fecha límite</span><span className="font-semibold">{formatDate(data.economico.fechaLimite)}</span></div>}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-bold text-brand-dark mb-3 border-b border-brand-orange-light pb-1">CLÁUSULAS</h3>
          <div className="space-y-3">
            {CLAUSULAS.map((c, i) => (
              <div key={i}>
                <p className="text-xs font-bold text-brand-dark">{c.titulo}</p>
                <p className="text-xs text-brand-gray">{c.texto}</p>
              </div>
            ))}
          </div>
        </div>

        {data.observaciones && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-brand-dark mb-2 border-b border-brand-orange-light pb-1">OBSERVACIONES</h3>
            <p className="text-xs text-brand-gray whitespace-pre-wrap">{data.observaciones}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-8 mt-8 pt-4 border-t border-brand-orange-light">
          <div>
            <p className="text-xs font-bold text-brand-gray uppercase mb-2">EL VENDEDOR</p>
            <div className="border-b border-brand-dark h-8 mb-1" />
            <p className="text-xs text-brand-gray">Firma</p>
            <div className="border-b border-brand-dark h-8 mb-1 mt-2" />
            <p className="text-xs text-brand-gray">Nombre</p>
            <div className="border-b border-brand-dark h-8 mb-1 mt-2" />
            <p className="text-xs text-brand-gray">Cargo</p>
          </div>
          <div>
            <p className="text-xs font-bold text-brand-gray uppercase mb-2">EL COMPRADOR</p>
            <div className="border-b border-brand-dark h-8 mb-1" />
            <p className="text-xs text-brand-gray">Firma</p>
            <div className="border-b border-brand-dark h-8 mb-1 mt-2" />
            <p className="text-xs text-brand-gray">Nombre</p>
            <div className="border-b border-brand-dark h-8 mb-1 mt-2" />
            <p className="text-xs text-brand-gray">C.C.</p>
          </div>
        </div>
      </div>

      {pdfError && (
        <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-3">
          Error al generar PDF: {pdfError}
        </div>
      )}

      <Button
        className="w-full"
        size="lg"
        onClick={() => onGeneratePdf(data)}
        disabled={generating}
      >
        {generating ? 'Generando PDF...' : 'Generar PDF'}
      </Button>
    </section>
  )
}

function PreviewRow({ label, value }: { label: string; value?: string }) {
  if (!value && value !== '0') return null
  return (
    <div className="flex justify-between">
      <span className="text-brand-gray">{label}:</span>
      <span className="font-medium text-brand-dark">{value || '—'}</span>
    </div>
  )
}
