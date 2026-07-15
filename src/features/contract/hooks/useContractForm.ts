import { useEffect, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
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
    equipo: {
      marca: 'Detroit',
      potencia: '500 KVA',
      modelo: '',
      serialMotor: '',
      serialGenerador: '',
      horas: 0,
      voltaje: '',
      frecuencia: '',
      radiador: true,
      breaker: true,
      modulo: true,
      baterias: 2,
    },
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

  const { watch, reset, setValue } = form

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
    empezarNueva,
  }
}

export type ContractFormReturn = ReturnType<typeof useContractForm>
