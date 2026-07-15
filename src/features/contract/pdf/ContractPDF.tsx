import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'
import type { ContratoCompraventa } from '../types'
import { calcularSaldo } from '../logic/calculations'

const styles = StyleSheet.create({
  page: { padding: 56, fontFamily: 'Inter', fontSize: 10, color: '#1c1917', lineHeight: 1.4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, borderBottomWidth: 2, borderBottomColor: '#f97316', paddingBottom: 16 },
  headerLeft: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  headerRight: { alignItems: 'flex-end' },
  logo: { width: 68, height: 68 },
  empresaNombre: { fontSize: 14, fontWeight: 700 },
  empresaDatos: { fontSize: 9, color: '#44403c', marginTop: 2 },
  titulo: { fontSize: 18, fontWeight: 700, color: '#f97316', marginBottom: 6 },
  seccion: { marginBottom: 20, padding: 12, backgroundColor: '#f5f5f4', borderRadius: 4 },
  seccionLabel: { fontSize: 8, color: '#44403c', textTransform: 'uppercase', marginBottom: 4 },
  seccionNombre: { fontSize: 12, fontWeight: 600 },
  seccionText: { fontSize: 10, color: '#44403c', marginTop: 2 },
  tablaTitulo: { fontSize: 11, fontWeight: 700, marginBottom: 8, color: '#f97316', textTransform: 'uppercase', marginTop: 12 },
  tablaRow: { flexDirection: 'row', padding: '3 0', fontSize: 9, borderBottomWidth: 0.5, borderBottomColor: '#fed7aa' },
  tablaLabel: { width: '40%', color: '#44403c' },
  tablaValue: { width: '60%', fontWeight: 600 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', padding: '3 0', fontSize: 10 },
  totalRowBold: { flexDirection: 'row', justifyContent: 'space-between', padding: '6 0', fontSize: 12, fontWeight: 700, color: '#ea580c', borderTopWidth: 1.5, borderTopColor: '#1c1917', marginTop: 4 },
  clausulaTitulo: { fontSize: 9, fontWeight: 700, marginTop: 8, color: '#1c1917' },
  clausulaTexto: { fontSize: 8, color: '#44403c', marginTop: 2, lineHeight: 1.5 },
  observaciones: { fontSize: 9, color: '#44403c', marginTop: 12, paddingTop: 8, borderTopWidth: 0.5, borderTopColor: '#fed7aa' },
  firmaContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 32, paddingTop: 12, borderTopWidth: 0.5, borderTopColor: '#fed7aa' },
  firmaColumna: { width: '45%' },
  firmaTitulo: { fontSize: 9, fontWeight: 700, color: '#1c1917', marginBottom: 8, textTransform: 'uppercase' },
  firmaLinea: { borderBottomWidth: 1, borderBottomColor: '#1c1917', height: 24, marginBottom: 2 },
  firmaLabel: { fontSize: 8, color: '#44403c', marginBottom: 8 },
  footer: { position: 'absolute', bottom: 24, left: 56, right: 56, flexDirection: 'row', justifyContent: 'space-between', fontSize: 8, color: '#44403c', borderTopWidth: 0.5, borderTopColor: '#fed7aa', paddingTop: 8 },
})

const fmt = (n: number) => '$ ' + Math.round(n).toLocaleString('es-CO')

const CLAUSULAS = [
  { titulo: 'PRIMERA. OBJETO', texto: 'EL VENDEDOR vende a EL COMPRADOR una planta eléctrica de segunda, con las características descritas en las especificaciones del equipo. Lo anterior conforme a la cotización No. correspondiente.' },
  { titulo: 'SEGUNDA. VALOR', texto: 'El valor total de la compraventa es el indicado en el resumen económico del presente contrato.' },
  { titulo: 'TERCERA. FORMA DE PAGO', texto: 'EL COMPRADOR pagará el valor del contrato según lo establecido en el resumen económico: un pago inicial y el saldo en la fecha acordada.' },
  { titulo: 'CUARTA. ENTREGA', texto: 'EL VENDEDOR hará entrega de la planta eléctrica en la ciudad de Medellín, una vez se cumplan las condiciones de pago pactadas entre las partes.' },
  { titulo: 'QUINTA. GARANTÍA', texto: 'La planta eléctrica cuenta con una garantía de quinientas (500) horas de funcionamiento o tres (3) meses, lo que ocurra primero.' },
  { titulo: 'SEXTA. INSTALACIÓN Y TRANSPORTE', texto: 'En caso de requerirse instalación, los gastos de transporte, viáticos y demás costos asociados serán asumidos por EL COMPRADOR.' },
  { titulo: 'SÉPTIMA. ESTADO DEL BIEN', texto: 'EL COMPRADOR declara conocer que el equipo objeto de este contrato corresponde a una planta eléctrica usada (de segunda), aceptando su estado de funcionamiento al momento de la entrega.' },
  { titulo: 'OCTAVA. PERFECCIONAMIENTO', texto: 'El presente contrato se entiende perfeccionado con la firma de las partes.' },
  { titulo: 'NOVENA. OBLIGACIONES DEL VENDEDOR', texto: 'EL VENDEDOR se obliga a entregar el equipo en el estado acordado, con todos sus accesorios y documentación asociada.' },
  { titulo: 'DÉCIMA. OBLIGACIONES DEL COMPRADOR', texto: 'EL COMPRADOR se obliga a pagar el valor acordado en la forma y plazos estipulados.' },
  { titulo: 'UNDÉCIMA. INCUMPLIMIENTO', texto: 'En caso de incumplimiento por cualquiera de las partes, la parte afectada podrá exigir el cumplimiento o la resolución del contrato.' },
  { titulo: 'DUODÉCIMA. CLÁUSULA PENAL', texto: 'En caso de mora en el pago, EL COMPRADOR pagará un interés moratorio equivalente al máximo legal permitido.' },
]

interface ContractPDFProps {
  contrato: ContratoCompraventa
  logoSrc?: string
}

export function ContractPDF({ contrato, logoSrc }: ContractPDFProps) {
  const saldo = calcularSaldo(contrato.economico.valorTotal, contrato.economico.pagoInicial)

  return (
    <Document>
      <Page size="LETTER" style={styles.page} wrap>
        <View fixed>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {logoSrc && <Image style={styles.logo} src={logoSrc} />}
              <View>
                <Text style={styles.empresaNombre}>{contrato.vendedor.razonSocial}</Text>
                <Text style={styles.empresaDatos}>NIT {contrato.vendedor.nit}</Text>
                <Text style={styles.empresaDatos}>{contrato.vendedor.direccion}</Text>
                <Text style={styles.empresaDatos}>Tel: {contrato.vendedor.telefono}</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.titulo}>CONTRATO DE COMPRAVENTA</Text>
              <Text style={styles.empresaDatos}>No. {contrato.numero}</Text>
              <Text style={styles.empresaDatos}>{contrato.fecha}</Text>
            </View>
          </View>
        </View>

        <View style={styles.seccion}>
          <Text style={styles.seccionLabel}>VENDEDOR</Text>
          <Text style={styles.seccionNombre}>{contrato.vendedor.razonSocial}</Text>
          <Text style={styles.seccionText}>NIT {contrato.vendedor.nit}</Text>
          <Text style={styles.seccionText}>{contrato.vendedor.direccion}</Text>
          <Text style={styles.seccionText}>{contrato.vendedor.ciudad}</Text>
          <Text style={styles.seccionText}>Tel: {contrato.vendedor.telefono}</Text>
          {contrato.vendedor.correo && <Text style={styles.seccionText}>{contrato.vendedor.correo}</Text>}
        </View>

        <View style={styles.seccion}>
          <Text style={styles.seccionLabel}>COMPRADOR</Text>
          <Text style={styles.seccionNombre}>{contrato.comprador.nombre}</Text>
          <Text style={styles.seccionText}>CC/NIT {contrato.comprador.ccNit}</Text>
          {contrato.comprador.direccion && <Text style={styles.seccionText}>{contrato.comprador.direccion}</Text>}
          {contrato.comprador.ciudad && <Text style={styles.seccionText}>{contrato.comprador.ciudad}</Text>}
          {contrato.comprador.telefono && <Text style={styles.seccionText}>Tel: {contrato.comprador.telefono}</Text>}
          {contrato.comprador.correo && <Text style={styles.seccionText}>{contrato.comprador.correo}</Text>}
        </View>

        <View>
          <Text style={styles.tablaTitulo}>ESPECIFICACIONES DEL EQUIPO</Text>
          <View style={styles.tablaRow}><Text style={styles.tablaLabel}>Marca</Text><Text style={styles.tablaValue}>{contrato.equipo.marca}</Text></View>
          <View style={styles.tablaRow}><Text style={styles.tablaLabel}>Potencia</Text><Text style={styles.tablaValue}>{contrato.equipo.potencia}</Text></View>
          {contrato.equipo.modelo && <View style={styles.tablaRow}><Text style={styles.tablaLabel}>Modelo</Text><Text style={styles.tablaValue}>{contrato.equipo.modelo}</Text></View>}
          {contrato.equipo.serialMotor && <View style={styles.tablaRow}><Text style={styles.tablaLabel}>Serial Motor</Text><Text style={styles.tablaValue}>{contrato.equipo.serialMotor}</Text></View>}
          {contrato.equipo.serialGenerador && <View style={styles.tablaRow}><Text style={styles.tablaLabel}>Serial Generador</Text><Text style={styles.tablaValue}>{contrato.equipo.serialGenerador}</Text></View>}
          {contrato.equipo.horas > 0 && <View style={styles.tablaRow}><Text style={styles.tablaLabel}>Horas</Text><Text style={styles.tablaValue}>{String(contrato.equipo.horas)}</Text></View>}
          {contrato.equipo.voltaje && <View style={styles.tablaRow}><Text style={styles.tablaLabel}>Voltaje</Text><Text style={styles.tablaValue}>{contrato.equipo.voltaje}</Text></View>}
          {contrato.equipo.frecuencia && <View style={styles.tablaRow}><Text style={styles.tablaLabel}>Frecuencia</Text><Text style={styles.tablaValue}>{contrato.equipo.frecuencia}</Text></View>}
          <View style={styles.tablaRow}><Text style={styles.tablaLabel}>Radiador</Text><Text style={styles.tablaValue}>{contrato.equipo.radiador ? 'Sí' : 'No'}</Text></View>
          <View style={styles.tablaRow}><Text style={styles.tablaLabel}>Breaker</Text><Text style={styles.tablaValue}>{contrato.equipo.breaker ? 'Sí' : 'No'}</Text></View>
          <View style={styles.tablaRow}><Text style={styles.tablaLabel}>Módulo</Text><Text style={styles.tablaValue}>{contrato.equipo.modulo ? 'Sí' : 'No'}</Text></View>
          <View style={styles.tablaRow}><Text style={styles.tablaLabel}>Baterías</Text><Text style={styles.tablaValue}>{String(contrato.equipo.baterias)}</Text></View>
        </View>

        <View>
          <Text style={styles.tablaTitulo}>RESUMEN ECONÓMICO</Text>
          <View style={styles.totalRow}><Text>Valor total</Text><Text>{fmt(contrato.economico.valorTotal)}</Text></View>
          <View style={styles.totalRow}><Text>Pago inicial</Text><Text>{fmt(contrato.economico.pagoInicial)}</Text></View>
          <View style={styles.totalRowBold}><Text>Saldo</Text><Text>{fmt(saldo)}</Text></View>
          {contrato.economico.fechaLimite && <View style={styles.totalRow}><Text>Fecha límite</Text><Text>{contrato.economico.fechaLimite}</Text></View>}
        </View>

        <View>
          <Text style={styles.tablaTitulo}>CLÁUSULAS</Text>
          {CLAUSULAS.map((c, i) => (
            <View key={i}>
              <Text style={styles.clausulaTitulo}>{c.titulo}</Text>
              <Text style={styles.clausulaTexto}>{c.texto}</Text>
            </View>
          ))}
        </View>

        {contrato.observaciones && (
          <View style={styles.observaciones}>
            <Text style={{ fontSize: 10, fontWeight: 700, marginBottom: 4 }}>OBSERVACIONES</Text>
            <Text style={{ fontSize: 9 }}>{contrato.observaciones}</Text>
          </View>
        )}

        <View style={styles.firmaContainer}>
          <View style={styles.firmaColumna}>
            <Text style={styles.firmaTitulo}>EL VENDEDOR</Text>
            <View style={styles.firmaLinea} />
            <Text style={styles.firmaLabel}>Firma</Text>
            <View style={styles.firmaLinea} />
            <Text style={styles.firmaLabel}>Nombre</Text>
            <View style={styles.firmaLinea} />
            <Text style={styles.firmaLabel}>Cargo</Text>
          </View>
          <View style={styles.firmaColumna}>
            <Text style={styles.firmaTitulo}>EL COMPRADOR</Text>
            <View style={styles.firmaLinea} />
            <Text style={styles.firmaLabel}>Firma</Text>
            <View style={styles.firmaLinea} />
            <Text style={styles.firmaLabel}>Nombre</Text>
            <View style={styles.firmaLinea} />
            <Text style={styles.firmaLabel}>C.C.</Text>
          </View>
        </View>

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          fixed
        />
      </Page>
    </Document>
  )
}
