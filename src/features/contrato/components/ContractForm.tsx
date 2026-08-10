import { useState, useCallback } from 'react'
import { useWatch } from 'react-hook-form'
import type { ContractFormReturn } from '../hooks/useContractForm'
import { Card, Input, TextArea, Button, SortableItem } from '@/components/ui'
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
    gruposFields,
    appendGrupo,
    removeGrupo,
    moveGrupo,
    addItemToGrupo,
    removeItemFromGrupo,
    moveItemInGrupo,
    clausulasFields,
    appendClausula,
    removeClausula,
    moveClausula,
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

      {gruposFields.map((g, gIdx) => (
        <SortableItem key={g.id} index={gIdx} total={gruposFields.length} listId="contract-groups" label={`equipo ${gIdx + 1}`} onMove={moveGrupo}>
        <Card>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-col gap-2 sm:flex-1 sm:flex-row sm:items-center">
              <h2 className="text-lg font-bold text-brand-dark">Especificaciones</h2>
              <Input placeholder="Nombre del equipo" {...register(`grupos.${gIdx}.nombre` as const)} />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => addItemToGrupo(gIdx)}>
                <Plus size={16} className="mr-1" /> Agregar
              </Button>
              {gruposFields.length > 1 && (
                <button type="button" onClick={() => removeGrupo(gIdx)} className="p-1 text-brand-gray hover:text-red-500 transition-colors" title="Eliminar bloque">
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
          <div className="space-y-2">
            {g.items?.map((item, iIdx) => (
              <SortableItem key={item.id} index={iIdx} total={g.items.length} listId={`contract-specifications-${g.id}`} label={`especificación ${iIdx + 1}`} onMove={(from, to) => moveItemInGrupo(gIdx, from, to)} className="rounded-lg border border-brand-orange-light/60 bg-transparent p-2">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                <div className="min-w-0 flex-1">
                  <Input placeholder="Nombre" {...register(`grupos.${gIdx}.items.${iIdx}.nombre` as const)} />
                </div>
                <div className="min-w-0 flex-[2]">
                  <Input placeholder="Valor" {...register(`grupos.${gIdx}.items.${iIdx}.valor` as const)} />
                </div>
                <button type="button" onClick={() => removeItemFromGrupo(gIdx, iIdx)} className="self-end p-2 text-brand-gray hover:text-red-500 transition-colors sm:mt-1 sm:self-auto" title="Eliminar"><Trash2 size={18} /></button>
              </div>
              </SortableItem>
            ))}
          </div>
        </Card>
        </SortableItem>
      ))}
      <Button type="button" variant="ghost" size="sm" onClick={() => appendGrupo({ id: `grp-${Date.now()}`, nombre: `Equipo ${gruposFields.length + 1}`, items: [] })} className="w-full">
        <Plus size={16} className="mr-2" /> Agregar otro equipo
      </Button>

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
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-bold text-brand-dark">Cláusulas</h2>
            <div className="flex flex-wrap items-center gap-2">
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
            <SortableItem key={field.id} index={index} total={clausulasFields.length} listId="contract-clauses" label={`cláusula ${index + 1}`} onMove={(from, to) => { moveClausula(from, to); setSelectedClausulas(new Set()) }} className="rounded-lg border border-brand-orange-light p-3">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2">
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
                    setSelectedClausulas(new Set())
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
            </SortableItem>
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
