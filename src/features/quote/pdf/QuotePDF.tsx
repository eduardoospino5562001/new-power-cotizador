import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'
import type { Cotizacion } from '../types'
import { calcularTotales } from '../logic/calculations'

const styles = StyleSheet.create({
  page: {
    padding: 56,
    fontFamily: 'Inter',
    fontSize: 10,
    color: '#1c1917',
    lineHeight: 1.4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: '#f97316',
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  logo: {
    width: 50,
    height: 50,
  },
  empresaNombre: {
    fontSize: 14,
    fontWeight: 700,
  },
  empresaDatos: {
    fontSize: 9,
    color: '#44403c',
    marginTop: 2,
  },
  tituloCotizacion: {
    fontSize: 18,
    fontWeight: 700,
    color: '#f97316',
  },
  numeroCotizacion: {
    fontSize: 10,
    color: '#44403c',
    marginTop: 2,
  },
  seccionCliente: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f5f5f4',
    borderRadius: 4,
  },
  clienteLabel: {
    fontSize: 8,
    color: '#44403c',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  clienteNombre: {
    fontSize: 12,
    fontWeight: 600,
  },
  clienteNit: {
    fontSize: 10,
    color: '#44403c',
    marginTop: 2,
  },
  clienteExtra: {
    fontSize: 9,
    color: '#44403c',
    marginTop: 1,
  },
  tabla: {
    marginBottom: 16,
  },
  tablaHeader: {
    flexDirection: 'row',
    backgroundColor: '#fed7aa',
    padding: '6 8',
    fontSize: 9,
    fontWeight: 700,
  },
  tablaHeaderItem: { width: '6%' },
  tablaHeaderDesc: { width: '34%' },
  tablaHeaderCant: { width: '12%', textAlign: 'right' },
  tablaHeaderVr: { width: '18%', textAlign: 'right' },
  tablaHeaderImp: { width: '12%', textAlign: 'right' },
  tablaHeaderBruto: { width: '18%', textAlign: 'right' },
  tablaRow: {
    flexDirection: 'row',
    padding: '5 8',
    fontSize: 9,
    borderBottomWidth: 0.5,
    borderBottomColor: '#fed7aa',
  },
  tablaRowItem: { width: '6%' },
  tablaRowDesc: { width: '34%' },
  tablaRowCant: { width: '12%', textAlign: 'right' },
  tablaRowVr: { width: '18%', textAlign: 'right' },
  tablaRowImp: { width: '12%', textAlign: 'right' },
  tablaRowBruto: { width: '18%', textAlign: 'right', fontWeight: 600 },
  totales: {
    marginLeft: 'auto',
    width: '45%',
    marginBottom: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: '3 0',
    fontSize: 10,
  },
  totalRowBold: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: '6 0',
    fontSize: 12,
    fontWeight: 700,
    color: '#ea580c',
    borderTopWidth: 1.5,
    borderTopColor: '#1c1917',
    marginTop: 4,
  },
  notas: {
    fontSize: 8,
    color: '#44403c',
    lineHeight: 1.5,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: '#fed7aa',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 56,
    right: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#44403c',
    borderTopWidth: 0.5,
    borderTopColor: '#fed7aa',
    paddingTop: 8,
  },
})

const fmt = (n: number) =>
  '$ ' + Math.round(n).toLocaleString('es-CO')

interface QuotePDFProps {
  cotizacion: Cotizacion
  logoSrc?: string
}

export function QuotePDF({ cotizacion, logoSrc }: QuotePDFProps) {
  const tot = calcularTotales(cotizacion)

  return (
    <Document>
      <Page size="LETTER" style={styles.page} wrap>
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
              <Text style={styles.tituloCotizacion}>COTIZACIÓN</Text>
              <Text style={styles.numeroCotizacion}>No. {cotizacion.numero}</Text>
              <Text style={styles.empresaDatos}>{cotizacion.fecha}</Text>
            </View>
          </View>
        </View>

        <View style={styles.seccionCliente}>
          <Text style={styles.clienteLabel}>Para</Text>
          <Text style={styles.clienteNombre}>{cotizacion.cliente.nombre}</Text>
          <Text style={styles.clienteNit}>NIT {cotizacion.cliente.nit}</Text>
          {cotizacion.cliente.ciudad && (
            <Text style={styles.clienteExtra}>Ciudad: {cotizacion.cliente.ciudad}</Text>
          )}
          {cotizacion.cliente.contacto && (
            <Text style={styles.clienteExtra}>Contacto: {cotizacion.cliente.contacto}</Text>
          )}
          {cotizacion.vendedor && (
            <Text style={styles.clienteExtra}>Vendedor: {cotizacion.vendedor}</Text>
          )}
        </View>

        <View style={styles.tabla}>
          <View style={styles.tablaHeader}>
            <Text style={styles.tablaHeaderItem}>Item</Text>
            <Text style={styles.tablaHeaderDesc}>Descripción</Text>
            <Text style={styles.tablaHeaderCant}>Cantidad</Text>
            <Text style={styles.tablaHeaderVr}>Vr. Unitario</Text>
            <Text style={styles.tablaHeaderImp}>Impto</Text>
            <Text style={styles.tablaHeaderBruto}>Vr. Bruto</Text>
          </View>

          {cotizacion.items.map((item, i) => {
            const bruto = item.cantidad * item.valorUnitario
            return (
              <View key={item.id} style={styles.tablaRow}>
                <Text style={styles.tablaRowItem}>{i + 1}</Text>
                <Text style={styles.tablaRowDesc}>{item.descripcion}</Text>
                <Text style={styles.tablaRowCant}>{item.cantidad}</Text>
                <Text style={styles.tablaRowVr}>{fmt(item.valorUnitario)}</Text>
                <Text style={styles.tablaRowImp}>{item.impuestoPorcentaje}%</Text>
                <Text style={styles.tablaRowBruto}>{fmt(bruto)}</Text>
              </View>
            )
          })}
        </View>

        <View style={styles.totales}>
          <View style={styles.totalRow}>
            <Text>Total, Bruto</Text>
            <Text>{fmt(tot.totalBruto)}</Text>
          </View>
          {tot.descuento > 0 && (
            <View style={styles.totalRow}>
              <Text>Descuento</Text>
              <Text>-{fmt(tot.descuento)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>{fmt(tot.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>IVA</Text>
            <Text>{fmt(tot.totalIva)}</Text>
          </View>
          <View style={styles.totalRowBold}>
            <Text>Total a Pagar</Text>
            <Text>{fmt(tot.totalAPagar)}</Text>
          </View>
        </View>

        <View style={styles.notas}>
          <Text>{cotizacion.notas.revisionInforme}</Text>
          <Text>{'\n'}{cotizacion.notas.retenciones}</Text>
          <Text>{'\n'}{cotizacion.notas.accesorios}</Text>
          <Text style={{ marginTop: 8, fontWeight: 600 }}>{'\n'}VALIDEZ DE COTIZACION: ({cotizacion.validezDias}) DIAS</Text>
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
