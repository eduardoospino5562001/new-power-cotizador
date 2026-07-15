export function calcularSaldo(valorTotal: number, pagoInicial: number): number {
  return Math.max(0, valorTotal - pagoInicial)
}
