import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'
import type { Remision } from '../types'

const styles = StyleSheet.create({
  page: { padding: 56, fontFamily: 'Inter', fontSize: 10, color: '#1c1917', lineHeight: 1.4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, borderBottomWidth: 2, borderBottomColor: '#f97316', paddingBottom: 12 },
  headerLeft: { flexDirection: 'row', gap: 10, alignItems: 'center', maxWidth: '55%' },
  headerRight: { alignItems: 'flex-end', maxWidth: '45%' },
  logo: { width: 56, height: 56 },
  empresaNombre: { fontSize: 12, fontWeight: 700 },
  empresaDatos: { fontSize: 8, color: '#44403c', marginTop: 1 },
  titulo: { fontSize: 14, fontWeight: 700, color: '#f97316', marginBottom: 4 },
  seccion: { marginBottom: 16, padding: 10, backgroundColor: '#f5f5f4', borderRadius: 4 },
  seccionLabel: { fontSize: 8, color: '#44403c', textTransform: 'uppercase', marginBottom: 3 },
  seccionNombre: { fontSize: 11, fontWeight: 600 },
  seccionText: { fontSize: 9, color: '#44403c', marginTop: 1 },
  tablaTitulo: { fontSize: 10, fontWeight: 700, marginBottom: 6, color: '#f97316', textTransform: 'uppercase', marginTop: 10 },
  tablaHeader: { flexDirection: 'row', backgroundColor: '#fed7aa', padding: '4 0', fontSize: 8, fontWeight: 700 },
  tablaHeaderCell: { padding: '0 4' },
  tablaRow: { flexDirection: 'row', padding: '3 0', fontSize: 8, borderBottomWidth: 0.5, borderBottomColor: '#fed7aa' },
  tablaCell: { padding: '0 4' },
  observaciones: { fontSize: 9, color: '#44403c', marginTop: 10, paddingTop: 6, borderTopWidth: 0.5, borderTopColor: '#fed7aa' },
  firmaContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, paddingTop: 10, borderTopWidth: 0.5, borderTopColor: '#fed7aa' },
  firmaColumna: { width: '48%' },
  firmaTitulo: { fontSize: 9, fontWeight: 700, color: '#1c1917', marginBottom: 6, textTransform: 'uppercase' },
  firmaLinea: { borderBottomWidth: 1, borderBottomColor: '#1c1917', height: 16, marginBottom: 2 },
  firmaLabel: { fontSize: 8, color: '#44403c', marginBottom: 4 },
  footer: { position: 'absolute', bottom: 24, left: 56, right: 56, flexDirection: 'row', justifyContent: 'space-between', fontSize: 8, color: '#44403c', borderTopWidth: 0.5, borderTopColor: '#fed7aa', paddingTop: 8 },
})

interface RemisionPDFProps {
  remision: Remision
  logoSrc?: string
}

export function RemisionPDF({ remision, logoSrc }: RemisionPDFProps) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page} wrap>
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
              {remision.pedido && <Text style={styles.empresaDatos}>Pedido: {remision.pedido}</Text>}
              {remision.contrato && <Text style={styles.empresaDatos}>Contrato: {remision.contrato}</Text>}
            </View>
          </View>
        </View>

        <View style={styles.seccion}>
          <Text style={styles.seccionLabel}>CLIENTE</Text>
          <Text style={styles.seccionNombre}>{remision.cliente.nombre}</Text>
          <Text style={styles.seccionText}>CC/NIT: {remision.cliente.ccNit}</Text>
          {remision.cliente.direccion && <Text style={styles.seccionText}>Dirección: {remision.cliente.direccion}</Text>}
          {remision.cliente.ciudad && <Text style={styles.seccionText}>Ciudad: {remision.cliente.ciudad}</Text>}
          {remision.cliente.telefono && <Text style={styles.seccionText}>Teléfono: {remision.cliente.telefono}</Text>}
        </View>

        <View style={styles.seccion}>
          <Text style={styles.seccionLabel}>INFORMACIÓN LOGÍSTICA</Text>
          <Text style={styles.seccionText}>Lugar despacho: {remision.logistica.lugarDespacho}</Text>
          <Text style={styles.seccionText}>Lugar entrega: {remision.logistica.lugarEntrega}</Text>
          {remision.logistica.responsableTransporte && <Text style={styles.seccionText}>Responsable transporte: {remision.logistica.responsableTransporte}</Text>}
          {remision.logistica.vehiculo && <Text style={styles.seccionText}>Vehículo: {remision.logistica.vehiculo}</Text>}
          {remision.logistica.placa && <Text style={styles.seccionText}>Placa: {remision.logistica.placa}</Text>}
        </View>

        <View>
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

        {remision.observaciones && (
          <View style={styles.observaciones}>
            <Text style={{ fontSize: 10, fontWeight: 700, marginBottom: 4 }}>OBSERVACIONES</Text>
            <Text style={{ fontSize: 9 }}>{remision.observaciones}</Text>
          </View>
        )}

        <View style={styles.firmaContainer}>
          <View style={styles.firmaColumna}>
            <Text style={styles.firmaTitulo}>ENTREGA</Text>
            <View style={styles.firmaLinea} /><Text style={styles.firmaLabel}>Firma</Text>
            <Text style={styles.seccionText}>Nombre: {remision.entrega.nombre || '—'}</Text>
            <Text style={styles.seccionText}>Cargo: {remision.entrega.cargo || '—'}</Text>
            <Text style={styles.seccionText}>Documento: {remision.entrega.documento || '—'}</Text>
            <Text style={styles.seccionText}>Fecha: {remision.entrega.fecha || '—'}</Text>
            <Text style={styles.seccionText}>Hora: {remision.entrega.hora || '—'}</Text>
          </View>
          <View style={styles.firmaColumna}>
            <Text style={styles.firmaTitulo}>RECIBE</Text>
            <View style={styles.firmaLinea} /><Text style={styles.firmaLabel}>Firma</Text>
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
