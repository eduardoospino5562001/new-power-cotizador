const NUMERO_KEY = 'npc-numero'
const DRAFT_KEY = 'npc-borrador'

export function getUltimoCorrelativo(): number {
  try {
    const val = localStorage.getItem(NUMERO_KEY)
    return val ? Number(val) : 118
  } catch {
    return 118
  }
}

export function setUltimoCorrelativo(val: number): void {
  try {
    localStorage.setItem(NUMERO_KEY, String(val))
  } catch {
    /* localStorage no disponible */
  }
}

export function getSiguienteNumero(): string {
  const actual = getUltimoCorrelativo()
  return `C-1-${actual}`
}

export function avanzarNumero(): void {
  const actual = getUltimoCorrelativo()
  setUltimoCorrelativo(actual + 1)
}

export function reiniciarNumero(semilla: number): void {
  setUltimoCorrelativo(semilla)
}

export function guardarBorrador(data: unknown): void {
  try {
    const serialized = JSON.stringify(data)
    localStorage.setItem(DRAFT_KEY, serialized)
  } catch {
    /* localStorage no disponible */
  }
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
  } catch {
    /* localStorage no disponible */
  }
}
