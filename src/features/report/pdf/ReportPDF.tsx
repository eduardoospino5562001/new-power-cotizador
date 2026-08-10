import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'
import type { InformeTecnico } from '../types'

const styles = StyleSheet.create({
  page: { padding: 56, fontFamily: 'Inter', fontSize: 10, color: '#1c1917', lineHeight: 1.4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, borderBottomWidth: 2, borderBottomColor: '#f97316', paddingBottom: 16 },
  headerLeft: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  headerRight: { alignItems: 'flex-end' },
  logo: { width: 68, height: 68 },
  watermark: { position: 'absolute', top: 246, left: 156, width: 300, height: 300, opacity: 0.055 },
  empresaNombre: { fontSize: 14, fontWeight: 700 },
  empresaDatos: { fontSize: 9, color: '#44403c', marginTop: 2 },
  titulo: { fontSize: 18, fontWeight: 700, color: '#f97316', marginBottom: 6 },
  seccionDatos: { marginBottom: 16, padding: 12, backgroundColor: '#f5f5f4', borderRadius: 4 },
  datosLabel: { fontSize: 8, color: '#44403c', textTransform: 'uppercase', marginBottom: 4 },
  datosCliente: { fontSize: 12, fontWeight: 600 },
  datosText: { fontSize: 10, color: '#44403c', marginTop: 2 },
  seccionObs: { marginBottom: 16 },
  obsTitulo: { fontSize: 11, fontWeight: 700, marginBottom: 6, color: '#f97316', textTransform: 'uppercase' },
  obsTexto: { fontSize: 10, color: '#44403c' },
  grupoTitulo: { fontSize: 11, fontWeight: 700, marginTop: 12, marginBottom: 8, color: '#f97316', textTransform: 'uppercase' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 8 },
  gridCell: { width: '32%' },
  foto: { width: '100%', height: 160, objectFit: 'cover', borderRadius: 2 },
  firma: { marginTop: 24, paddingTop: 12, borderTopWidth: 0.5, borderTopColor: '#fed7aa' },
  firmaLabel: { fontSize: 9, color: '#44403c', textTransform: 'uppercase' },
  firmaNombre: { fontSize: 12, fontWeight: 600, marginTop: 4 },
  footer: { position: 'absolute', bottom: 24, left: 56, right: 56, flexDirection: 'row', justifyContent: 'space-between', fontSize: 8, color: '#44403c', borderTopWidth: 0.5, borderTopColor: '#fed7aa', paddingTop: 8 },
})

interface ReportPDFProps {
  informe: InformeTecnico
  logoSrc?: string
}

export function ReportPDF({ informe, logoSrc }: ReportPDFProps) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {logoSrc && <Image fixed style={styles.watermark} src={logoSrc} />}
        <View fixed>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {logoSrc && <Image style={styles.logo} src={logoSrc} />}
              <View>
                <Text style={styles.empresaNombre}>NEW POWER ENERGY SAS</Text>
                <Text style={styles.empresaDatos}>NIT 901826285-6</Text>
                <Text style={styles.empresaDatos}>VILLAVICENCIO-META</Text>
                <Text style={styles.empresaDatos}>Tel: (57) 3204931541</Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.titulo}>{informe.titulo}</Text>
              <Text style={styles.empresaDatos}>No. {informe.numero}</Text>
              <Text style={styles.empresaDatos}>{informe.fecha}</Text>
            </View>
          </View>
        </View>

        <View style={styles.seccionDatos}>
          <Text style={styles.datosLabel}>Datos del servicio</Text>
          <Text style={styles.datosCliente}>{informe.cliente}</Text>
          {informe.nit && <Text style={styles.datosText}>NIT {informe.nit}</Text>}
        </View>

        <View style={styles.seccionObs}>
          <Text style={styles.obsTitulo}>OBSERVACIONES</Text>
          <Text style={styles.obsTexto}>{informe.observaciones}</Text>
        </View>

        {informe.grupos.map((grupo) => (
          <View key={grupo.id} wrap={false}>
            <Text style={styles.grupoTitulo}>REGISTRO FOTOGRÁFICO — {grupo.nombre}</Text>
            <View style={styles.grid}>
              {grupo.fotos.map((foto) => (
                <View key={foto.id} style={styles.gridCell}>
                  <Image style={styles.foto} src={foto.src} />
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.firma}>
          <Text style={styles.firmaLabel}>TÉCNICO</Text>
          <Text style={styles.firmaNombre}>{informe.tecnico}</Text>
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
