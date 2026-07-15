import { useState, useCallback } from 'react'
import { useWatch } from 'react-hook-form'
import type { RemisionFormReturn } from '../hooks/useRemisionForm'
import type { Control } from 'react-hook-form'
import type { RemisionFormData } from '../logic/validation'
import { Card, Input, TextArea, Button } from '@/components/ui'
import { Trash2, Plus } from 'lucide-react'

function parseHora(val: string): { time: string; ampm: string } {
  if (!val) return { time: '', ampm: 'AM' }
  const parts = val.trim().split(' ')
  return { time: parts[0] || '', ampm: parts[1] || 'AM' }
}

function HoraInput({
  control,
  name,
}: {
  control: Control<RemisionFormData>
  name: 'entrega.hora' | 'recibe.hora'
}) {
  const raw = useWatch({ control, name }) ?? ''
  const { time, ampm } = parseHora(raw)

  const onChange = useCallback(
    (newTime: string, newAmpm: string) => {
      const setValue = (control as any).setValue
      setValue(name, newTime ? `${newTime} ${newAmpm}` : '')
    },
    [control, name],
  )

  return (
    <div className="flex gap-2">
      <input
        type="time"
        value={time}
        onChange={(e) => onChange(e.target.value, ampm)}
        className="rounded-lg border border-brand-orange-light px-3 py-2 text-sm text-brand-dark transition-colors focus:outline-none focus:ring-2 focus:ring-brand-orange flex-1"
      />
      <select
        value={ampm}
        onChange={(e) => onChange(time, e.target.value)}
        className="rounded-lg border border-brand-orange-light px-2 py-2 text-sm text-brand-dark transition-colors focus:outline-none focus:ring-2 focus:ring-brand-orange"
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  )
}

interface RemisionFormProps {
  form: RemisionFormReturn
}

export function RemisionForm({ form }: RemisionFormProps) {
  const {
    register,
    empezarNueva,
    logFields,
    appendLog,
    removeLog,
    detFields,
    appendDet,
    removeDet,
    control,
  } = form

  const [selectedLogs, setSelectedLogs] = useState<Set<number>>(new Set())
  const [selectedDets, setSelectedDets] = useState<Set<number>>(new Set())

  const toggleSel = (set: React.Dispatch<React.SetStateAction<Set<number>>>, index: number) =>
    set((prev) => { const n = new Set(prev); if (n.has(index)) n.delete(index); else n.add(index); return n })

  const eliminarSeleccionados = (set: React.Dispatch<React.SetStateAction<Set<number>>>, remove: (i: number) => void, sel: Set<number>) => {
    const sorted = [...sel].sort((a, b) => b - a)
    sorted.forEach((i) => remove(i))
    set(new Set())
  }

  const eliminarTodos = (set: React.Dispatch<React.SetStateAction<Set<number>>>, remove: (i: number) => void, len: number) => {
    for (let i = len - 1; i >= 0; i--) remove(i)
    set(new Set())
  }

  return (
    <section className="space-y-6">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-brand-dark">Remisión</h2>
          <Button type="button" variant="ghost" size="sm" onClick={empezarNueva}>+ Nuevo</Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="N.º Remisión" {...register('numero')} />
          <Input label="Fecha" type="date" {...register('fecha')} />
          <Input label="N.º Pedido" {...register('pedido')} placeholder="OP-00125" />
          <Input label="N.º Contrato" {...register('contrato')} placeholder="CV-00018" />
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold text-brand-dark mb-4">Cliente</h2>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Nombre *" {...register('cliente.nombre')} placeholder="Nombre del cliente" />
          <Input label="CC / NIT *" {...register('cliente.ccNit')} placeholder="Número de identificación" />
          <Input label="Dirección" {...register('cliente.direccion')} placeholder="Dirección (opcional)" />
          <Input label="Ciudad" {...register('cliente.ciudad')} placeholder="Ciudad" />
          <Input label="Teléfono" {...register('cliente.telefono')} placeholder="Teléfono" />
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-brand-dark">Información Logística</h2>
          <div className="flex items-center gap-2">
            {selectedLogs.size > 0 && (
              <Button type="button" variant="ghost" size="sm" onClick={() => eliminarSeleccionados(setSelectedLogs, removeLog, selectedLogs)}>
                <Trash2 size={16} className="mr-1" /> ({selectedLogs.size})
              </Button>
            )}
            <Button type="button" variant="ghost" size="sm" onClick={() => eliminarTodos(setSelectedLogs, removeLog, logFields.length)}>
              <Trash2 size={16} className="mr-1" /> Todas
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => appendLog({ id: `log-${Date.now()}`, nombre: '', valor: '' })}>
              <Plus size={16} className="mr-1" /> Agregar
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          {logFields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-2">
              <input type="checkbox" checked={selectedLogs.has(index)} onChange={() => toggleSel(setSelectedLogs, index)} className="accent-brand-orange mt-2 shrink-0" />
              <div className="flex-1">
                <Input placeholder="Nombre" {...register(`logistica.${index}.nombre` as const)} />
              </div>
              <div className="flex-[2]">
                <Input placeholder="Valor" {...register(`logistica.${index}.valor` as const)} />
              </div>
              <button type="button" onClick={() => { removeLog(index); setSelectedLogs((prev) => { const n = new Set(prev); n.delete(index); return n }) }} className="mt-2 p-1 text-brand-gray hover:text-red-500 transition-colors" title="Eliminar"><Trash2 size={18} /></button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-brand-dark">Detalle de Entrega</h2>
          <div className="flex items-center gap-2">
            {selectedDets.size > 0 && (
              <Button type="button" variant="ghost" size="sm" onClick={() => eliminarSeleccionados(setSelectedDets, removeDet, selectedDets)}>
                <Trash2 size={16} className="mr-1" /> ({selectedDets.size})
              </Button>
            )}
            <Button type="button" variant="ghost" size="sm" onClick={() => eliminarTodos(setSelectedDets, removeDet, detFields.length)}>
              <Trash2 size={16} className="mr-1" /> Todas
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => appendDet({ id: `det-${Date.now()}`, cantidad: '1', codigo: '', descripcion: '', serial: '', observaciones: '' })}>
              <Plus size={16} className="mr-1" /> Agregar
            </Button>
          </div>
        </div>
        <div className="space-y-3">
          {detFields.map((field, index) => (
            <div key={field.id} className="border border-brand-orange-light rounded-lg p-3">
              <div className="flex items-start gap-2 mb-2">
                <input type="checkbox" checked={selectedDets.has(index)} onChange={() => toggleSel(setSelectedDets, index)} className="accent-brand-orange mt-2 shrink-0" />
                <div className="grid grid-cols-5 gap-2 flex-1">
                  <Input placeholder="Cant." {...register(`detalles.${index}.cantidad` as const)} />
                  <Input placeholder="Código" {...register(`detalles.${index}.codigo` as const)} />
                  <Input placeholder="Descripción" className="col-span-2" {...register(`detalles.${index}.descripcion` as const)} />
                  <Input placeholder="Serial" {...register(`detalles.${index}.serial` as const)} />
                </div>
                <button type="button" onClick={() => { removeDet(index); setSelectedDets((prev) => { const n = new Set(prev); n.delete(index); return n }) }} className="p-1 text-brand-gray hover:text-red-500 transition-colors shrink-0 mt-1" title="Eliminar"><Trash2 size={18} /></button>
              </div>
              <Input placeholder="Observaciones del ítem" {...register(`detalles.${index}.observaciones` as const)} />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold text-brand-dark mb-4">Observaciones</h2>
        <TextArea label="Observaciones" {...register('observaciones')} placeholder="Notas adicionales..." />
      </Card>

      <Card>
        <h2 className="text-lg font-bold text-brand-dark mb-4">Firmas</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-bold text-brand-dark mb-3 uppercase">Entrega</h3>
            <div className="space-y-2">
              <Input label="Nombre" {...register('entrega.nombre')} />
              <Input label="Cargo" {...register('entrega.cargo')} />
              <Input label="Documento" {...register('entrega.documento')} />
              <Input label="Fecha" type="date" {...register('entrega.fecha')} />
              <div>
                <label className="text-sm font-medium text-brand-dark mb-1 block">Hora</label>
                <HoraInput control={control} name="entrega.hora" />
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-brand-dark mb-3 uppercase">Recibe</h3>
            <div className="space-y-2">
              <Input label="Nombre" {...register('recibe.nombre')} />
              <Input label="Cargo" {...register('recibe.cargo')} />
              <Input label="Documento" {...register('recibe.documento')} />
              <Input label="Fecha" type="date" {...register('recibe.fecha')} />
              <div>
                <label className="text-sm font-medium text-brand-dark mb-1 block">Hora</label>
                <HoraInput control={control} name="recibe.hora" />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </section>
  )
}
