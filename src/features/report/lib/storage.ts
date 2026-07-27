const DB_NAME = 'new-power-reports'
const DB_VERSION = 1
const STORE_NAME = 'drafts'
const DRAFT_KEY = 'npr-borrador'
const NUMERO_KEY = 'npr-numero'

function abrirDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

// --- Correlativo (localStorage, dato pequeño) ---

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

// --- Borrador (IndexedDB, porque incluye fotos en base64) ---

export async function guardarBorrador(data: unknown): Promise<void> {
  try {
    const db = await abrirDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(data, DRAFT_KEY)
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
    db.close()
  } catch (e) {
    console.warn('Error al guardar borrador en IndexedDB:', e)
  }
}

export async function cargarBorrador<T>(): Promise<T | null> {
  try {
    const db = await abrirDB()
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get(DRAFT_KEY)
    const result = await new Promise<T | undefined>((resolve, reject) => {
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
    db.close()
    return result ?? null
  } catch {
    return null
  }
}

export async function borrarBorrador(): Promise<void> {
  try {
    const db = await abrirDB()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(DRAFT_KEY)
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
    db.close()
  } catch { }
}
