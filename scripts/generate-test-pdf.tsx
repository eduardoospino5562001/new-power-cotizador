import React from 'react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { renderToFile, Font } from '@react-pdf/renderer'
import { QuotePDF } from '../src/features/quote/pdf/QuotePDF'
import type { Cotizacion } from '../src/features/quote/types'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

Font.register({
  family: 'Inter',
  fonts: [
    { src: path.join(rootDir, 'src/assets/fonts/Inter-Regular.ttf'), fontWeight: 400 },
    { src: path.join(rootDir, 'src/assets/fonts/Inter-SemiBold.ttf'), fontWeight: 600 },
    { src: path.join(rootDir, 'src/assets/fonts/Inter-Bold.ttf'), fontWeight: 700 },
  ],
})

const logoPath = path.resolve(rootDir, 'src/assets/logo.jpeg')
const logoBase64 = fs.readFileSync(logoPath).toString('base64')
const logoSrc = `data:image/jpeg;base64,${logoBase64}`

const ejemplo: Cotizacion = {
  numero: 'C-1-118',
  fecha: '2026-07-02',
  validezDias: 15,
  cliente: {
    nombre: 'AVICOLA LOS CAMBULOS SA',
    nit: '86005883-4',
  },
  items: [
    {
      id: '1',
      descripcion: 'MEDICION DE COMPRESION Y DIAGNOSTICO DE PLANTA ELECTRICA C/U',
      cantidad: 1,
      valorUnitario: 450000,
      impuestoPorcentaje: 19,
    },
    {
      id: '2',
      descripcion: 'EMPAQUE DE TAPA VÁLVULA (EN CASO DE SER NECESARIO. SI NO SE REQUIERE, NO SE COBRARÁ.)',
      cantidad: 1,
      valorUnitario: 130000,
      impuestoPorcentaje: 19,
    },
    {
      id: '3',
      descripcion: 'VIÁTICOS Y TRANSPORTE (SI SE LOGRA REALIZAR EL SERVICIO EN DOS O TRES PLANTAS, SE COBRARÁ UN SOLO VIÁTICO Y TRANSPORTE.)',
      cantidad: 1,
      valorUnitario: 350000,
      impuestoPorcentaje: 19,
    },
  ],
  descuentoPorcentaje: 0,
  notas: {
    revisionInforme: 'EN LA REVISION E INSPECCIÓN DEL EQUIPO, SE ENTREGARÁ UN INFORME TÉCNICO CON LAS RECOMENDACIONES Y LOS TRABAJOS A REALIZAR PARA ASEGURAR EL CORRECTO FUNCIONAMIENTO DEL EQUIPO.',
    retenciones: 'ADJUNTAR RETENCIONES A DESCONTAR EN ORDEN DE COMPRA.',
    accesorios: 'EN CASO DE SER NECESARIO ALGÚN ACCESORIO, ESTE SE COTIZARÁ POR SEPARADO.',
  },
}

async function main() {
  const outputPath = path.resolve(rootDir, 'test-output.pdf')
  await renderToFile(<QuotePDF cotizacion={ejemplo} logoSrc={logoSrc} />, outputPath)
  const stats = fs.statSync(outputPath)
  console.log('PDF generado en:', outputPath)
  console.log('Tamaño:', (stats.size / 1024).toFixed(1), 'KB')
}

main().catch(console.error)
