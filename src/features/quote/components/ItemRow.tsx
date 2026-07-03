import type { UseFormRegister, Control } from 'react-hook-form'
import { useWatch } from 'react-hook-form'
import type { CotizacionFormData } from '../logic/validation'
import { NumberInput, Select } from '@/components/ui'
import { calcularLineaItem } from '../logic/calculations'
import { Trash2 } from 'lucide-react'

interface ItemRowProps {
  index: number
  register: UseFormRegister<CotizacionFormData>
  control: Control<CotizacionFormData>
  onRemove: () => void
  canRemove: boolean
}

export function ItemRow({ index, register, control, onRemove, canRemove }: ItemRowProps) {
  const values = useWatch({ control, name: `items.${index}` })

  const bruto = values ? calcularLineaItem({
    id: values.id ?? '',
    descripcion: values.descripcion ?? '',
    cantidad: Number(values.cantidad) || 0,
    valorUnitario: Number(values.valorUnitario) || 0,
    impuestoPorcentaje: Number(values.impuestoPorcentaje) || 0,
  }) : { bruto: 0, ivaItem: 0 }

  return (
    <div className="grid grid-cols-12 gap-2 items-end">
      <span className="col-span-1 text-xs text-brand-gray self-center text-center font-semibold pb-2">
        {index + 1}
      </span>

      <div className="col-span-3">
        <input
          {...register(`items.${index}.descripcion`)}
          placeholder="Descripción"
          className="w-full rounded-lg border border-brand-orange-light px-3 py-2 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-orange"
        />
      </div>

      <div className="col-span-2">
        <NumberInput
          {...register(`items.${index}.cantidad`, { valueAsNumber: true })}
          placeholder="Cant."
          min={1}
          step="any"
        />
      </div>

      <div className="col-span-2">
        <NumberInput
          {...register(`items.${index}.valorUnitario`, { valueAsNumber: true })}
          placeholder="Vr. unit."
          min={0}
          step="any"
        />
      </div>

      <div className="col-span-2">
        <Select
          {...register(`items.${index}.impuestoPorcentaje`, { valueAsNumber: true })}
          options={[
            { value: '0', label: '0%' },
            { value: '5', label: '5%' },
            { value: '19', label: '19%' },
          ]}
        />
      </div>

      <div className="col-span-1 pb-2 text-right text-sm font-semibold text-brand-dark self-center">
        $ {bruto.bruto.toLocaleString('es-CO')}
      </div>

      <div className="col-span-1 pb-2 flex justify-end">
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
  )
}
