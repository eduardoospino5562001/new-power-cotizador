import { useRef } from 'react'
import type { ComprobantesFormReturn } from '../hooks/useComprobantesForm'
import { Card, Button, Select, NumberInput } from '@/components/ui'
import { Upload } from 'lucide-react'
import { ACCOUNT_CODE_OPTIONS } from '../lib/excelUtils'

interface ComprobantesFormProps {
  form: ComprobantesFormReturn
}

const ACCOUNT_OPTIONS = Object.entries(ACCOUNT_CODE_OPTIONS).map(([key]) => ({
  value: key,
  label: key.charAt(0) + key.slice(1).toLowerCase(),
}))

export function ComprobantesForm({ form }: ComprobantesFormProps) {
  const sourceRef = useRef<HTMLInputElement>(null)

  const {
    scanResult,
    selectedProject,
    selectedYear,
    selectedMonth,
    startConsecutive,
    accountMap,
    setSelectedProject,
    setSelectedYear,
    setSelectedMonth,
    setStartConsecutive,
    setAccountMap,
    loadSource,
    generate,
    generating,
    error,
  } = form

  const handleSourceFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) loadSource(file)
  }

  const projects = scanResult ? Object.keys(scanResult.projects) : []
  const years = scanResult?.years ?? []
  const months = scanResult?.months ?? []

  const updateAccount = (key: keyof typeof accountMap, value: string) => {
    setAccountMap({ ...accountMap, [key]: ACCOUNT_CODE_OPTIONS[value as keyof typeof ACCOUNT_CODE_OPTIONS] ?? accountMap[key] })
  }

  const projectInfo = scanResult && selectedProject ? scanResult.projects[selectedProject] : null

  return (
    <section className="space-y-6">
      <Card>
        <h2 className="text-lg font-bold text-brand-dark mb-4">Archivo origen</h2>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-brand-dark mb-1">Excel con datos de ingresos</p>
            <input ref={sourceRef} type="file" accept=".xlsx" onChange={handleSourceFile} className="hidden" />
            <Button type="button" variant="secondary" size="sm" onClick={() => sourceRef.current?.click()}>
              <Upload size={16} className="mr-1" /> Buscar
            </Button>
            {form.sourceFile && <p className="text-xs text-brand-gray mt-1">{form.sourceFile.name}</p>}
          </div>
        </div>
      </Card>

      {scanResult && (
        <>
          <Card>
            <h2 className="text-lg font-bold text-brand-dark mb-4">Parámetros</h2>
            <div className="space-y-3">
              <Select
                label="Proyecto"
                options={projects.map((p) => ({ value: p, label: p }))}
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
              />
              {projectInfo && (
                <p className="text-xs text-brand-gray">
                  {projectInfo.total} filas, {projectInfo.missingAmount} sin monto
                </p>
              )}
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select
                    label="Año"
                    options={years.map((y) => ({ value: String(y), label: String(y) }))}
                    value={selectedYear !== null ? String(selectedYear) : ''}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                  />
                </div>
                <div className="flex-1">
                  <Select
                    label="Mes"
                    options={months.map((m) => ({ value: String(m), label: String(m).padStart(2, '0') }))}
                    value={selectedMonth !== null ? String(selectedMonth) : ''}
                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  />
                </div>
              </div>
              <NumberInput
                label="Consecutivo inicio"
                value={startConsecutive}
                onChange={(e) => setStartConsecutive(Number(e.target.value))}
                min={1}
              />
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-bold text-brand-dark mb-4">Cuentas contables</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Cuenta efectivo"
                options={ACCOUNT_OPTIONS}
                value={Object.entries(ACCOUNT_CODE_OPTIONS).find(([, v]) => v === accountMap.EFECTIVO)?.[0] ?? 'EFECTIVO'}
                onChange={(e) => updateAccount('EFECTIVO', e.target.value)}
              />
              <Select
                label="Cuenta bonif."
                options={ACCOUNT_OPTIONS}
                value={Object.entries(ACCOUNT_CODE_OPTIONS).find(([, v]) => v === accountMap.BONIFICACION)?.[0] ?? 'BANCOLOMBIA'}
                onChange={(e) => updateAccount('BONIFICACION', e.target.value)}
              />
              <Select
                label="Cuenta CTA ARQ"
                options={ACCOUNT_OPTIONS}
                value={Object.entries(ACCOUNT_CODE_OPTIONS).find(([, v]) => v === accountMap.CTA_ARQ)?.[0] ?? 'BANCOLOMBIA'}
                onChange={(e) => updateAccount('CTA_ARQ', e.target.value)}
              />
              <Select
                label="Cuenta CTA Kathe"
                options={ACCOUNT_OPTIONS}
                value={Object.entries(ACCOUNT_CODE_OPTIONS).find(([, v]) => v === accountMap.CTA_KATHE)?.[0] ?? 'BANCOLOMBIA'}
                onChange={(e) => updateAccount('CTA_KATHE', e.target.value)}
              />
              <Select
                label="Cuenta Bancolombia"
                options={ACCOUNT_OPTIONS}
                value={Object.entries(ACCOUNT_CODE_OPTIONS).find(([, v]) => v === accountMap.BANCOLOMBIA)?.[0] ?? 'BANCOLOMBIA'}
                onChange={(e) => updateAccount('BANCOLOMBIA', e.target.value)}
              />
              <Select
                label="Cuenta Davivienda"
                options={ACCOUNT_OPTIONS}
                value={Object.entries(ACCOUNT_CODE_OPTIONS).find(([, v]) => v === accountMap.DAVIVIENDA)?.[0] ?? 'DAVIVIENDA'}
                onChange={(e) => updateAccount('DAVIVIENDA', e.target.value)}
              />
            </div>
          </Card>
        </>
      )}

      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      )}

      <Button
        className="w-full"
        onClick={generate}
        disabled={!form.sourceFile || !selectedProject || generating}
      >
        {generating ? 'Generando...' : 'Generar Excel'}
      </Button>
    </section>
  )
}
