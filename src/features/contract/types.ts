export interface Vendedor {
  razonSocial: string
  nit: string
  direccion: string
  ciudad: string
  telefono: string
  correo: string
}

export interface Comprador {
  nombre: string
  ccNit: string
  direccion: string
  ciudad: string
  telefono: string
  correo: string
}

export interface EspecificacionesEquipo {
  marca: string
  potencia: string
  modelo: string
  serialMotor: string
  serialGenerador: string
  horas: number
  voltaje: string
  frecuencia: string
  radiador: boolean
  breaker: boolean
  modulo: boolean
  baterias: number
}

export interface ResumenEconomico {
  valorTotal: number
  pagoInicial: number
  saldo: number
  fechaLimite: string
}

export interface ContratoCompraventa {
  numero: string
  fecha: string
  vendedor: Vendedor
  comprador: Comprador
  equipo: EspecificacionesEquipo
  economico: ResumenEconomico
  observaciones: string
}
