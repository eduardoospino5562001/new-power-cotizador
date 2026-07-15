import { useWatch } from 'react-hook-form'
import type { ContractFormReturn } from '../hooks/useContractForm'
import { Card, Input, TextArea, Button } from '@/components/ui'
import { calcularSaldo } from '../logic/calculations'
import { formatCurrency } from '../lib/format'

interface ContractFormProps {
  form: ContractFormReturn
}

export function ContractForm({ form }: ContractFormProps) {
  const { register, control, empezarNueva } = form
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
        <h2 className="text-lg font-bold text-brand-dark mb-4">Especificaciones del Equipo</h2>
        <div className="space-y-3">
          <Input label="Marca" {...register('equipo.marca')} />
          <Input label="Potencia" {...register('equipo.potencia')} />
          <Input label="Modelo" {...register('equipo.modelo')} placeholder="Modelo" />
          <Input label="Serial Motor" {...register('equipo.serialMotor')} />
          <Input label="Serial Generador" {...register('equipo.serialGenerador')} />
          <Input label="Horas" type="number" {...register('equipo.horas', { valueAsNumber: true })} />
          <Input label="Voltaje" {...register('equipo.voltaje')} />
          <Input label="Frecuencia" {...register('equipo.frecuencia')} />
          <label className="flex items-center gap-2 text-sm text-brand-dark">
            <input type="checkbox" {...register('equipo.radiador')} className="accent-brand-orange" />
            Radiador
          </label>
          <label className="flex items-center gap-2 text-sm text-brand-dark">
            <input type="checkbox" {...register('equipo.breaker')} className="accent-brand-orange" />
            Breaker
          </label>
          <label className="flex items-center gap-2 text-sm text-brand-dark">
            <input type="checkbox" {...register('equipo.modulo')} className="accent-brand-orange" />
            Módulo
          </label>
          <Input label="Baterías" type="number" {...register('equipo.baterias', { valueAsNumber: true })} />
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
