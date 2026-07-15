import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'
import type { ContratoCompraventa } from '../types'

const styles = StyleSheet.create({
  page: { padding: 24, fontFamily: 'Inter', fontSize: 10, color: '#1c1917', lineHeight: 1.4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, borderBottomWidth: 2, borderBottomColor: '#f97316', paddingBottom: 16 },
  headerLeft: { flexDirection: 'row', gap: 12, alignItems: 'center', maxWidth: '50%' },
  headerRight: { alignItems: 'flex-end', maxWidth: '50%' },
  logo: { width: 64, height: 64, borderRadius: 8 },
  empresaNombre: { fontSize: 14, fontWeight: 700, color: '#1c1917' },
  empresaDatos: { fontSize: 10, color: '#44403c', marginTop: 2 },
  titulo: { fontSize: 13, fontWeight: 700, color: '#f97316' },
  partesRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  parteCol: { flex: 1, backgroundColor: '#f5f5f4', borderRadius: 8, padding: 12 },
  seccionLabel: { fontSize: 10, color: '#44403c', textTransform: 'uppercase', marginBottom: 4, fontWeight: 700 },
  seccionNombre: { fontSize: 14, fontWeight: 600, color: '#1c1917' },
  seccionText: { fontSize: 10, color: '#44403c', marginTop: 2 },
  tablaTitulo: { fontSize: 12, fontWeight: 700, marginBottom: 8, color: '#f97316', textTransform: 'uppercase', marginTop: 16, borderBottomWidth: 1, borderBottomColor: '#fed7aa', paddingBottom: 4 },
  specsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  specsCol: { width: '50%', paddingRight: 16 },
  specsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3, borderBottomWidth: 0.5, borderBottomColor: '#fed7aa' },
  specsLabel: { fontSize: 10, color: '#44403c' },
  specsValue: { fontSize: 10, fontWeight: 600, color: '#1c1917' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, fontSize: 10 },
  totalRowBold: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, fontSize: 12, fontWeight: 700, color: '#ea580c', borderTopWidth: 1.5, borderTopColor: '#1c1917', marginTop: 4 },
  clausulaItem: { marginBottom: 12 },
  clausulaTitulo: { fontSize: 10, fontWeight: 700, color: '#1c1917', marginBottom: 2 },
  clausulaTexto: { fontSize: 10, color: '#44403c', lineHeight: 1.5 },
  observaciones: { fontSize: 10, color: '#44403c', marginTop: 16, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#fed7aa' },
  obsTitulo: { fontSize: 12, fontWeight: 700, color: '#1c1917', marginBottom: 4 },
  firmaContainer: { flexDirection: 'row', gap: 32, marginTop: 32, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#fed7aa' },
  firmaColumna: { flex: 1 },
  firmaTitulo: { fontSize: 10, fontWeight: 700, color: '#1c1917', marginBottom: 8, textTransform: 'uppercase' },
  firmaLinea: { borderBottomWidth: 1, borderBottomColor: '#1c1917', height: 32, marginBottom: 4 },
  firmaLabel: { fontSize: 10, color: '#44403c', marginBottom: 4 },
  footer: { position: 'absolute', bottom: 24, left: 24, right: 24, flexDirection: 'row', justifyContent: 'space-between', fontSize: 8, color: '#44403c', borderTopWidth: 0.5, borderTopColor: '#fed7aa', paddingTop: 8 },
})

const fmt = (n: number) => '$ ' + Math.round(n).toLocaleString('es-CO')

interface ContractPDFProps {
  contrato: ContratoCompraventa
  logoSrc?: string
}

export function ContractPDF({ contrato, logoSrc }: ContractPDFProps) {
  const saldo = contrato.economico.saldo

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

        <View style={styles.partesRow}>
          <View style={styles.parteCol}>
            <Text style={styles.seccionLabel}>VENDEDOR</Text>
            <Text style={styles.seccionNombre}>{contrato.vendedor.razonSocial}</Text>
            <Text style={styles.seccionText}>NIT {contrato.vendedor.nit}</Text>
            <Text style={styles.seccionText}>{contrato.vendedor.direccion}</Text>
            <Text style={styles.seccionText}>{contrato.vendedor.ciudad}</Text>
            <Text style={styles.seccionText}>Tel: {contrato.vendedor.telefono}</Text>
            {contrato.vendedor.correo ? <Text style={styles.seccionText}>{contrato.vendedor.correo}</Text> : null}
          </View>
          <View style={styles.parteCol}>
            <Text style={styles.seccionLabel}>COMPRADOR</Text>
            <Text style={styles.seccionNombre}>{contrato.comprador.nombre}</Text>
            <Text style={styles.seccionText}>CC/NIT {contrato.comprador.ccNit}</Text>
            {contrato.comprador.direccion ? <Text style={styles.seccionText}>{contrato.comprador.direccion}</Text> : null}
            {contrato.comprador.ciudad ? <Text style={styles.seccionText}>{contrato.comprador.ciudad}</Text> : null}
            {contrato.comprador.telefono ? <Text style={styles.seccionText}>Tel: {contrato.comprador.telefono}</Text> : null}
            {contrato.comprador.correo ? <Text style={styles.seccionText}>{contrato.comprador.correo}</Text> : null}
          </View>
        </View>

        {contrato.grupos.map((g) => (
          <View key={g.id} wrap={false}>
            <Text style={styles.tablaTitulo}>{g.nombre || 'ESPECIFICACIONES DEL EQUIPO'}</Text>
            <View style={styles.specsGrid}>
              {g.items.map((esp) => (
                <View style={styles.specsCol} key={esp.id}>
                  <View style={styles.specsRow}>
                    <Text style={styles.specsLabel}>{esp.nombre}</Text>
                    <Text style={styles.specsValue}>{esp.valor || '—'}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}

        <View wrap={false}>
          <Text style={styles.tablaTitulo}>RESUMEN ECONÓMICO</Text>
          <View style={styles.totalRow}><Text style={{ color: '#44403c' }}>Valor total</Text><Text style={{ fontWeight: 600 }}>{fmt(contrato.economico.valorTotal)}</Text></View>
          <View style={styles.totalRow}><Text style={{ color: '#44403c' }}>Pago inicial</Text><Text style={{ fontWeight: 600 }}>{fmt(contrato.economico.pagoInicial)}</Text></View>
          <View style={styles.totalRowBold}><Text>Saldo</Text><Text>{fmt(saldo)}</Text></View>
          {contrato.economico.fechaLimite ? <View style={styles.totalRow}><Text style={{ color: '#44403c' }}>Fecha límite</Text><Text style={{ fontWeight: 600 }}>{contrato.economico.fechaLimite}</Text></View> : null}
        </View>

        <View>
          <Text style={styles.tablaTitulo}>CLÁUSULAS</Text>
          {contrato.clausulas.map((c) => (
            <View style={styles.clausulaItem} key={c.id} wrap={false}>
              <Text style={styles.clausulaTitulo}>{c.titulo}</Text>
              <Text style={styles.clausulaTexto}>{c.texto}</Text>
            </View>
          ))}
        </View>

        {contrato.observaciones ? (
          <View style={styles.observaciones}>
            <Text style={styles.obsTitulo}>OBSERVACIONES</Text>
            <Text style={{ fontSize: 10 }}>{contrato.observaciones}</Text>
          </View>
        ) : null}

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

        <Text style={styles.footer} render={({ pageNumber, totalPages }) => `NEW POWER ENERGY S.A.S. - NIT ${contrato.vendedor.nit}                 Página ${pageNumber} de ${totalPages}`} fixed />
      </Page>
    </Document>
  )
}
