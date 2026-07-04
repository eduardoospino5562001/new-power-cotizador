import type { ReportFormReturn } from '../hooks/useReportForm'
import { PhotoGroup } from './PhotoGroup'
import { Card, Input, TextArea, Button } from '@/components/ui'
import { Plus } from 'lucide-react'

interface ReportFormProps {
  form: ReportFormReturn
}

export function ReportForm({ form }: ReportFormProps) {
  const { register, control, grupos, addGrupo, removeGrupo, moveGrupo } = form

  return (
    <section className="space-y-6">
      <Card>
        <h2 className="text-lg font-bold text-brand-dark mb-4">Nuevo Informe Técnico</h2>
        <div className="space-y-3">
          <Input label="N.º Informe" {...register('numero')} />
          <Input label="Título" {...register('titulo')} readOnly className="bg-brand-light text-brand-gray" />
          <Input label="Fecha" type="date" {...register('fecha')} />
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold text-brand-dark mb-4">Datos del servicio</h2>
        <div className="space-y-3">
          <Input label="Cliente *" {...register('cliente')} placeholder="Nombre del cliente" />
          <Input label="NIT" {...register('nit')} placeholder="NIT (opcional)" />
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-bold text-brand-dark mb-4">Observaciones</h2>
        <TextArea label="Descripción del trabajo realizado *" placeholder="Describe el trabajo realizado..." {...register('observaciones')} />
      </Card>

      <div>
        <h2 className="text-lg font-bold text-brand-dark mb-4">Registro Fotográfico</h2>

        <div className="space-y-4">
          {grupos.length === 0 && (
            <Card>
              <p className="text-sm text-brand-gray text-center py-4">Agrega al menos un grupo de fotos para continuar.</p>
            </Card>
          )}
          {grupos.map((field, index) => (
            <PhotoGroup
              key={field.id}
              index={index}
              register={register}
              control={control}
              onRemove={() => removeGrupo(index)}
              canRemove={grupos.length > 1}
              onMoveUp={index > 0 ? () => moveGrupo(index, index - 1) : undefined}
              onMoveDown={index < grupos.length - 1 ? () => moveGrupo(index, index + 1) : undefined}
              isFirst={index === 0}
              isLast={index === grupos.length - 1}
            />
          ))}

          <div className="flex justify-center pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={addGrupo}>
              <Plus size={16} className="mr-1" /> Agregar grupo de fotos
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <h2 className="text-lg font-bold text-brand-dark mb-4">Responsable</h2>
        <Input label="Técnico *" placeholder="Nombre del técnico responsable" {...register('tecnico')} />
      </Card>
    </section>
  )
}
