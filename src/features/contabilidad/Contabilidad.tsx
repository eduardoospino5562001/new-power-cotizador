import { useComprobantesForm } from './hooks/useComprobantesForm'
import { ComprobantesForm } from './components/ComprobantesForm'
import { ComprobantesPreview } from './components/ComprobantesPreview'
import { ResultView } from './components/ResultView'

export function Contabilidad() {
  const form = useComprobantesForm()

  if (form.result) {
    return (
      <ResultView
        result={form.result}
        onDownload={form.download}
        onBack={form.backToForm}
      />
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <ComprobantesForm form={form} />
      </div>
      <div className="lg:sticky lg:top-6 lg:self-start">
        <ComprobantesPreview form={form} />
      </div>
    </div>
  )
}
