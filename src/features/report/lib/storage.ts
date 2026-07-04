const DRAFT_KEY = 'npr-borrador'
const NUMERO_KEY = 'npr-numero'

export function getUltimoCorrelativo(): number {
  try {
    const val = localStorage.getItem(NUMERO_KEY)
    return val ? Number(val) : 0
  } catch {
    return 0
  }
}

export function setUltimoCorrelativo(val: number): void {
  try {
    localStorage.setItem(NUMERO_KEY, String(val))
  } catch { }
}

export function getSiguienteNumero(): string {
  const actual = getUltimoCorrelativo()
  return `IT-${String(actual + 1).padStart(3, '0')}`
}

export function avanzarNumero(): void {
  const actual = getUltimoCorrelativo()
  setUltimoCorrelativo(actual + 1)
}

export function guardarBorrador(data: unknown): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data))
  } catch { }
}

export function cargarBorrador<T>(): T | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function borrarBorrador(): void {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch { }
}
