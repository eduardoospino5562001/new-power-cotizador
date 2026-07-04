import { useEffect, useRef, useCallback } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import type { InformeFormData } from '../logic/validation'
import { guardarBorrador, cargarBorrador, borrarBorrador, getSiguienteNumero } from '../lib/storage'

const hoy = () => new Date().toISOString().split('T')[0]

function crearValoresPorDefecto(): InformeFormData {
  return {
    numero: getSiguienteNumero(),
    titulo: 'INFORME TÉCNICO',
    fecha: hoy(),
    cliente: '',
    nit: '',
    observaciones: '',
    tecnico: '',
    grupos: [],
  }
}

const DRAFT_DEBOUNCE_MS = 1500

export function useReportForm() {
  const draftRestored = useRef(false)
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const inicial = useCallback(() => {
    if (!draftRestored.current) {
      const draft = cargarBorrador<InformeFormData>()
      if (draft && draft.fecha) {
        draftRestored.current = true
        return draft
      }
      draftRestored.current = true
    }
    return crearValoresPorDefecto()
  }, [])

  const form = useForm<InformeFormData>({
    defaultValues: inicial(),
    mode: 'onChange',
  })

  const { control, watch, reset } = form
  const { fields, append, remove, move } = useFieldArray({ control, name: 'grupos' })

  const addGrupo = () => {
    append({ id: crypto.randomUUID(), nombre: '', fotos: [] })
  }

  const removeGrupo = (index: number) => {
    if (fields.length > 1) remove(index)
  }

  const moveGrupo = (from: number, to: number) => {
    move(from, to)
  }

  const empezarNueva = useCallback(() => {
    reset(crearValoresPorDefecto())
    borrarBorrador()
  }, [reset])

  useEffect(() => {
    const sub = watch((data) => {
      if (draftTimer.current) clearTimeout(draftTimer.current)
      draftTimer.current = setTimeout(() => {
        guardarBorrador(data)
      }, DRAFT_DEBOUNCE_MS)
    })
    return () => sub.unsubscribe()
  }, [watch])

  return {
    ...form,
    grupos: fields,
    addGrupo,
    removeGrupo,
    moveGrupo,
    empezarNueva,
  }
}

export type ReportFormReturn = ReturnType<typeof useReportForm>
