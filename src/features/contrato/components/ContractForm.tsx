import { useWatch } from 'react-hook-form'
import type { ContractFormReturn } from '../hooks/useContractForm'
import { Card, Input, TextArea, Button } from '@/components/ui'
import { calcularSaldo } from '../logic/calculations'
import { formatCurrency } from '../lib/format'
import { Trash2, Plus } from 'lucide-react'

interface ContractFormProps {
  form: ContractFormReturn
}

export function ContractForm({ form }: ContractFormProps) {
  const { register, control, empezarNueva, fields, append, remove } = form
  const valorTotal = useWatch({ control, name: 'economico.valorTotal' })
  const pagoInicial = useWatch({ control, name: 'economico.pagoInicial' })
  const saldo = calcularSaldo(Number(valorTotal) || 0, Number(pagoInicial) || 0)

  return (
    <section className="space-y-6">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-brand-dark">Contrato de Compraventa</h2>
          <Button type="button" variant="ghost" size="sm" onClick={empezarNueva}>
            + Nuevo
          </Button>
        </div>
        <div className="space-y-3">
          <Input label="N.º Contrato" {...register('numero')} />
          <Input label="Fecha" type="date" {...register('fecha')} />
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold text-brand-dark mb-4">Vendedor</h2>
        <div className="space-y-3">
          <Input label="Razón social" {...register('vendedor.razonSocial')} />
          <Input label="NIT" {...register('vendedor.nit')} />
          <Input label="Dirección" {...register('vendedor.direccion')} />
          <Input label="Ciudad" {...register('vendedor.ciudad')} />
          <Input label="Teléfono" {...register('vendedor.telefono')} />
          <Input label="Correo" {...register('vendedor.correo')} placeholder="correo@ejemplo.com" />
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold text-brand-dark mb-4">Comprador</h2>
        <div className="space-y-3">
          <Input label="Nombre *" {...register('comprador.nombre')} placeholder="Nombre del comprador" />
          <Input label="CC / NIT *" {...register('comprador.ccNit')} placeholder="Número de identificación" />
          <Input label="Dirección" {...register('comprador.direccion')} placeholder="Dirección (opcional)" />
          <Input label="Ciudad" {...register('comprador.ciudad')} placeholder="Ciudad (opcional)" />
          <Input label="Teléfono" {...register('comprador.telefono')} placeholder="Teléfono (opcional)" />
          <Input label="Correo" {...register('comprador.correo')} placeholder="Correo (opcional)" />
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-brand-dark">Especificaciones del Equipo</h2>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => append({ id: `esp-${Date.now()}`, nombre: '', valor: '' })}
          >
            <Plus size={16} className="mr-1" /> Agregar
          </Button>
        </div>
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Nombre"
                  {...register(`especificaciones.${index}.nombre` as const)}
                />
              </div>
              <div className="flex-[2]">
                <Input
                  placeholder="Valor"
                  {...register(`especificaciones.${index}.valor` as const)}
                />
              </div>
              <button
                type="button"
                onClick={() => remove(index)}
                className="mt-2 p-1 text-brand-gray hover:text-red-500 transition-colors"
                title="Eliminar"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold text-brand-dark mb-4">Resumen Económico</h2>
        <div className="space-y-3">
          <Input label="Valor total" type="number" {...register('economico.valorTotal', { valueAsNumber: true })} />
          <Input label="Pago inicial" type="number" {...register('economico.pagoInicial', { valueAsNumber: true })} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-brand-dark">Saldo</label>
            <div className="rounded-lg border border-brand-orange-light px-3 py-2 text-sm text-brand-dark bg-brand-light">
              {formatCurrency(saldo)}
            </div>
          </div>
          <Input label="Fecha límite" type="date" {...register('economico.fechaLimite')} />
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold text-brand-dark mb-4">Observaciones</h2>
        <TextArea label="Observaciones" {...register('observaciones')} placeholder="Notas adicionales..." />
      </Card>
    </section>
  )
}
