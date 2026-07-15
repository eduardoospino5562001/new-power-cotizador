import { useState, useCallback } from 'react'
import { useWatch } from 'react-hook-form'
import type { ContractFormReturn } from '../hooks/useContractForm'
import { Card, Input, TextArea, Button } from '@/components/ui'
import { Trash2, Plus, XSquare } from 'lucide-react'
import { formatCurrencyInput, parseCurrencyInput } from '../lib/format'

interface ContractFormProps {
  form: ContractFormReturn
}

function MonetaryInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (val: number) => void
}) {
  const display = value ? formatCurrencyInput(String(value)) : ''

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^\d]/g, '')
      onChange(parseCurrencyInput(raw))
    },
    [onChange],
  )

  return (
    <Input
      label={label}
      type="text"
      inputMode="numeric"
      value={display}
      onChange={handleChange}
    />
  )
}

export function ContractForm({ form }: ContractFormProps) {
  const {
    register,
    control,
    setValue,
    empezarNueva,
    especificacionesFields,
    appendEspecificacion,
    removeEspecificacion,
    clausulasFields,
    appendClausula,
    removeClausula,
  } = form

  const valorTotal = useWatch({ control, name: 'economico.valorTotal' })
  const pagoInicial = useWatch({ control, name: 'economico.pagoInicial' })
  const saldo = useWatch({ control, name: 'economico.saldo' })

  const [selectedClausulas, setSelectedClausulas] = useState<Set<number>>(new Set())

  const toggleClausula = (index: number) => {
    setSelectedClausulas((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const eliminarSeleccionadas = () => {
    const sorted = [...selectedClausulas].sort((a, b) => b - a)
    sorted.forEach((i) => removeClausula(i))
    setSelectedClausulas(new Set())
  }

  const eliminarTodas = () => {
    for (let i = clausulasFields.length - 1; i >= 0; i--) {
      removeClausula(i)
    }
    setSelectedClausulas(new Set())
  }

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
            onClick={() => appendEspecificacion({ id: `esp-${Date.now()}`, nombre: '', valor: '' })}
          >
            <Plus size={16} className="mr-1" /> Agregar
          </Button>
        </div>
        <div className="space-y-2">
          {especificacionesFields.map((field, index) => (
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
                onClick={() => removeEspecificacion(index)}
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
          <MonetaryInput
            label="Valor total"
            value={valorTotal ?? 0}
            onChange={(val) => setValue('economico.valorTotal', val)}
          />
          <MonetaryInput
            label="Pago inicial"
            value={pagoInicial ?? 0}
            onChange={(val) => setValue('economico.pagoInicial', val)}
          />
          <MonetaryInput
            label="Saldo"
            value={saldo ?? 0}
            onChange={(val) => setValue('economico.saldo', val)}
          />
          <Input label="Fecha límite" type="date" {...register('economico.fechaLimite')} />
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-brand-dark">Cláusulas</h2>
          <div className="flex items-center gap-2">
            {selectedClausulas.size > 0 && (
              <Button type="button" variant="ghost" size="sm" onClick={eliminarSeleccionadas}>
                <XSquare size={16} className="mr-1" /> Eliminar ({selectedClausulas.size})
              </Button>
            )}
            <Button type="button" variant="ghost" size="sm" onClick={eliminarTodas}>
              <Trash2 size={16} className="mr-1" /> Eliminar todas
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => appendClausula({ id: `cl-${Date.now()}`, titulo: '', texto: '' })}
            >
              <Plus size={16} className="mr-1" /> Agregar
            </Button>
          </div>
        </div>
        <div className="space-y-3">
          {clausulasFields.map((field, index) => (
            <div key={field.id} className="border border-brand-orange-light rounded-lg p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedClausulas.has(index)}
                    onChange={() => toggleClausula(index)}
                    className="accent-brand-orange mt-1 shrink-0"
                  />
                  <Input
                    placeholder="Título de la cláusula"
                    className="font-bold text-sm w-full"
                    {...register(`clausulas.${index}.titulo` as const)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    removeClausula(index)
                    setSelectedClausulas((prev) => {
                      const next = new Set(prev)
                      next.delete(index)
                      return next
                    })
                  }}
                  className="ml-2 p-1 text-brand-gray hover:text-red-500 transition-colors shrink-0"
                  title="Eliminar"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <TextArea
                placeholder="Contenido de la cláusula..."
                {...register(`clausulas.${index}.texto` as const)}
              />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold text-brand-dark mb-4">Observaciones</h2>
        <TextArea label="Observaciones" {...register('observaciones')} placeholder="Notas adicionales..." />
      </Card>
    </section>
  )
}
