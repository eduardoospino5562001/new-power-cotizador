export interface Cliente {
  nombre: string
  ccNit: string
  direccion: string
  ciudad: string
  telefono: string
}

export interface InformacionLogistica {
  lugarDespacho: string
  lugarEntrega: string
  responsableTransporte: string
  vehiculo: string
  placa: string
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
  logistica: InformacionLogistica
  detalles: DetalleItem[]
  observaciones: string
  entrega: FirmaInfo
  recibe: FirmaInfo
}
