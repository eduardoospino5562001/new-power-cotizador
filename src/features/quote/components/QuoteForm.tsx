import { useWatch } from 'react-hook-form'
import type { QuoteFormReturn } from '../hooks/useQuoteForm'
import { ItemRow } from './ItemRow'
import { Card, Input, TextArea, Button } from '@/components/ui'
import { Plus } from 'lucide-react'
import { calcularVencimiento, formatDate } from '../lib/formatCurrency'

interface QuoteFormProps {
  form: QuoteFormReturn
}

export function QuoteForm({ form }: QuoteFormProps) {
  const { register, control, fields, addItem, removeItem, empezarNueva } = form
  const fecha = useWatch({ control, name: 'fecha' })
  const validez = useWatch({ control, name: 'validezDias' })

  const vencimiento = calcularVencimiento(fecha ?? '', Number(validez) || 15)

  return (
    <section className="space-y-6">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-brand-dark">Datos de la cotización</h2>
          <Button type="button" variant="ghost" size="sm" onClick={empezarNueva}>
            + Nueva
          </Button>
        </div>
        <div className="space-y-3">
          <Input label="N.º Cotización" {...register('numero')} />
          <Input label="Fecha de emisión" type="date" {...register('fecha')} />
          <Input label="Validez (días)" type="number" {...register('validezDias', { valueAsNumber: true })} min={1} />
          {vencimiento && (
            <p className="text-xs text-brand-gray">
              Vence el <span className="font-semibold">{formatDate(vencimiento)}</span>
            </p>
          )}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold text-brand-dark mb-4">Datos del cliente</h2>
        <div className="space-y-3">
          <Input label="Nombre *" {...register('cliente.nombre')} placeholder="Nombre del cliente" />
          <Input label="NIT *" {...register('cliente.nit')} placeholder="00000000-0" />
          <Input label="Ciudad" {...register('cliente.ciudad')} placeholder="Ciudad (opcional)" />
          <Input label="Contacto" {...register('cliente.contacto')} placeholder="Nombre de contacto (opcional)" />
          <Input label="Teléfono" {...register('cliente.telefono')} placeholder="Teléfono (opcional)" />
          <Input label="Vendedor" {...register('vendedor')} placeholder="Vendedor (opcional)" />
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold text-brand-dark mb-4">Ítems</h2>
        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-brand-gray px-1">
            <span className="col-span-1 text-center">#</span>
            <span className="col-span-3">Descripción</span>
            <span className="col-span-2">Cantidad</span>
            <span className="col-span-2">Vr. Unitario</span>
            <span className="col-span-2">Impto %</span>
            <span className="col-span-1 text-right">Bruto</span>
            <span className="col-span-1" />
          </div>

          {fields.map((field, index) => (
            <ItemRow
              key={field.id}
              index={index}
              register={register}
              control={control}
              onRemove={() => removeItem(index)}
              canRemove={fields.length > 1}
            />
          ))}

          <Button type="button" variant="secondary" size="sm" onClick={addItem}>
            <Plus size={16} className="mr-1" /> Agregar ítem
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold text-brand-dark mb-4">Notas y condiciones</h2>
        <div className="space-y-3">
          <TextArea label="Revisión / Informe técnico" {...register('notas.revisionInforme')} />
          <TextArea label="Retenciones" {...register('notas.retenciones')} />
          <TextArea label="Accesorios" {...register('notas.accesorios')} />
        </div>
      </Card>
    </section>
  )
}
