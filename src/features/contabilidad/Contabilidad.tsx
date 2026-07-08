import { useState } from 'react'
import { useComprobantesForm } from './hooks/useComprobantesForm'
import { ComprobantesForm } from './components/ComprobantesForm'
import { ComprobantesPreview } from './components/ComprobantesPreview'
import { ResultView } from './components/ResultView'
import { FileSpreadsheet, Eye, Table2 } from 'lucide-react'

type Tab = 'origen' | 'comprobantes' | 'visor'

export function Contabilidad() {
  const [tab, setTab] = useState<Tab>('origen')
  const form = useComprobantesForm()

  const tabs = [
    { id: 'origen' as Tab, label: 'Archivo de origen', icon: FileSpreadsheet },
    { id: 'comprobantes' as Tab, label: 'Comprobantes contables', icon: Table2 },
    { id: 'visor' as Tab, label: 'Visor de Excel', icon: Eye, disabled: !form.result },
  ]

  return (
    <div className="space-y-6">
      <div className="flex gap-1 bg-brand-light rounded-lg p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            disabled={t.disabled}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
              tab === t.id
                ? 'bg-white text-brand-dark shadow-sm'
                : t.disabled
                  ? 'text-brand-gray/40 cursor-not-allowed'
                  : 'text-brand-gray hover:text-brand-dark'
            }`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'origen' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <ComprobantesForm form={form} />
          </div>
          <div className="lg:sticky lg:top-6 lg:self-start">
            <ComprobantesPreview form={form} />
          </div>
        </div>
      )}

      {tab === 'comprobantes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <ComprobantesForm form={form} />
          </div>
          <div className="lg:sticky lg:top-6 lg:self-start">
            <ComprobantesPreview form={form} />
          </div>
        </div>
      )}

      {tab === 'visor' && form.result && (
        <ResultView
          result={form.result}
          onDownload={form.download}
        />
      )}
    </div>
  )
}
