import { useEffect, useMemo, useState } from 'react'
import { Download, ExternalLink, FilePenLine, FileSpreadsheet, FileText, Search, Trash2 } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import {
  deleteHistoryRecord,
  downloadHistoryRecord,
  listHistoryRecords,
  openHistoryRecord,
  getHistoryRecordMetadata,
  type HistoryFileType,
  type HistoryRecord,
} from './historyStore'

const PAGE_SIZE = 12

function formatDate(value?: string) {
  return value ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Sin descargas'
}

export function HistoryPage({ onResume }: { onResume: (record: HistoryRecord) => void }) {
  const [records, setRecords] = useState<HistoryRecord[]>([])
  const [search, setSearch] = useState('')
  const [type, setType] = useState<HistoryFileType | undefined>()
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      setRecords(await listHistoryRecords({ search, type }))
      setError(null)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo cargar el historial.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [search, type])
  useEffect(() => { setPage(0) }, [search, type])

  const pages = Math.max(1, Math.ceil(records.length / PAGE_SIZE))
  const visible = useMemo(() => records.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE), [page, records])

  const handleOpen = async (record: HistoryRecord) => {
    const { url } = await openHistoryRecord(record.id)
    window.open(url, '_blank', 'noopener,noreferrer')
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
    load()
  }

  const handleDownload = async (record: HistoryRecord) => {
    await downloadHistoryRecord(record.id)
    load()
  }

  const handleDelete = async (record: HistoryRecord) => {
    if (!window.confirm(`Eliminar “${record.name}” del historial local?`)) return
    await deleteHistoryRecord(record.id)
    load()
  }

  const handleResume = async (record: HistoryRecord) => {
    const metadata = await getHistoryRecordMetadata(record.id)
    onResume({ ...record, ...metadata })
  }

  return (
    <section className="space-y-6">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-orange">Biblioteca local</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-brand-dark sm:text-4xl">Historial de documentos</h2>
        <p className="mt-3 text-brand-gray">Tus archivos se guardan solo en este navegador para abrirlos o descargarlos otra vez cuando los necesites.</p>
      </div>

      <Card className="p-3 sm:p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="relative block min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray" size={18} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre o herramienta" className="w-full rounded-lg border border-brand-orange-light py-2.5 pl-10 pr-3 text-base text-brand-dark outline-none focus:ring-2 focus:ring-brand-orange sm:text-sm" />
          </label>
          <div className="grid grid-cols-3 gap-1 rounded-lg bg-brand-light p-1">
            {([['Todo', undefined], ['PDF', 'pdf'], ['Excel', 'excel']] as const).map(([label, value]) => (
              <button key={label} type="button" onClick={() => setType(value)} className={`min-h-10 rounded-md px-3 text-sm font-semibold transition-colors ${type === value ? 'bg-white text-brand-dark shadow-sm' : 'text-brand-gray hover:text-brand-dark'}`}>{label}</button>
            ))}
          </div>
        </div>
      </Card>

      {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      {loading ? <p className="py-12 text-center text-sm text-brand-gray">Cargando historial...</p> : visible.length === 0 ? (
        <Card className="py-14 text-center">
          <FileText className="mx-auto mb-3 text-brand-orange" size={32} />
          <h3 className="font-bold text-brand-dark">Aun no hay documentos guardados</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-brand-gray">Los PDF y archivos Excel que generes apareceran aqui automaticamente.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {visible.map((record) => {
            const isPdf = record.mime === 'application/pdf'
            const Icon = isPdf ? FileText : FileSpreadsheet
            return <Card key={record.id} className="flex min-w-0 flex-col p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand-orange-light text-brand-orange-dark"><Icon size={21} /></div>
                <div className="min-w-0"><p className="truncate font-semibold text-brand-dark" title={record.name}>{record.name}</p><p className="mt-0.5 text-xs text-brand-gray">{record.tool} · {isPdf ? 'PDF' : 'Excel'}</p></div>
              </div>
              <dl className="mt-5 space-y-1 border-t border-brand-orange-light pt-3 text-xs text-brand-gray"><div className="flex justify-between gap-3"><dt>Creado</dt><dd className="text-right text-brand-dark">{formatDate(record.createdAt)}</dd></div><div className="flex justify-between gap-3"><dt>Ultima descarga</dt><dd className="text-right text-brand-dark">{formatDate(record.lastDownloadedAt)}</dd></div></dl>
              <div className={`mt-4 grid gap-2 ${record.isEditable ? 'grid-cols-4' : 'grid-cols-3'}`}>{record.isEditable && <Button type="button" variant="primary" size="sm" onClick={() => handleResume(record)} aria-label={`Continuar editando ${record.name}`}><FilePenLine size={16} /></Button>}<Button type="button" variant="secondary" size="sm" onClick={() => handleOpen(record)} aria-label={`Abrir ${record.name}`}><ExternalLink size={16} /></Button><Button type="button" variant="secondary" size="sm" onClick={() => handleDownload(record)} aria-label={`Descargar ${record.name}`}><Download size={16} /></Button><Button type="button" variant="ghost" size="sm" onClick={() => handleDelete(record)} aria-label={`Eliminar ${record.name}`}><Trash2 size={16} /></Button></div>
            </Card>
          })}
        </div>
      )}
      {records.length > PAGE_SIZE && <div className="flex items-center justify-center gap-3"><Button type="button" variant="secondary" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Anterior</Button><span className="text-sm text-brand-gray">{page + 1} / {pages}</span><Button type="button" variant="secondary" size="sm" disabled={page >= pages - 1} onClick={() => setPage(page + 1)}>Siguiente</Button></div>}
    </section>
  )
}
