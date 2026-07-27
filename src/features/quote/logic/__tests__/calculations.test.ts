import { describe, it, expect } from 'vitest'
import { calcularLineaItem, calcularTotales } from '../calculations'
import type { Cotizacion, ItemCotizacion } from '../../types'

function item(overrides: Partial<ItemCotizacion> = {}): ItemCotizacion {
  return {
    id: '1',
    descripcion: 'Item de prueba',
    cantidad: 1,
    valorUnitario: 1000,
    impuestoPorcentaje: 19,
    ...overrides,
  }
}

function cotizacion(overrides: Partial<Cotizacion> = {}): Cotizacion {
  return {
    numero: 'C-1-999',
    fecha: '2026-07-04',
    validezDias: 15,
    cliente: { nombre: 'Cliente Test', nit: '12345678-9' },
    items: [item()],
    descuentoPorcentaje: 0,
    notas: { revisionInforme: '', retenciones: '', accesorios: '' },
    ...overrides,
  }
}

describe('calcularLineaItem', () => {
  it('calcula bruto e IVA correctamente con impuesto 19%', () => {
    const result = calcularLineaItem(item({ cantidad: 5, valorUnitario: 20000, impuestoPorcentaje: 19 }))
    expect(result.bruto).toBe(100000)
    expect(result.ivaItem).toBe(19000)
  })

  it('retorna IVA 0 cuando el impuesto es 0%', () => {
    const result = calcularLineaItem(item({ cantidad: 3, valorUnitario: 50000, impuestoPorcentaje: 0 }))
    expect(result.bruto).toBe(150000)
    expect(result.ivaItem).toBe(0)
  })

  it('maneja cantidad decimal', () => {
    const result = calcularLineaItem(item({ cantidad: 2.5, valorUnitario: 1000, impuestoPorcentaje: 19 }))
    expect(result.bruto).toBe(2500)
    expect(result.ivaItem).toBe(475)
  })
})

describe('calcularTotales', () => {
  it('caso real del PDF: 3 items, sin descuento', () => {
    const c = cotizacion({
      items: [
        item({ id: '1', descripcion: 'MEDICION DE COMPRESION Y DIAGNOSTICO', cantidad: 1, valorUnitario: 450000, impuestoPorcentaje: 19 }),
        item({ id: '2', descripcion: 'EMPAQUE DE TAPA VÁLVULA', cantidad: 1, valorUnitario: 130000, impuestoPorcentaje: 19 }),
        item({ id: '3', descripcion: 'VIÁTICOS Y TRANSPORTE', cantidad: 1, valorUnitario: 350000, impuestoPorcentaje: 19 }),
      ],
      descuentoPorcentaje: 0,
    })
    const t = calcularTotales(c)
    expect(t.totalBruto).toBe(930000)
    expect(t.descuento).toBe(0)
    expect(t.subtotal).toBe(930000)
    expect(t.totalIva).toBe(176700)
    expect(t.totalAPagar).toBe(1106700)
  })

  it('aplica descuento correctamente', () => {
    const c = cotizacion({
      items: [
        item({ id: '1', cantidad: 2, valorUnitario: 100000, impuestoPorcentaje: 19 }),
      ],
      descuentoPorcentaje: 10,
    })
    const t = calcularTotales(c)
    expect(t.totalBruto).toBe(200000)
    expect(t.descuento).toBe(20000)
    expect(t.subtotal).toBe(180000)
    expect(t.totalIva).toBe(34200)
    expect(t.totalAPagar).toBe(214200)
  })

  it('retorna todo 0 cuando la lista de items está vacía', () => {
    const c = cotizacion({ items: [] })
    const t = calcularTotales(c)
    expect(t.totalBruto).toBe(0)
    expect(t.descuento).toBe(0)
    expect(t.subtotal).toBe(0)
    expect(t.totalIva).toBe(0)
    expect(t.totalAPagar).toBe(0)
  })

  it('mezcla items con distintos porcentajes de impuesto', () => {
    const c = cotizacion({
      items: [
        item({ id: '1', cantidad: 1, valorUnitario: 100000, impuestoPorcentaje: 19 }),
        item({ id: '2', cantidad: 2, valorUnitario: 50000, impuestoPorcentaje: 0 }),
        item({ id: '3', cantidad: 1, valorUnitario: 20000, impuestoPorcentaje: 5 }),
      ],
    })
    const t = calcularTotales(c)
    expect(t.totalBruto).toBe(220000)
    expect(t.subtotal).toBe(220000)
    expect(t.totalIva).toBe(20000)
    expect(t.totalAPagar).toBe(240000)
  })

  it('descuento proporcional ajusta el IVA', () => {
    const c = cotizacion({
      items: [
        item({ id: '1', cantidad: 1, valorUnitario: 100000, impuestoPorcentaje: 19 }),
      ],
      descuentoPorcentaje: 50,
    })
    const t = calcularTotales(c)
    expect(t.totalBruto).toBe(100000)
    expect(t.descuento).toBe(50000)
    expect(t.subtotal).toBe(50000)
    expect(t.totalIva).toBe(9500)
    expect(t.totalAPagar).toBe(59500)
  })
})
