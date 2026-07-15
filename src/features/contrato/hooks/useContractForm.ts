import { useEffect, useRef, useCallback } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import type { ContratoFormData } from '../logic/validation'
import { getSiguienteNumero } from '../lib/storage'
import { guardarBorrador, cargarBorrador, borrarBorrador } from '../lib/storage'
import { calcularSaldo } from '../logic/calculations'

const hoy = () => new Date().toISOString().split('T')[0]

const vendedorDefaults = {
  razonSocial: 'NEW POWER ENERGY S.A.S.',
  nit: '901.826.285-6',
  direccion: 'Villavicencio, Meta',
  ciudad: 'Villavicencio',
  telefono: '(57) 3204931541',
  correo: '',
}

let idCounter = 0
function nextId() {
  idCounter++
  return `esp-${idCounter}`
}

function crearEspecificacionesDefault() {
  return [
    { id: nextId(), nombre: 'Marca', valor: 'Detroit' },
    { id: nextId(), nombre: 'Potencia', valor: '500 KVA' },
    { id: nextId(), nombre: 'Modelo', valor: '' },
    { id: nextId(), nombre: 'Serial Motor', valor: '' },
    { id: nextId(), nombre: 'Serial Generador', valor: '' },
    { id: nextId(), nombre: 'Horas', valor: '0' },
    { id: nextId(), nombre: 'Voltaje', valor: '' },
    { id: nextId(), nombre: 'Frecuencia', valor: '' },
    { id: nextId(), nombre: 'Radiador', valor: 'Sí' },
    { id: nextId(), nombre: 'Breaker', valor: 'Sí' },
    { id: nextId(), nombre: 'Módulo', valor: 'Sí' },
    { id: nextId(), nombre: 'Baterías', valor: '2' },
  ]
}

function crearValoresPorDefecto(): ContratoFormData {
  return {
    numero: getSiguienteNumero(),
    fecha: hoy(),
    vendedor: { ...vendedorDefaults },
    comprador: {
      nombre: '',
      ccNit: '',
      direccion: '',
      ciudad: '',
      telefono: '',
      correo: '',
    },
    especificaciones: crearEspecificacionesDefault(),
    economico: {
      valorTotal: 65000000,
      pagoInicial: 45000000,
      saldo: 20000000,
      fechaLimite: '',
    },
    observaciones: '',
  }
}

const DRAFT_DEBOUNCE_MS = 1500

export function useContractForm() {
  const draftRestored = useRef(false)
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const inicial = useCallback(() => {
    if (!draftRestored.current) {
      const draft = cargarBorrador<ContratoFormData>()
      if (draft && draft.numero) {
        draftRestored.current = true
        return draft
      }
      draftRestored.current = true
    }
    return crearValoresPorDefecto()
  }, [])

  const form = useForm<ContratoFormData>({
    defaultValues: inicial(),
    mode: 'onChange',
  })

  const { watch, reset, setValue, control } = form

  const fieldArray = useFieldArray({
    control,
    name: 'especificaciones',
  })

  useEffect(() => {
    const sub = watch((data, { name }) => {
      if (name === 'economico.valorTotal' || name === 'economico.pagoInicial') {
        const valorTotal = Number((data as any)?.economico?.valorTotal) || 0
        const pagoInicial = Number((data as any)?.economico?.pagoInicial) || 0
        const saldo = calcularSaldo(valorTotal, pagoInicial)
        setValue('economico.saldo', saldo, { shouldValidate: false })
      }
    })
    return () => sub.unsubscribe()
  }, [watch, setValue])

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
    fields: fieldArray.fields,
    append: fieldArray.append,
    remove: fieldArray.remove,
    empezarNueva,
  }
}

export type ContractFormReturn = ReturnType<typeof useContractForm>
