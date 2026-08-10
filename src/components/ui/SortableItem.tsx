import { useState, type DragEvent, type ReactNode } from 'react'
import { ChevronDown, ChevronUp, GripVertical } from 'lucide-react'

interface SortableItemProps {
  children: ReactNode
  className?: string
  index: number
  total: number
  listId: string
  label: string
  onMove: (from: number, to: number) => void
}

export function SortableItem({
  children,
  className = '',
  index,
  total,
  listId,
  label,
  onMove,
}: SortableItemProps) {
  const [isOver, setIsOver] = useState(false)

  const readDragIndex = (event: DragEvent) => {
    const value = event.dataTransfer.getData('application/x-new-power-sort')
    const [sourceList, sourceIndex] = value.split(':')
    return sourceList === listId ? Number(sourceIndex) : null
  }

  const handleDrop = (event: DragEvent) => {
    event.preventDefault()
    setIsOver(false)
    const sourceIndex = readDragIndex(event)
    if (sourceIndex !== null && Number.isInteger(sourceIndex) && sourceIndex !== index) {
      onMove(sourceIndex, index)
    }
  }

  return (
    <div
      className={`relative pl-11 transition-colors ${isOver ? 'rounded-xl bg-brand-orange-light/35 ring-2 ring-brand-orange' : ''} ${className}`}
      onDragOver={(event) => {
        event.preventDefault()
        setIsOver(true)
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={handleDrop}
    >
      <div className="absolute left-0 top-2 flex flex-col items-center gap-0.5">
        <button
          type="button"
          draggable
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = 'move'
            event.dataTransfer.setData('application/x-new-power-sort', `${listId}:${index}`)
          }}
          aria-label={`Arrastrar para reordenar ${label}`}
          title="Arrastrar para reordenar"
          className="flex size-10 cursor-grab items-center justify-center rounded-lg text-brand-gray transition-colors hover:bg-brand-light hover:text-brand-orange active:cursor-grabbing"
        >
          <GripVertical size={18} aria-hidden="true" />
        </button>
        <div className="flex gap-0.5">
          <button
            type="button"
            onClick={() => onMove(index, index - 1)}
            disabled={index === 0}
            aria-label={`Mover ${label} arriba`}
            className="flex size-5 items-center justify-center rounded text-brand-gray hover:bg-brand-light hover:text-brand-orange disabled:cursor-not-allowed disabled:opacity-25"
          >
            <ChevronUp size={14} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onMove(index, index + 1)}
            disabled={index === total - 1}
            aria-label={`Mover ${label} abajo`}
            className="flex size-5 items-center justify-center rounded text-brand-gray hover:bg-brand-light hover:text-brand-orange disabled:cursor-not-allowed disabled:opacity-25"
          >
            <ChevronDown size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
      {children}
    </div>
  )
}
