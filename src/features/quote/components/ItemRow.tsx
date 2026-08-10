import type { UseFormRegister, Control } from 'react-hook-form'
import { useWatch } from 'react-hook-form'
import type { CotizacionFormData } from '../logic/validation'
import { NumberInput, Select, SortableItem } from '@/components/ui'
import { calcularLineaItem } from '../logic/calculations'
import { Trash2 } from 'lucide-react'

interface ItemRowProps {
  index: number
  register: UseFormRegister<CotizacionFormData>
  control: Control<CotizacionFormData>
  onRemove: () => void
  canRemove: boolean
  total: number
  onMove: (from: number, to: number) => void
}

export function ItemRow({ index, register, control, onRemove, canRemove, total, onMove }: ItemRowProps) {
  const values = useWatch({ control, name: `items.${index}` })

  const bruto = values ? calcularLineaItem({
    id: values.id ?? '',
    descripcion: values.descripcion ?? '',
    cantidad: Number(values.cantidad) || 0,
    valorUnitario: Number(values.valorUnitario) || 0,
    impuestoPorcentaje: Number(values.impuestoPorcentaje) || 0,
  }) : { bruto: 0, ivaItem: 0 }

  return (
    <SortableItem index={index} total={total} listId="quote-items" label={`ítem ${index + 1}`} onMove={onMove} className="rounded-xl border border-brand-orange-light bg-transparent p-3">
      <div className="grid grid-cols-2 items-end gap-3 sm:grid-cols-12 sm:gap-2">
      <span className="col-span-2 text-xs text-brand-gray font-semibold sm:col-span-1 sm:pb-2 sm:text-center">
        Ítem {index + 1}
      </span>

      <div className="col-span-2 sm:col-span-3">
        <span className="mb-1 block text-xs font-medium text-brand-gray sm:hidden">Descripción</span>
        <input
          {...register(`items.${index}.descripcion`)}
          placeholder="Descripción"
          className="w-full rounded-lg border border-brand-orange-light px-3 py-2 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-orange"
        />
      </div>

      <div className="col-span-1 sm:col-span-2">
        <span className="mb-1 block text-xs font-medium text-brand-gray sm:hidden">Cantidad</span>
        <NumberInput
          {...register(`items.${index}.cantidad`, { valueAsNumber: true })}
          placeholder="Cant."
          min={1}
          step="any"
        />
      </div>

      <div className="col-span-1 sm:col-span-2">
        <span className="mb-1 block text-xs font-medium text-brand-gray sm:hidden">Vr. unitario</span>
        <NumberInput
          {...register(`items.${index}.valorUnitario`, { valueAsNumber: true })}
          placeholder="Vr. unit."
          min={0}
          step="any"
        />
      </div>

      <div className="col-span-1 sm:col-span-2">
        <span className="mb-1 block text-xs font-medium text-brand-gray sm:hidden">Impuesto</span>
        <Select
          {...register(`items.${index}.impuestoPorcentaje`, { valueAsNumber: true })}
          options={[
            { value: '0', label: '0%' },
            { value: '5', label: '5%' },
            { value: '19', label: '19%' },
          ]}
        />
      </div>

      <div className="col-span-1 self-center text-right text-sm font-semibold text-brand-dark sm:pb-2">
        <span className="mr-1 text-xs font-medium text-brand-gray sm:hidden">Bruto</span>
        $ {bruto.bruto.toLocaleString('es-CO')}
      </div>

      <div className="col-span-2 flex justify-end sm:col-span-1 sm:pb-2">
        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          className="p-1.5 text-brand-gray hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Eliminar ítem"
        >
          <Trash2 size={16} />
        </button>
      </div>
      </div>
    </SortableItem>
  )
}
