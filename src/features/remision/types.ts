export interface Cliente {
  nombre: string
  ccNit: string
  direccion: string
  ciudad: string
  telefono: string
}

export interface LogisticaItem {
  id: string
  nombre: string
  valor: string
}

export interface DetalleItem {
  id: string
  cantidad: string
  codigo: string
  descripcion: string
  serial: string
  observaciones: string
}

export interface FirmaInfo {
  firma: string
  nombre: string
  cargo: string
  documento: string
  fecha: string
  hora: string
}

export interface Remision {
  numero: string
  fecha: string
  pedido: string
  contrato: string
  cliente: Cliente
  logistica: LogisticaItem[]
  detalles: DetalleItem[]
  observaciones: string
  entrega: FirmaInfo
  recibe: FirmaInfo
}
