const DATABASE_NAME = 'new-power-export-history'
const DATABASE_VERSION = 2
const STORE_NAME = 'exports'

export type HistoryFileType = 'pdf' | 'excel'
export type HistoryModuleId = 'quote' | 'report' | 'contract' | 'remision' | 'contabilidad'

export interface HistoryRecord {
  id: string
  name: string
  module: string
  moduleId?: HistoryModuleId
  tool: string
  createdAt: string
  lastDownloadedAt?: string
  mime: string
  blob: Blob
  editableData?: unknown
  isEditable?: boolean
}

export type HistoryRecordMetadata = Omit<HistoryRecord, 'blob'>

export interface CreateHistoryRecordInput {
  name: string
  module: string
  /** Stable identifier used to route a saved snapshot back to its editor. */
  moduleId?: HistoryModuleId
  tool: string
  mime: string
  blob: Blob
  /** Structured form data captured when the export was generated. */
  editableData?: unknown
  /** False when the export cannot be recreated from its saved snapshot. */
  isEditable?: boolean
}

export interface HistoryListOptions {
  search?: string
  type?: HistoryFileType
}

function getDatabase(): Promise<IDBDatabase> {
  if (!('indexedDB' in globalThis)) {
    return Promise.reject(new Error('El historial local no esta disponible en este navegador.'))
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)

    request.onupgradeneeded = () => {
      const database = request.result
      const store = database.objectStoreNames.contains(STORE_NAME)
        ? request.transaction!.objectStore(STORE_NAME)
        : database.createObjectStore(STORE_NAME, { keyPath: 'id' })

      if (!store.indexNames.contains('createdAt')) {
        store.createIndex('createdAt', 'createdAt')
      }
      // Version 2 stores optional snapshot properties inline. Version 1 records
      // remain valid and simply have undefined moduleId/editableData/isEditable.
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('No se pudo abrir el historial local.'))
  })
}

function runTransaction<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return getDatabase().then((database) => new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode)
    const request = operation(transaction.objectStore(STORE_NAME))
    let result: T

    request.onsuccess = () => { result = request.result }
    request.onerror = () => reject(request.error ?? new Error('No se pudo actualizar el historial local.'))
    transaction.oncomplete = () => {
      database.close()
      resolve(result)
    }
    transaction.onerror = () => {
      database.close()
      reject(transaction.error ?? new Error('No se pudo actualizar el historial local.'))
    }
    transaction.onabort = () => database.close()
  }))
}

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function matchesType(record: HistoryRecord, type?: HistoryFileType): boolean {
  if (!type) return true
  return type === 'pdf'
    ? record.mime === 'application/pdf'
    : /excel|spreadsheet/i.test(record.mime)
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function createHistoryRecord(input: CreateHistoryRecordInput): Promise<HistoryRecord> {
  const record: HistoryRecord = {
    ...input,
    id: createId(),
    createdAt: new Date().toISOString(),
  }
  await runTransaction('readwrite', (store) => store.add(record))
  return record
}

export async function listHistoryRecords(options: HistoryListOptions = {}): Promise<HistoryRecord[]> {
  const records = await runTransaction('readonly', (store) => store.getAll()) as HistoryRecord[]
  const search = options.search?.trim().toLocaleLowerCase()

  return records
    .filter((record) => matchesType(record, options.type))
    .filter((record) => !search || [record.name, record.module, record.tool].some((value) => value.toLocaleLowerCase().includes(search)))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function getHistoryRecordMetadata(id: string): Promise<HistoryRecordMetadata> {
  const record = await runTransaction('readonly', (store) => store.get(id)) as HistoryRecord | undefined
  if (!record) throw new Error('El archivo no existe en el historial local.')

  const { blob: _blob, ...metadata } = record
  return metadata
}

export async function openHistoryRecord(id: string): Promise<{ record: HistoryRecord; url: string }> {
  const record = await runTransaction('readonly', (store) => store.get(id)) as HistoryRecord | undefined
  if (!record) throw new Error('El archivo no existe en el historial local.')

  const lastDownloadedAt = new Date().toISOString()
  const updatedRecord = { ...record, lastDownloadedAt }
  await runTransaction('readwrite', (store) => store.put(updatedRecord))

  return { record: updatedRecord, url: URL.createObjectURL(updatedRecord.blob) }
}

export async function downloadHistoryRecord(id: string): Promise<void> {
  const { record, url } = await openHistoryRecord(id)
  const link = document.createElement('a')
  link.href = url
  link.download = record.name
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export async function deleteHistoryRecord(id: string): Promise<void> {
  await runTransaction('readwrite', (store) => store.delete(id))
}

export async function saveAndDownloadHistoryRecord(input: CreateHistoryRecordInput): Promise<void> {
  try {
    const record = await createHistoryRecord(input)
    await downloadHistoryRecord(record.id)
  } catch (error) {
    // Downloading remains available even if IndexedDB is disabled or storage is full.
    console.warn('No se pudo guardar el archivo en el historial local.', error)
    downloadBlob(input.blob, input.name)
  }
}
