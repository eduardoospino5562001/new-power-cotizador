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

export interface ComprobanteParams {
  sourceFile: File
  templateFile: File
  startConsecutive: number
  selectedProject: string
  year: number
  month: number
  accountMap: AccountMap
}

export interface CashboxRecord {
  recordNumber: number
  consecutive: number
  lot: string
  paymentMethod: string
  paymentConcept: string
  amount: number
  advisor: string
}

export interface ScanResult {
  projects: Record<string, ProjectInfo>
  years: number[]
  months: number[]
}
