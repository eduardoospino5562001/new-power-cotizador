import { useState, type ReactNode } from 'react'
import { Eye, PencilLine } from 'lucide-react'

interface DocumentWorkspaceProps {
  editor: ReactNode
  preview: ReactNode
}

export function DocumentWorkspace({ editor, preview }: DocumentWorkspaceProps) {
  const [view, setView] = useState<'editor' | 'preview'>('editor')

  return (
    <section>
      <div className="mb-6 inline-flex rounded-xl border border-brand-orange-light bg-brand-light p-1">
        <button type="button" onClick={() => setView('editor')} className={`flex min-h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors ${view === 'editor' ? 'bg-brand-orange text-white shadow-sm' : 'text-brand-gray hover:text-brand-dark'}`}><PencilLine size={17} /> Edición</button>
        <button type="button" onClick={() => setView('preview')} className={`flex min-h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors ${view === 'preview' ? 'bg-brand-orange text-white shadow-sm' : 'text-brand-gray hover:text-brand-dark'}`}><Eye size={17} /> Vista previa</button>
      </div>
      <div className="mx-auto max-w-4xl">{view === 'editor' ? editor : preview}</div>
    </section>
  )
}
