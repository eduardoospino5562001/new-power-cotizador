const STORAGE_KEY = 'npc-contrato-borrador'
const NUMERO_KEY = 'npc-contrato-numero'

export function getSiguienteNumero(): string {
  const ultimo = getUltimoCorrelativo()
  const siguiente = ultimo + 1
  guardarCorrelativo(siguiente)
  return `CC-${String(siguiente).padStart(3, '0')}`
}

export function getUltimoCorrelativo(): number {
  try {
    return Number(localStorage.getItem(NUMERO_KEY)) || 0
  } catch {
    return 0
  }
}

function guardarCorrelativo(num: number): void {
  try {
    localStorage.setItem(NUMERO_KEY, String(num))
  } catch { /* ignore quota errors */ }
}

export function guardarBorrador<T>(data: T): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch { /* ignore */ }
}

export function cargarBorrador<T>(): T | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function borrarBorrador(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch { /* ignore */ }
}
