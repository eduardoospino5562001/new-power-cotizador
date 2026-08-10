import { useEffect, useRef, useCallback } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import type { RemisionFormData } from '../logic/validation'
import { getSiguienteNumero } from '../lib/storage'
import { guardarBorrador, cargarBorrador, borrarBorrador } from '../lib/storage'

const hoy = () => new Date().toISOString().split('T')[0]

let logIdCounter = 0
let detIdCounter = 0
function nextLogId() {
  logIdCounter++
  return `log-${logIdCounter}`
}
function nextDetId() {
  detIdCounter++
  return `det-${detIdCounter}`
}

function crearLogisticaDefault() {
  return [
    { id: nextLogId(), nombre: 'Lugar despacho', valor: 'Villavicencio' },
    { id: nextLogId(), nombre: 'Lugar entrega', valor: 'Medellín' },
    { id: nextLogId(), nombre: 'Responsable transporte', valor: '' },
    { id: nextLogId(), nombre: 'Vehículo', valor: '' },
    { id: nextLogId(), nombre: 'Placa', valor: '' },
  ]
}

function crearDetallesDefault() {
  return [
    { id: nextDetId(), cantidad: '1', codigo: 'PL-450', descripcion: 'Planta eléctrica 450 KVA', serial: '', observaciones: 'Motor Detroit' },
  ]
}

function crearValoresPorDefecto(): RemisionFormData {
  return {
    numero: getSiguienteNumero(),
    fecha: hoy(),
    pedido: '',
    contrato: '',
    cliente: {
      nombre: '',
      ccNit: '',
      direccion: '',
      ciudad: '',
      telefono: '',
    },
    logistica: crearLogisticaDefault(),
    detalles: crearDetallesDefault(),
    observaciones: '',
    entrega: { firma: '', nombre: '', cargo: '', documento: '', fecha: '', hora: '' },
    recibe: { firma: '', nombre: '', cargo: '', documento: '', fecha: '', hora: '' },
  }
}

const DRAFT_DEBOUNCE_MS = 1500

export function useRemisionForm() {
  const draftRestored = useRef(false)
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inicializado = useRef(false)

  const inicial = useCallback(() => {
    if (!draftRestored.current) {
      const draft = cargarBorrador<RemisionFormData>()
      if (draft && draft.numero) {
        draftRestored.current = true
        return draft
      }
      draftRestored.current = true
    }
    return crearValoresPorDefecto()
  }, [])

  const form = useForm<RemisionFormData>({
    defaultValues: inicial(),
    mode: 'onChange',
  })

  const { watch, reset, control, getValues } = form

  const logFieldArray = useFieldArray({ control, name: 'logistica' })
  const detFieldArray = useFieldArray({ control, name: 'detalles' })

  const appendLogRef = useRef(logFieldArray.append)
  appendLogRef.current = logFieldArray.append
  const appendDetRef = useRef(detFieldArray.append)
  appendDetRef.current = detFieldArray.append

  useEffect(() => {
    if (inicializado.current) return
    inicializado.current = true
    const values = getValues()
    if (!values.logistica || values.logistica.length === 0) {
      crearLogisticaDefault().forEach((l) => appendLogRef.current(l))
    }
    if (!values.detalles || values.detalles.length === 0) {
      crearDetallesDefault().forEach((d) => appendDetRef.current(d))
    }
  }, [getValues])

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
    control,
    logFields: logFieldArray.fields,
    appendLog: logFieldArray.append,
    removeLog: logFieldArray.remove,
    moveLog: logFieldArray.move,
    detFields: detFieldArray.fields,
    appendDet: detFieldArray.append,
    removeDet: detFieldArray.remove,
    moveDet: detFieldArray.move,
    empezarNueva,
  }
}

export type RemisionFormReturn = ReturnType<typeof useRemisionForm>
