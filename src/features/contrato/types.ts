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

export interface EspecificacionItem {
  id: string
  nombre: string
  valor: string
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
  especificaciones: EspecificacionItem[]
  economico: ResumenEconomico
  observaciones: string
}
