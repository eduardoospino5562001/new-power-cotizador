import type { ComprobantesFormReturn } from '../hooks/useComprobantesForm'
import { Card } from '@/components/ui'
import { CheckCircle2 } from 'lucide-react'

interface ComprobantesPreviewProps {
  form: ComprobantesFormReturn
}

export function ComprobantesPreview({ form }: ComprobantesPreviewProps) {
  const { scanResult, selectedProject, selectedYear, selectedMonth, startConsecutive, accountMap, success } = form

  const projectInfo = scanResult && selectedProject ? scanResult.projects[selectedProject] : null

  return (
    <Card className="border-2 border-brand-orange shadow-md">
      <h2 className="text-xl font-bold text-brand-dark tracking-tight text-center mb-4">
        COMPROBANTES CONTABLES
      </h2>

      {!scanResult && (
        <div className="text-center py-8 text-brand-gray">
          <p className="text-sm">Selecciona un archivo de origen Excel y una plantilla para comenzar.</p>
        </div>
      )}

      {scanResult && (
        <div className="space-y-3 text-sm">
          <div>
            <p className="font-semibold text-brand-dark">Proyecto seleccionado</p>
            <p className="text-brand-gray">{selectedProject}</p>
            {projectInfo && (
              <p className="text-xs text-brand-gray">
                {projectInfo.total} filas, {projectInfo.missingAmount} sin monto
              </p>
            )}
          </div>

          <div className="border-t border-brand-orange-light pt-3">
            <p className="font-semibold text-brand-dark">Período</p>
            <p className="text-brand-gray">
              {selectedMonth ? String(selectedMonth).padStart(2, '0') : '--'} / {selectedYear ?? '--'}
            </p>
          </div>

          <div className="border-t border-brand-orange-light pt-3">
            <p className="font-semibold text-brand-dark">Consecutivo inicial</p>
            <p className="text-brand-gray">{startConsecutive}</p>
          </div>

          <div className="border-t border-brand-orange-light pt-3">
            <p className="font-semibold text-brand-dark mb-2">Cuentas contables asignadas</p>
            <div className="space-y-1 text-xs">
              <p><span className="text-brand-gray">Efectivo:</span> {accountMap.EFECTIVO}</p>
              <p><span className="text-brand-gray">Bonificación:</span> {accountMap.BONIFICACION}</p>
              <p><span className="text-brand-gray">CTA ARQ:</span> {accountMap.CTA_ARQ}</p>
              <p><span className="text-brand-gray">CTA Kathe:</span> {accountMap.CTA_KATHE}</p>
              <p><span className="text-brand-gray">Bancolombia:</span> {accountMap.BANCOLOMBIA}</p>
              <p><span className="text-brand-gray">Davivienda:</span> {accountMap.DAVIVIENDA}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
          <CheckCircle2 size={18} className="text-green-600 mt-0.5 shrink-0" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}
    </Card>
  )
}
