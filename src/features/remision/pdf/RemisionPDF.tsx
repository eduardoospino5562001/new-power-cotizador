import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'
import type { Remision } from '../types'

const styles = StyleSheet.create({
  page: { padding: 24, fontFamily: 'Inter', fontSize: 10, color: '#1c1917', lineHeight: 1.4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, borderBottomWidth: 2, borderBottomColor: '#f97316', paddingBottom: 16 },
  headerLeft: { flexDirection: 'row', gap: 12, alignItems: 'center', maxWidth: '55%' },
  headerRight: { alignItems: 'flex-end', maxWidth: '45%' },
  logo: { width: 64, height: 64, borderRadius: 8 },
  watermark: { position: 'absolute', top: 246, left: 156, width: 300, height: 300, opacity: 0.055 },
  empresaNombre: { fontSize: 14, fontWeight: 700 },
  empresaDatos: { fontSize: 10, color: '#44403c', marginTop: 2 },
  titulo: { fontSize: 16, fontWeight: 700, color: '#f97316', marginBottom: 4 },
  seccion: { marginBottom: 16, padding: 12, backgroundColor: '#f5f5f4', borderRadius: 8 },
  seccionLabel: { fontSize: 10, color: '#44403c', textTransform: 'uppercase', marginBottom: 4, fontWeight: 700 },
  seccionNombre: { fontSize: 14, fontWeight: 600 },
  seccionText: { fontSize: 10, color: '#44403c', marginTop: 2 },
  tablaTitulo: { fontSize: 12, fontWeight: 700, marginBottom: 8, color: '#f97316', textTransform: 'uppercase', marginTop: 16, borderBottomWidth: 1, borderBottomColor: '#fed7aa', paddingBottom: 4 },
  tablaHeader: { flexDirection: 'row', backgroundColor: '#fed7aa', padding: '6 4', fontSize: 9, fontWeight: 700 },
  tablaHeaderCell: { padding: '0 4' },
  tablaRow: { flexDirection: 'row', padding: '4 0', fontSize: 9, borderBottomWidth: 0.5, borderBottomColor: '#fed7aa' },
  tablaCell: { padding: '0 4' },
  observaciones: { fontSize: 10, color: '#44403c', marginTop: 16, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#fed7aa' },
  obsTitulo: { fontSize: 12, fontWeight: 700, color: '#1c1917', marginBottom: 4 },
  firmaContainer: { flexDirection: 'row', gap: 32, marginTop: 32, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#fed7aa' },
  firmaColumna: { flex: 1 },
  firmaTitulo: { fontSize: 10, fontWeight: 700, color: '#1c1917', marginBottom: 8, textTransform: 'uppercase' },
  firmaLinea: { borderBottomWidth: 1, borderBottomColor: '#1c1917', height: 20, marginBottom: 4 },
  firmaLabel: { fontSize: 10, color: '#44403c', marginBottom: 2 },
  footer: { position: 'absolute', bottom: 24, left: 24, right: 24, flexDirection: 'row', justifyContent: 'space-between', fontSize: 8, color: '#44403c', borderTopWidth: 0.5, borderTopColor: '#fed7aa', paddingTop: 8 },
})

interface RemisionPDFProps {
  remision: Remision
  logoSrc?: string
}

export function RemisionPDF({ remision, logoSrc }: RemisionPDFProps) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page} wrap>
        {logoSrc && <Image fixed style={styles.watermark} src={logoSrc} />}
        <View fixed>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {logoSrc && <Image style={styles.logo} src={logoSrc} />}
              <View>
                <Text style={styles.empresaNombre}>NEW POWER ENERGY S.A.S.</Text>
                <Text style={styles.empresaDatos}>NIT 901.826.285-6</Text>
                <Text style={styles.empresaDatos}>Villavicencio - Meta</Text>
                <Text style={styles.empresaDatos}>Teléfono: (57) 3204931541</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.titulo}>REMISIÓN</Text>
              <Text style={styles.empresaDatos}>No. {remision.numero}</Text>
              <Text style={styles.empresaDatos}>Fecha: {remision.fecha}</Text>
              {remision.pedido ? <Text style={styles.empresaDatos}>Pedido: {remision.pedido}</Text> : null}
              {remision.contrato ? <Text style={styles.empresaDatos}>Contrato: {remision.contrato}</Text> : null}
            </View>
          </View>
        </View>

        <View style={styles.seccion} wrap={false}>
          <Text style={styles.seccionLabel}>CLIENTE</Text>
          <Text style={styles.seccionNombre}>{remision.cliente.nombre}</Text>
          <Text style={styles.seccionText}>CC/NIT: {remision.cliente.ccNit}</Text>
          {remision.cliente.direccion ? <Text style={styles.seccionText}>Dirección: {remision.cliente.direccion}</Text> : null}
          {remision.cliente.ciudad ? <Text style={styles.seccionText}>Ciudad: {remision.cliente.ciudad}</Text> : null}
          {remision.cliente.telefono ? <Text style={styles.seccionText}>Teléfono: {remision.cliente.telefono}</Text> : null}
        </View>

        <View style={styles.seccion} wrap={false}>
          <Text style={styles.seccionLabel}>INFORMACIÓN LOGÍSTICA</Text>
          {remision.logistica.map((l) => (
            <Text key={l.id} style={styles.seccionText}>{l.nombre}: {l.valor || '—'}</Text>
          ))}
        </View>

        <View wrap={false}>
          <Text style={styles.tablaTitulo}>DETALLE DE ENTREGA</Text>
          <View style={styles.tablaHeader}>
            <Text style={[styles.tablaHeaderCell, { width: '8%' }]}>Cant.</Text>
            <Text style={[styles.tablaHeaderCell, { width: '12%' }]}>Código</Text>
            <Text style={[styles.tablaHeaderCell, { width: '30%' }]}>Descripción</Text>
            <Text style={[styles.tablaHeaderCell, { width: '20%' }]}>Serial</Text>
            <Text style={[styles.tablaHeaderCell, { width: '30%' }]}>Observaciones</Text>
          </View>
          {remision.detalles.map((det) => (
            <View style={styles.tablaRow} key={det.id}>
              <Text style={[styles.tablaCell, { width: '8%' }]}>{det.cantidad}</Text>
              <Text style={[styles.tablaCell, { width: '12%' }]}>{det.codigo}</Text>
              <Text style={[styles.tablaCell, { width: '30%' }]}>{det.descripcion}</Text>
              <Text style={[styles.tablaCell, { width: '20%' }]}>{det.serial || '—'}</Text>
              <Text style={[styles.tablaCell, { width: '30%' }]}>{det.observaciones || '—'}</Text>
            </View>
          ))}
        </View>

        {remision.observaciones ? (
          <View style={styles.observaciones} wrap={false}>
            <Text style={styles.obsTitulo}>OBSERVACIONES</Text>
            <Text style={{ fontSize: 10 }}>{remision.observaciones}</Text>
          </View>
        ) : null}

        <View style={styles.firmaContainer} wrap={false}>
          <View style={styles.firmaColumna}>
            <Text style={styles.firmaTitulo}>ENTREGA</Text>
            <View style={styles.firmaLinea} />
            <Text style={styles.firmaLabel}>Firma</Text>
            <Text style={styles.seccionText}>Nombre: {remision.entrega.nombre || '—'}</Text>
            <Text style={styles.seccionText}>Cargo: {remision.entrega.cargo || '—'}</Text>
            <Text style={styles.seccionText}>Documento: {remision.entrega.documento || '—'}</Text>
            <Text style={styles.seccionText}>Fecha: {remision.entrega.fecha || '—'}</Text>
            <Text style={styles.seccionText}>Hora: {remision.entrega.hora || '—'}</Text>
          </View>
          <View style={styles.firmaColumna}>
            <Text style={styles.firmaTitulo}>RECIBE</Text>
            <View style={styles.firmaLinea} />
            <Text style={styles.firmaLabel}>Firma</Text>
            <Text style={styles.seccionText}>Nombre: {remision.recibe.nombre || '—'}</Text>
            <Text style={styles.seccionText}>Cargo: {remision.recibe.cargo || '—'}</Text>
            <Text style={styles.seccionText}>Documento: {remision.recibe.documento || '—'}</Text>
            <Text style={styles.seccionText}>Fecha: {remision.recibe.fecha || '—'}</Text>
            <Text style={styles.seccionText}>Hora: {remision.recibe.hora || '—'}</Text>
          </View>
        </View>

        <Text style={styles.footer} render={({ pageNumber, totalPages }) => `Documento asociado a la Cotización y al Contrato de Compraventa.  Página ${pageNumber} de ${totalPages}`} fixed />
      </Page>
    </Document>
  )
}
