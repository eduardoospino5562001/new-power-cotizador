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

let espCounter = 0
let grupoCounter = 0
let clausulaCounter = 0
function nextEspId() { espCounter++; return `esp-${espCounter}` }
function nextGrupoId() { grupoCounter++; return `grp-${grupoCounter}` }
function nextClausulaId() { clausulaCounter++; return `cl-${clausulaCounter}` }

function crearItemsDefault() {
  return [
    { id: nextEspId(), nombre: 'Marca', valor: 'Detroit' },
    { id: nextEspId(), nombre: 'Potencia', valor: '500 KVA' },
    { id: nextEspId(), nombre: 'Modelo', valor: '' },
    { id: nextEspId(), nombre: 'Serial Motor', valor: '' },
    { id: nextEspId(), nombre: 'Serial Generador', valor: '' },
    { id: nextEspId(), nombre: 'Horas', valor: '0' },
    { id: nextEspId(), nombre: 'Voltaje', valor: '' },
    { id: nextEspId(), nombre: 'Frecuencia', valor: '' },
    { id: nextEspId(), nombre: 'Radiador', valor: 'Sí' },
    { id: nextEspId(), nombre: 'Breaker', valor: 'Sí' },
    { id: nextEspId(), nombre: 'Módulo', valor: 'Sí' },
    { id: nextEspId(), nombre: 'Baterías', valor: '2' },
  ]
}

function crearClausulasDefault() {
  return [
    { id: nextClausulaId(), titulo: 'PRIMERA. OBJETO', texto: 'EL VENDEDOR vende a EL COMPRADOR una planta eléctrica de segunda, con las características descritas en las especificaciones del equipo. Lo anterior conforme a la cotización No. correspondiente.' },
    { id: nextClausulaId(), titulo: 'SEGUNDA. VALOR', texto: 'El valor total de la compraventa es el indicado en el resumen económico del presente contrato.' },
    { id: nextClausulaId(), titulo: 'TERCERA. FORMA DE PAGO', texto: 'EL COMPRADOR pagará el valor del contrato según lo establecido en el resumen económico: un pago inicial y el saldo en la fecha acordada.' },
    { id: nextClausulaId(), titulo: 'CUARTA. ENTREGA', texto: 'EL VENDEDOR hará entrega de la planta eléctrica en la ciudad de Medellín, una vez se cumplan las condiciones de pago pactadas entre las partes.' },
    { id: nextClausulaId(), titulo: 'QUINTA. GARANTÍA', texto: 'La planta eléctrica cuenta con una garantía de quinientas (500) horas de funcionamiento o tres (3) meses, lo que ocurra primero.' },
    { id: nextClausulaId(), titulo: 'SEXTA. INSTALACIÓN Y TRANSPORTE', texto: 'En caso de requerirse instalación, los gastos de transporte, viáticos y demás costos asociados serán asumidos por EL COMPRADOR.' },
    { id: nextClausulaId(), titulo: 'SÉPTIMA. ESTADO DEL BIEN', texto: 'EL COMPRADOR declara conocer que el equipo objeto de este contrato corresponde a una planta eléctrica usada (de segunda), aceptando su estado de funcionamiento al momento de la entrega.' },
    { id: nextClausulaId(), titulo: 'OCTAVA. PERFECCIONAMIENTO', texto: 'El presente contrato se entiende perfeccionado con la firma de las partes.' },
    { id: nextClausulaId(), titulo: 'NOVENA. OBLIGACIONES DEL VENDEDOR', texto: 'EL VENDEDOR se obliga a entregar el equipo en el estado acordado, con todos sus accesorios y documentación asociada.' },
    { id: nextClausulaId(), titulo: 'DÉCIMA. OBLIGACIONES DEL COMPRADOR', texto: 'EL COMPRADOR se obliga a pagar el valor acordado en la forma y plazos estipulados.' },
    { id: nextClausulaId(), titulo: 'UNDÉCIMA. INCUMPLIMIENTO', texto: 'En caso de incumplimiento por cualquiera de las partes, la parte afectada podrá exigir el cumplimiento o la resolución del contrato.' },
    { id: nextClausulaId(), titulo: 'DUODÉCIMA. CLÁUSULA PENAL', texto: 'En caso de mora en el pago, EL COMPRADOR pagará un interés moratorio equivalente al máximo legal permitido.' },
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
    grupos: [{ id: nextGrupoId(), nombre: 'Equipo 1', items: crearItemsDefault() }],
    clausulas: crearClausulasDefault(),
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
  const inicializado = useRef(false)

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

  const { watch, reset, setValue, control, getValues } = form

  const gruposFieldArray = useFieldArray({ control, name: 'grupos' })
  const clausulasFieldArray = useFieldArray({ control, name: 'clausulas' })

  const appendGrupoRef = useRef(gruposFieldArray.append)
  appendGrupoRef.current = gruposFieldArray.append
  const appendClausulaRef = useRef(clausulasFieldArray.append)
  appendClausulaRef.current = clausulasFieldArray.append

  useEffect(() => {
    if (inicializado.current) return
    inicializado.current = true
    const values = getValues()
    if (!values.clausulas || values.clausulas.length === 0) {
      crearClausulasDefault().forEach((c) => appendClausulaRef.current(c))
    }
    if (!values.grupos || values.grupos.length === 0) {
      appendGrupoRef.current({ id: nextGrupoId(), nombre: 'Equipo 1', items: crearItemsDefault() })
    }
  }, [getValues])

  const addItemToGrupo = useCallback((grupoIndex: number) => {
    const grupos = getValues('grupos') || []
    const items = grupos[grupoIndex]?.items || []
    setValue(`grupos.${grupoIndex}.items`, [
      ...items,
      { id: `esp-${Date.now()}`, nombre: '', valor: '' },
    ])
  }, [getValues, setValue])

  const removeItemFromGrupo = useCallback((grupoIndex: number, itemIndex: number) => {
    const grupos = getValues('grupos') || []
    const items = grupos[grupoIndex]?.items || []
    setValue(`grupos.${grupoIndex}.items`, items.filter((_, i) => i !== itemIndex))
  }, [getValues, setValue])

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
    gruposFields: gruposFieldArray.fields,
    appendGrupo: gruposFieldArray.append,
    removeGrupo: gruposFieldArray.remove,
    addItemToGrupo,
    removeItemFromGrupo,
    clausulasFields: clausulasFieldArray.fields,
    appendClausula: clausulasFieldArray.append,
    removeClausula: clausulasFieldArray.remove,
    empezarNueva,
  }
}

export type ContractFormReturn = ReturnType<typeof useContractForm>
