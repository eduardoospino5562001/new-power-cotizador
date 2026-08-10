import { useEffect, useRef, useCallback } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import type { CotizacionFormData } from '../logic/validation'
import { getSiguienteNumero, getUltimoCorrelativo } from '../lib/storage'
import { guardarBorrador, cargarBorrador, borrarBorrador } from '../lib/storage'

const hoy = () => new Date().toISOString().split('T')[0]

export const defaultNotas = {
  revisionInforme: 'EN LA REVISION E INSPECCIÓN DEL EQUIPO, SE ENTREGARÁ UN INFORME TÉCNICO CON LAS RECOMENDACIONES Y LOS TRABAJOS A REALIZAR PARA ASEGURAR EL CORRECTO FUNCIONAMIENTO DEL EQUIPO.',
  retenciones: 'ADJUNTAR RETENCIONES A DESCONTAR EN ORDEN DE COMPRA.',
  accesorios: 'EN CASO DE SER NECESARIO ALGÚN ACCESORIO, ESTE SE COTIZARÁ POR SEPARADO.',
}

function crearValoresPorDefecto(): CotizacionFormData {
  return {
    numero: getSiguienteNumero(),
    fecha: hoy(),
    validezDias: 15,
    descripcion: '',
    cliente: { nombre: '', nit: '', ciudad: '', contacto: '', telefono: '' },
    items: [
      {
        id: crypto.randomUUID(),
        descripcion: '',
        cantidad: 1,
        valorUnitario: 0,
        impuestoPorcentaje: 19,
      },
    ],
    descuentoPorcentaje: 0,
    notas: { ...defaultNotas },
    vendedor: '',
  }
}

const DRAFT_DEBOUNCE_MS = 1500

export function useQuoteForm() {
  const draftRestored = useRef(false)
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const inicial = useCallback(() => {
    if (!draftRestored.current) {
      const draft = cargarBorrador<CotizacionFormData>()
      if (draft && draft.numero) {
        draftRestored.current = true
        return draft
      }
      draftRestored.current = true
    }
    return crearValoresPorDefecto()
  }, [])

  const form = useForm<CotizacionFormData>({
    defaultValues: inicial(),
    mode: 'onChange',
  })

  const { control, watch, reset } = form
  const { fields, append, remove, move } = useFieldArray({ control, name: 'items' })

  const addItem = () => {
    append({
      id: crypto.randomUUID(),
      descripcion: '',
      cantidad: 1,
      valorUnitario: 0,
      impuestoPorcentaje: 19,
    })
  }

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  const empezarNueva = useCallback(() => {
    reset(crearValoresPorDefecto())
    borrarBorrador()
  }, [reset])

  useEffect(() => {
    const sub = watch((data) => {
      if (draftTimer.current) clearTimeout(draftTimer.current)
      draftTimer.current = setTimeout(() => {
        const { items, ...rest } = data as any
        guardarBorrador({
          ...rest,
          items: (items ?? []).map((it: any) => ({
            ...it,
            cantidad: Number(it?.cantidad) || 0,
            valorUnitario: Number(it?.valorUnitario) || 0,
            impuestoPorcentaje: Number(it?.impuestoPorcentaje) || 0,
          })),
        })
      }, DRAFT_DEBOUNCE_MS)
    })
    return () => sub.unsubscribe()
  }, [watch])

  return {
    ...form,
    fields,
    addItem,
    removeItem,
    moveItem: move,
    empezarNueva,
    siguienteNumero: getUltimoCorrelativo(),
  }
}

export type QuoteFormReturn = ReturnType<typeof useQuoteForm>
