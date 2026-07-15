import { useState } from 'react'
import type { RemisionFormReturn } from '../hooks/useRemisionForm'
import { Card, Input, TextArea, Button } from '@/components/ui'
import { Trash2, Plus } from 'lucide-react'

interface RemisionFormProps {
  form: RemisionFormReturn
}

export function RemisionForm({ form }: RemisionFormProps) {
  const {
    register,
    empezarNueva,
    detFields,
    appendDet,
    removeDet,
  } = form

  const [selectedDets, setSelectedDets] = useState<Set<number>>(new Set())

  const toggleDet = (index: number) => {
    setSelectedDets((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const eliminarSeleccionados = () => {
    const sorted = [...selectedDets].sort((a, b) => b - a)
    sorted.forEach((i) => removeDet(i))
    setSelectedDets(new Set())
  }

  const eliminarTodos = () => {
    for (let i = detFields.length - 1; i >= 0; i--) removeDet(i)
    setSelectedDets(new Set())
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
        <h2 className="text-lg font-bold text-brand-dark mb-4">Información Logística</h2>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Lugar despacho" {...register('logistica.lugarDespacho')} />
          <Input label="Lugar entrega" {...register('logistica.lugarEntrega')} />
          <Input label="Responsable transporte" {...register('logistica.responsableTransporte')} placeholder="Nombre del responsable" />
          <Input label="Vehículo" {...register('logistica.vehiculo')} placeholder="Tipo de vehículo" />
          <Input label="Placa" {...register('logistica.placa')} placeholder="Placa del vehículo" />
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-brand-dark">Detalle de Entrega</h2>
          <div className="flex items-center gap-2">
            {selectedDets.size > 0 && (
              <Button type="button" variant="ghost" size="sm" onClick={eliminarSeleccionados}>
                <Trash2 size={16} className="mr-1" /> ({selectedDets.size})
              </Button>
            )}
            <Button type="button" variant="ghost" size="sm" onClick={eliminarTodos}>
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
                <input type="checkbox" checked={selectedDets.has(index)} onChange={() => toggleDet(index)} className="accent-brand-orange mt-2 shrink-0" />
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
              <Input label="Hora" type="time" {...register('entrega.hora')} />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-brand-dark mb-3 uppercase">Recibe</h3>
            <div className="space-y-2">
              <Input label="Nombre" {...register('recibe.nombre')} />
              <Input label="Cargo" {...register('recibe.cargo')} />
              <Input label="Documento" {...register('recibe.documento')} />
              <Input label="Fecha" type="date" {...register('recibe.fecha')} />
              <Input label="Hora" type="time" {...register('recibe.hora')} />
            </div>
          </div>
        </div>
      </Card>
    </section>
  )
}
