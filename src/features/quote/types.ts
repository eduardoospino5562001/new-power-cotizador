export interface Cliente {
  nombre: string
  nit: string
  ciudad?: string
  contacto?: string
  telefono?: string
}

export interface ItemCotizacion {
  id: string
  descripcion: string
  cantidad: number
  valorUnitario: number
  impuestoPorcentaje: number
}

export interface NotasCotizacion {
  revisionInforme: string
  retenciones: string
  accesorios: string
}

export interface Cotizacion {
  numero: string
  fecha: string
  validezDias: number
  cliente: Cliente
  items: ItemCotizacion[]
  descuentoPorcentaje: number
  notas: NotasCotizacion
  vendedor?: string
}

export interface TotalesCalculados {
  totalBruto: number
  descuento: number
  subtotal: number
  totalIva: number
  totalAPagar: number
}

export interface LineaCalculada {
  bruto: number
  ivaItem: number
}
