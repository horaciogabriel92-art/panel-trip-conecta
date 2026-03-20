'use client';

import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

// ============================================
// ESTILOS
// ============================================
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1a1a2e',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottom: '3px solid #e63946',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBox: {
    width: 50,
    height: 50,
    backgroundColor: '#1a1a2e',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: 'white',
    fontSize: 8,
    textAlign: 'center',
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  companyTagline: {
    fontSize: 9,
    color: '#666',
  },
  quoteInfo: {
    textAlign: 'right',
  },
  quoteNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e63946',
  },
  quoteDate: {
    fontSize: 9,
    color: '#666',
    marginTop: 4,
  },

  // Secciones
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#e63946',
    marginBottom: 8,
    textTransform: 'uppercase',
  },

  // Cards de info
  infoGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 6,
    borderLeft: '4px solid #e63946',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoLabel: {
    width: 80,
    fontSize: 9,
    color: '#666',
  },
  infoValue: {
    flex: 1,
    fontSize: 9,
    fontWeight: 'bold',
  },

  // Paquete
  packageCard: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  packageImage: {
    width: 100,
    height: 70,
    backgroundColor: '#ddd',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  packageImageText: {
    fontSize: 8,
    color: '#999',
  },
  packageDetails: {
    flex: 1,
  },
  packageTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  packageMeta: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 8,
  },
  metaItem: {
    fontSize: 9,
    color: '#666',
  },
  metaBold: {
    fontWeight: 'bold',
    color: '#1a1a2e',
  },
  packageDescription: {
    fontSize: 9,
    color: '#555',
    lineHeight: 1.4,
  },

  // Tabla de precios
  pricingTable: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    color: 'white',
    padding: 8,
    fontWeight: 'bold',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1px solid #ddd',
    fontSize: 9,
  },
  tableCell: {
    flex: 1,
  },
  tableCellRight: {
    flex: 1,
    textAlign: 'right',
  },
  totalRow: {
    backgroundColor: '#e63946',
    color: 'white',
    padding: 10,
    marginTop: 8,
    borderRadius: 4,
  },
  totalText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
  },

  // Info de pago
  paymentSection: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 6,
    marginTop: 15,
  },
  paymentGrid: {
    flexDirection: 'row',
    gap: 20,
  },
  paymentItem: {
    flex: 1,
  },
  paymentLabel: {
    fontSize: 8,
    color: '#666',
  },
  paymentValue: {
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Banner de validez
  validityBanner: {
    backgroundColor: '#fff3cd',
    border: '1px solid #ffc107',
    padding: 10,
    borderRadius: 6,
    marginTop: 15,
    textAlign: 'center',
  },
  validityText: {
    fontSize: 9,
    color: '#856404',
  },
  validityHighlight: {
    fontWeight: 'bold',
    color: '#e63946',
  },

  // Vendedor
  sellerSection: {
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sellerAvatar: {
    width: 35,
    height: 35,
    backgroundColor: '#e63946',
    borderRadius: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sellerAvatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  sellerInfo: {},
  sellerName: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  sellerContact: {
    fontSize: 8,
    color: '#666',
  },

  // Footer
  footer: {
    marginTop: 30,
    paddingTop: 10,
    borderTop: '2px solid #ddd',
    textAlign: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#999',
  },

  // Página 2 - Itinerario
  dayCard: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeft: '4px solid #e63946',
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  dayBadge: {
    backgroundColor: '#e63946',
    color: 'white',
    padding: '4 12',
    borderRadius: 20,
    fontSize: 10,
    fontWeight: 'bold',
  },
  dayTitle: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  dayContent: {
    fontSize: 9,
    color: '#555',
    lineHeight: 1.5,
  },

  // Includes
  includesSection: {
    marginTop: 20,
  },
  includesGrid: {
    flexDirection: 'row',
    gap: 15,
  },
  includesBox: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
  },
  includesBoxIncluye: {
    backgroundColor: '#d4edda',
    border: '1px solid #c3e6cb',
  },
  includesBoxNoIncluye: {
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
  },
  includesTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  includesTitleGreen: {
    color: '#155724',
  },
  includesTitleRed: {
    color: '#721c24',
  },
  includesItem: {
    fontSize: 9,
    marginBottom: 3,
    paddingLeft: 12,
  },
  checkGreen: {
    color: '#28a745',
  },
  checkRed: {
    color: '#dc3545',
  },

  // Políticas
  policiesSection: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#e7f3ff',
    borderRadius: 6,
    border: '1px solid #b8daff',
  },
  policiesTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#004085',
    marginBottom: 6,
  },
  policiesText: {
    fontSize: 9,
    color: '#004085',
    lineHeight: 1.4,
  },
});

// ============================================
// INTERFACES
// ============================================
interface CotizacionPDFProps {
  data: {
    cotizacion: {
      id: string;
      codigo: string;
      fecha_creacion: string;
      fecha_expiracion: string;
      num_pasajeros: number;
      tipo_habitacion?: string;
      fecha_salida?: string;
      dias_validez: number;
    };
    cliente: {
      nombre: string;
      apellido?: string;
      documento?: string;
      email?: string;
      telefono?: string;
    };
    paquete: {
      titulo: string;
      destino: string;
      descripcion?: string;
      duracion_dias: number;
      imagen_principal?: string;
      politicas_cancelacion?: string;
      itinerario?: Array<{
        dia: number;
        titulo: string;
        descripcion: string;
        actividades?: string[];
      }>;
      incluye?: string[];
      no_incluye?: string[];
    };
    pasajeros: Array<{
      nombre: string;
      apellido: string;
      documento?: string;
      fecha_nacimiento?: string;
      nacionalidad?: string;
    }>;
    precios: {
      moneda: string;
      precio_unitario: string;
      subtotal: string;
      impuestos: string;
      extras: string;
      total: string;
      anticipo: string;
      saldo: string;
    };
    vendedor: {
      nombre: string;
      apellido: string;
      email: string;
      telefono?: string;
      iniciales: string;
    };
  };
}

// ============================================
// COMPONENTE PDF
// ============================================
export function CotizacionPDFDocument({ data }: CotizacionPDFProps) {
  const { cotizacion, cliente, paquete, pasajeros, precios, vendedor } = data;

  return (
    <Document>
      {/* ============================================
          PÁGINA 1: RESUMEN Y PRECIO
          ============================================ */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>LOGO</Text>
            </View>
            <View>
              <Text style={styles.companyName}>TRIP CONECTA</Text>
              <Text style={styles.companyTagline}>Viajes y Turismo B2B</Text>
            </View>
          </View>
          <View style={styles.quoteInfo}>
            <Text style={styles.quoteNumber}>{cotizacion.codigo}</Text>
            <Text style={styles.quoteDate}>Fecha: {cotizacion.fecha_creacion}</Text>
            <Text style={styles.quoteDate}>Válida hasta: {cotizacion.fecha_expiracion}</Text>
          </View>
        </View>

        {/* Datos del Cliente y Configuración */}
        <View style={styles.section}>
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>👤 Cliente</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nombre:</Text>
                <Text style={styles.infoValue}>{cliente.nombre} {cliente.apellido}</Text>
              </View>
              {cliente.documento && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Documento:</Text>
                  <Text style={styles.infoValue}>{cliente.documento}</Text>
                </View>
              )}
              {cliente.email && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email:</Text>
                  <Text style={styles.infoValue}>{cliente.email}</Text>
                </View>
              )}
              {cliente.telefono && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Teléfono:</Text>
                  <Text style={styles.infoValue}>{cliente.telefono}</Text>
                </View>
              )}
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>✈️ Configuración del Viaje</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Pasajeros:</Text>
                <Text style={styles.infoValue}>{cotizacion.num_pasajeros}</Text>
              </View>
              {cotizacion.tipo_habitacion && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Habitación:</Text>
                  <Text style={styles.infoValue}>{cotizacion.tipo_habitacion}</Text>
                </View>
              )}
              {cotizacion.fecha_salida && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Fecha Salida:</Text>
                  <Text style={styles.infoValue}>{cotizacion.fecha_salida}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Paquete */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Paquete Turístico</Text>
          <View style={styles.packageCard}>
            <View style={styles.packageImage}>
              <Text style={styles.packageImageText}>Imagen</Text>
            </View>
            <View style={styles.packageDetails}>
              <Text style={styles.packageTitle}>{paquete.titulo}</Text>
              <View style={styles.packageMeta}>
                <Text style={styles.metaItem}>
                  <Text style={styles.metaBold}>Destino:</Text> {paquete.destino}
                </Text>
                <Text style={styles.metaItem}>
                  <Text style={styles.metaBold}>Duración:</Text> {paquete.duracion_dias} días
                </Text>
              </View>
              {paquete.descripcion && (
                <Text style={styles.packageDescription}>{paquete.descripcion}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Tabla de Pasajeros */}
        {pasajeros.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👥 Pasajeros ({pasajeros.length})</Text>
            <View style={styles.pricingTable}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableCell}>#</Text>
                <Text style={styles.tableCell}>Nombre</Text>
                <Text style={styles.tableCell}>Documento</Text>
                <Text style={styles.tableCell}>Fecha Nac.</Text>
                <Text style={styles.tableCell}>Nacionalidad</Text>
              </View>
              {pasajeros.map((p, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{idx + 1}</Text>
                  <Text style={styles.tableCell}>{p.nombre} {p.apellido}</Text>
                  <Text style={styles.tableCell}>{p.documento || '-'}</Text>
                  <Text style={styles.tableCell}>{p.fecha_nacimiento || '-'}</Text>
                  <Text style={styles.tableCell}>{p.nacionalidad || '-'}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Detalle de Precios */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Detalle de Precios</Text>
          <View style={styles.pricingTable}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCell}>Concepto</Text>
              <Text style={styles.tableCellRight}>Precio Unit.</Text>
              <Text style={styles.tableCellRight}>Cantidad</Text>
              <Text style={styles.tableCellRight}>Subtotal</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCell}>{paquete.titulo} - {cotizacion.tipo_habitacion || 'Estándar'}</Text>
              <Text style={styles.tableCellRight}>${precios.precio_unitario}</Text>
              <Text style={styles.tableCellRight}>{cotizacion.num_pasajeros}</Text>
              <Text style={styles.tableCellRight}>${precios.subtotal}</Text>
            </View>
          </View>

          <View style={styles.totalRow}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.totalText}>TOTAL A PAGAR</Text>
              <Text style={styles.totalAmount}>${precios.total} {precios.moneda}</Text>
            </View>
          </View>
        </View>

        {/* Info de Pago */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>💳 Información de Pago</Text>
          <View style={styles.paymentGrid}>
            <View style={styles.paymentItem}>
              <Text style={styles.paymentLabel}>Anticipo requerido (30%):</Text>
              <Text style={styles.paymentValue}>${precios.anticipo}</Text>
            </View>
            <View style={styles.paymentItem}>
              <Text style={styles.paymentLabel}>Saldo a pagar:</Text>
              <Text style={styles.paymentValue}>${precios.saldo}</Text>
            </View>
            <View style={styles.paymentItem}>
              <Text style={styles.paymentLabel}>Métodos de pago:</Text>
              <Text style={styles.paymentValue}>Transferencia / Depósito / Tarjeta</Text>
            </View>
            <View style={styles.paymentItem}>
              <Text style={styles.paymentLabel}>Moneda:</Text>
              <Text style={styles.paymentValue}>{precios.moneda}</Text>
            </View>
          </View>
        </View>

        {/* Validez */}
        <View style={styles.validityBanner}>
          <Text style={styles.validityText}>
            ⏰ Esta cotización tiene una validez de <Text style={styles.validityHighlight}>{cotizacion.dias_validez} días</Text> desde la fecha de emisión. Los precios están sujetos a disponibilidad y pueden variar sin previo aviso.
          </Text>
        </View>

        {/* Vendedor */}
        <View style={styles.sellerSection}>
          <View style={styles.sellerAvatar}>
            <Text style={styles.sellerAvatarText}>{vendedor.iniciales}</Text>
          </View>
          <View style={styles.sellerInfo}>
            <Text style={styles.sellerName}>{vendedor.nombre} {vendedor.apellido}</Text>
            <Text style={styles.sellerContact}>{vendedor.email} | {vendedor.telefono || 'Sin teléfono'}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Trip Conecta B2B - Plataforma de viajes para agencias</Text>
          <Text style={styles.footerText}>www.tripconecta.com | soporte@tripconecta.com</Text>
          <Text style={styles.footerText}>Los precios indicados son válidos al momento de la cotización y pueden estar sujetos a cambios.</Text>
        </View>
      </Page>

      {/* ============================================
          PÁGINA 2: ITINERARIO
          ============================================ */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>🗓️ Itinerario Detallado</Text>

        {paquete.itinerario && paquete.itinerario.length > 0 ? (
          paquete.itinerario.map((dia, idx) => (
            <View key={idx} style={styles.dayCard}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayBadge}>Día {dia.dia || idx + 1}</Text>
                <Text style={styles.dayTitle}>{dia.titulo}</Text>
              </View>
              <Text style={styles.dayContent}>{dia.descripcion}</Text>
              {dia.actividades && dia.actividades.length > 0 && (
                <View style={{ marginTop: 6 }}>
                  {dia.actividades.map((act, actIdx) => (
                    <Text key={actIdx} style={styles.dayContent}>• {act}</Text>
                  ))}
                </View>
              )}
            </View>
          ))
        ) : (
          <View style={styles.dayCard}>
            <Text style={styles.dayContent}>
              El itinerario detallado será proporcionado por el operador turístico una vez confirmada la reserva.
            </Text>
          </View>
        )}

        {/* Incluye / No Incluye */}
        {(paquete.incluye?.length > 0 || paquete.no_incluye?.length > 0) && (
          <View style={styles.includesSection}>
            <View style={styles.includesGrid}>
              {paquete.incluye?.length > 0 && (
                <View style={[styles.includesBox, styles.includesBoxIncluye]}>
                  <Text style={[styles.includesTitle, styles.includesTitleGreen]}>✅ El paquete incluye</Text>
                  {paquete.incluye.map((item, idx) => (
                    <Text key={idx} style={[styles.includesItem, styles.checkGreen]}>✓ {item}</Text>
                  ))}
                </View>
              )}

              {paquete.no_incluye?.length > 0 && (
                <View style={[styles.includesBox, styles.includesBoxNoIncluye]}>
                  <Text style={[styles.includesTitle, styles.includesTitleRed]}>❌ El paquete NO incluye</Text>
                  {paquete.no_incluye.map((item, idx) => (
                    <Text key={idx} style={[styles.includesItem, styles.checkRed]}>✗ {item}</Text>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Políticas de Cancelación */}
        {paquete.politicas_cancelacion && (
          <View style={styles.policiesSection}>
            <Text style={styles.policiesTitle}>📋 Políticas de Cancelación</Text>
            <Text style={styles.policiesText}>{paquete.politicas_cancelacion}</Text>
          </View>
        )}

        {/* Footer Página 2 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Esta cotización fue generada automáticamente por el sistema Trip Conecta B2B</Text>
          <Text style={styles.footerText}>Para confirmar esta reserva, contacte a su vendedor asignado</Text>
        </View>
      </Page>
    </Document>
  );
}

export default CotizacionPDFDocument;
