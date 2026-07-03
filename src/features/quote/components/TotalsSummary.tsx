import type { TotalesCalculados } from '../types'
import { formatCurrency } from '../lib/formatCurrency'

interface TotalsSummaryProps {
  totals: TotalesCalculados
}

export function TotalsSummary({ totals }: TotalsSummaryProps) {
  return (
    <div className="text-sm space-y-1">
      <div className="flex justify-between">
        <span>Total, Bruto</span>
        <span className="font-semibold">{formatCurrency(totals.totalBruto)}</span>
      </div>
      <div className="flex justify-between">
        <span>Descuento</span>
        <span className="font-semibold">{formatCurrency(totals.descuento)}</span>
      </div>
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span className="font-semibold">{formatCurrency(totals.subtotal)}</span>
      </div>
      <div className="flex justify-between">
        <span>IVA</span>
        <span className="font-semibold">{formatCurrency(totals.totalIva)}</span>
      </div>
      <div className="flex justify-between text-base font-bold text-brand-orange-dark border-t border-brand-dark pt-2">
        <span>Total a Pagar</span>
        <span>{formatCurrency(totals.totalAPagar)}</span>
      </div>
    </div>
  )
}
