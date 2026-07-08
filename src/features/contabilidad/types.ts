export interface SourceRow {
  lot: string
  date: Date
  medium: string
  amount: number
  label: string
  receipt: string | null
  thirdId: string | null
  installment: number | null
}

export interface ProjectInfo {
  total: number
  missingAmount: number
}

export interface AccountMap {
  EFECTIVO: number
  BONIFICACION: number
  CTA_ARQ: number
  CTA_KATHE: number
  BANCOLOMBIA: number
  DAVIVIENDA: number
}

export interface ScanResult {
  projects: Record<string, ProjectInfo>
  years: number[]
  months: number[]
}

export interface OutputRow {
  tipoComprobante: number
  consecutivo: number
  fechaElaboracion: Date
  siglaMoneda: string
  tasaCambio: null
  codigoCuenta: number | string
  identificacionTercero: string | null
  sucursal: null
  codigoProducto: null
  codigoBodega: null
  accion: null
  cantidadProducto: null
  prefijo: string | null
  reciboConsecutivo: string | null
  numeroCuota: number | null
  fechaVencimiento: Date | null
  codigoImpuesto: null
  codigoGrupoActivo: null
  codigoActivoFijo: null
  descripcion: string
  codigoCentroCostos: null
  debito: number | null
  credito: number | null
  observaciones: null
  baseGravable: null
  baseExenta: null
  mesCierre: null
}
