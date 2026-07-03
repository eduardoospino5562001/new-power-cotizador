import type { Cotizacion, ItemCotizacion, LineaCalculada, TotalesCalculados } from '../types'

export function calcularLineaItem(item: ItemCotizacion): LineaCalculada {
  const bruto = item.cantidad * item.valorUnitario
  const ivaItem = bruto * (item.impuestoPorcentaje / 100)
  return { bruto, ivaItem }
}

export function calcularTotales(cotizacion: Cotizacion): TotalesCalculados {
  const lineas = cotizacion.items.map(calcularLineaItem)

  const totalBruto = lineas.reduce((sum, l) => sum + l.bruto, 0)
  const descuento = totalBruto * (cotizacion.descuentoPorcentaje / 100)
  const subtotal = totalBruto - descuento

  let totalIva: number

  if (totalBruto > 0 && cotizacion.descuentoPorcentaje > 0) {
    const ivaSum = lineas.reduce((sum, l) => sum + l.ivaItem, 0)
    totalIva = ivaSum * (subtotal / totalBruto)
  } else {
    totalIva = lineas.reduce((sum, l) => sum + l.ivaItem, 0)
  }

  const totalAPagar = subtotal + totalIva

  return { totalBruto, descuento, subtotal, totalIva, totalAPagar }
}
