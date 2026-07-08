import { useComprobantesForm } from './hooks/useComprobantesForm'
import { ComprobantesForm } from './components/ComprobantesForm'
import { ComprobantesPreview } from './components/ComprobantesPreview'

export function Contabilidad() {
  const comprobantesForm = useComprobantesForm()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <ComprobantesForm form={comprobantesForm} />
      </div>
      <div className="lg:sticky lg:top-6 lg:self-start">
        <ComprobantesPreview form={comprobantesForm} />
      </div>
    </div>
  )
}
