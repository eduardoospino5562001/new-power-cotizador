import { useCallback, useRef, useState } from 'react'
import type { UseFormRegister, Control } from 'react-hook-form'
import { useWatch, useFieldArray } from 'react-hook-form'
import type { InformeFormData } from '../logic/validation'
import { Input, Card } from '@/components/ui'
import { Camera, Trash2, ChevronUp, ChevronDown, Undo2, AlertTriangle } from 'lucide-react'
import { cargarMultiplesFotos, esImagenBajaResolucion } from '../lib/imageLoader'

interface PhotoGroupProps {
  index: number
  register: UseFormRegister<InformeFormData>
  control: Control<InformeFormData>
  onRemove: () => void
  canRemove: boolean
  onMoveUp?: () => void
  onMoveDown?: () => void
  isFirst: boolean
  isLast: boolean
}

export function PhotoGroup({
  index,
  register,
  control,
  onRemove,
  canRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: PhotoGroupProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const undoRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastRemovedRef = useRef<{ id: string; src: string } | null>(null)
  const [bajaResMap, setBajaResMap] = useState<Record<string, boolean>>({})
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dropTarget, setDropTarget] = useState<number | null>(null)

  const fotos = useWatch({ control, name: `grupos.${index}.fotos` }) ?? []

  const { append: addFoto, remove: removeFoto, move: moveFoto } = useFieldArray({
    control,
    name: `grupos.${index}.fotos`,
  })

  const procesarYAgregar = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return

      const MAX_GRUPO = 20
      if (fotos.length + files.length > MAX_GRUPO) {
        alert(`Has superado las 20 fotos en este grupo. Actualmente tienes ${fotos.length}.`)
      }

      const srcs = await cargarMultiplesFotos(files)

      for (const src of srcs) {
        const id = crypto.randomUUID()
        addFoto({ id, src })

        esImagenBajaResolucion(src).then((baja) => {
          if (baja) setBajaResMap((prev) => ({ ...prev, [id]: true }))
        })
      }
    },
    [addFoto, fotos.length],
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      procesarYAgregar(e.target.files)
      if (fileInputRef.current) fileInputRef.current.value = ''
    },
    [procesarYAgregar],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      procesarYAgregar(e.dataTransfer.files)
    },
    [procesarYAgregar],
  )

  const handleRemoveFoto = useCallback(
    (fotoIndex: number, fotoId: string, fotoSrc: string) => {
      lastRemovedRef.current = { id: fotoId, src: fotoSrc }
      removeFoto(fotoIndex)
      if (undoRef.current) clearTimeout(undoRef.current)
      undoRef.current = setTimeout(() => {
        lastRemovedRef.current = null
      }, 4000)
    },
    [removeFoto],
  )

  const handleUndoRemove = useCallback(() => {
    if (lastRemovedRef.current && undoRef.current) {
      clearTimeout(undoRef.current)
      addFoto({ id: lastRemovedRef.current.id, src: lastRemovedRef.current.src })
      lastRemovedRef.current = null
    }
  }, [addFoto])

  const handleDragStart = useCallback((idx: number) => {
    setDragIndex(idx)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault()
    setDropTarget(idx)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDropTarget(null)
  }, [])

  const handleDropReorder = useCallback(
    (targetIdx: number) => {
      if (dragIndex === null || dragIndex === targetIdx) {
        setDragIndex(null)
        setDropTarget(null)
        return
      }
      moveFoto(dragIndex, targetIdx)
      setDragIndex(null)
      setDropTarget(null)
    },
    [dragIndex, moveFoto],
  )

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-0.5">
            {!isFirst && (
              <button type="button" onClick={onMoveUp} className="p-0.5 text-brand-gray hover:text-brand-orange transition-colors">
                <ChevronUp size={14} />
              </button>
            )}
            {!isLast && (
              <button type="button" onClick={onMoveDown} className="p-0.5 text-brand-gray hover:text-brand-orange transition-colors">
                <ChevronDown size={14} />
              </button>
            )}
          </div>
          <span className="text-sm font-semibold text-brand-gray">Grupo {index + 1}</span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          className="p-1.5 text-brand-gray hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="space-y-3">
        <Input
          label="Nombre del sitio / ubicación"
          placeholder="Ej: Planta Garza"
          {...register(`grupos.${index}.nombre`)}
        />

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-brand-orange-light rounded-lg p-4 text-center cursor-pointer hover:border-brand-orange transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Camera size={24} className="mx-auto mb-2 text-brand-gray" />
          <p className="text-sm text-brand-gray">Haz clic o arrastra fotos aquí</p>
          <p className="text-xs text-brand-gray/60 mt-1">Cámara, galería, archivos</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {lastRemovedRef.current && (
          <div className="flex items-center gap-2 text-xs text-brand-orange">
            <span>Foto eliminada</span>
            <button type="button" onClick={handleUndoRemove} className="flex items-center gap-1 font-semibold hover:underline">
              <Undo2 size={12} /> Deshacer
            </button>
          </div>
        )}

        {fotos.length > 0 && (
          <div>
            <p className="text-xs text-brand-gray mb-2">{fotos.length} foto(s)</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {fotos.map((foto: any, fotoIndex: number) => (
                <div
                  key={foto?.id ?? fotoIndex}
                  draggable
                  onDragStart={() => handleDragStart(fotoIndex)}
                  onDragOver={(e) => handleDragOver(e, fotoIndex)}
                  onDragLeave={handleDragLeave}
                  onDrop={() => handleDropReorder(fotoIndex)}
                  className={`relative group cursor-grab active:cursor-grabbing transition-shadow ${
                    dropTarget === fotoIndex ? 'ring-2 ring-brand-orange rounded-lg' : ''
                  } ${dragIndex === fotoIndex ? 'opacity-50' : ''}`}
                >
                  {foto?.src && (
                    <img
                      src={foto.src}
                      alt={`Foto ${fotoIndex + 1}`}
                      className="w-full aspect-square object-cover rounded-lg border border-brand-orange-light"
                    />
                  )}
                  {foto?.id && bajaResMap[foto.id] && (
                    <div className="absolute top-1 left-1" title="Foto de baja resolución">
                      <AlertTriangle size={12} className="text-amber-500" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveFoto(fotoIndex, foto?.id ?? '', foto?.src ?? '')}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-70 hover:opacity-100 transition-opacity"
                    title="Eliminar foto"
                  >
                    <Trash2 size={12} />
                  </button>
                  <div className="flex gap-1 mt-1 justify-center">
                    {fotoIndex > 0 && (
                      <button type="button" onClick={() => moveFoto(fotoIndex, fotoIndex - 1)} className="p-0.5 text-brand-gray hover:text-brand-orange">
                        <ChevronUp size={12} />
                      </button>
                    )}
                    {fotoIndex < fotos.length - 1 && (
                      <button type="button" onClick={() => moveFoto(fotoIndex, fotoIndex + 1)} className="p-0.5 text-brand-gray hover:text-brand-orange">
                        <ChevronDown size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
