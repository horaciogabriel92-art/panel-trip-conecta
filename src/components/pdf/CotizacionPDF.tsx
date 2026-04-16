'use client';

import { Document, Page, Text, View, StyleSheet, Image, Font, Link } from '@react-pdf/renderer';

// ============================================
// COLORES DE MARCA TRIP CONECTA
// ============================================
const DEFAULT_COLORS = {
  primary: '#0d9488',      // Teal-600 (color principal)
  primaryDark: '#0f766e',  // Teal-700
  primaryLight: '#14b8a6', // Teal-500
  accent: '#5eead4',       // Teal-300
  dark: '#134e4a',         // Teal-900
  text: '#1f2937',         // Gray-800
  textLight: '#6b7280',    // Gray-500
  background: '#f0fdfa',   // Teal-50
  white: '#ffffff',
};

// ============================================
// ESTILOS
// ============================================
function createStyles(COLORS: typeof DEFAULT_COLORS) {
  return StyleSheet.create({
  page: {
    padding: 25,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: COLORS.text,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottom: `2px solid ${COLORS.primary}`,
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBox: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.primary,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  companyTagline: {
    fontSize: 9,
    color: COLORS.textLight,
  },
  quoteInfo: {
    textAlign: 'right',
  },
  quoteNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  quoteDate: {
    fontSize: 9,
    color: COLORS.textLight,
    marginTop: 4,
  },

  // Secciones
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 5,
    textTransform: 'uppercase',
  },

  // Cards de info
  infoGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  infoCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 10,
    borderRadius: 6,
    borderLeft: `4px solid ${COLORS.primary}`,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  infoLabel: {
    width: 80,
    fontSize: 9,
    color: COLORS.textLight,
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
    backgroundColor: COLORS.background,
    padding: 8,
    borderRadius: 6,
  },
  packageImage: {
    width: 80,
    height: 60,
    borderRadius: 4,
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
    color: COLORS.textLight,
  },
  metaBold: {
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  packageDescription: {
    fontSize: 9,
    color: COLORS.textLight,
    lineHeight: 1.4,
  },

  // Tabla de precios
  pricingTable: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.dark,
    color: 'white',
    padding: 8,
    fontWeight: 'bold',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: `1px solid ${COLORS.textLight}`,
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
    backgroundColor: COLORS.primary,
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
    backgroundColor: COLORS.background,
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
    color: COLORS.textLight,
  },
  paymentValue: {
    fontSize: 10,
    fontWeight: 'bold',
  },

  // Banner de validez
  validityBanner: {
    backgroundColor: COLORS.background,
    border: `1px solid ${COLORS.primaryLight}`,
    padding: 10,
    borderRadius: 6,
    marginTop: 15,
    textAlign: 'center',
  },
  validityText: {
    fontSize: 9,
    color: COLORS.dark,
  },
  validityHighlight: {
    fontWeight: 'bold',
    color: COLORS.primaryDark,
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
    backgroundColor: COLORS.primary,
    borderRadius: 9999,
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
    color: COLORS.textLight,
  },

  // Footer
  footer: {
    marginTop: 15,
    paddingTop: 8,
    borderTop: `1px solid ${COLORS.primaryLight}`,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 7,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  footerLogo: {
    width: 40,
    height: 40,
    marginBottom: 5,
    alignSelf: 'center',
  },
  footerWithLogo: {
    marginTop: 20,
    paddingTop: 15,
    borderTop: `1px solid ${COLORS.textLight}`,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLogoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  footerLogoImage: {
    width: 35,
    height: 35,
  },
  footerLogoText: {
    flexDirection: 'column',
  },
  footerVendedorSection: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },

  // Página 2 - Itinerario
  dayCard: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderLeft: `4px solid ${COLORS.primary}`,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  dayBadge: {
    backgroundColor: COLORS.primary,
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
    color: COLORS.textLight,
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
    backgroundColor: COLORS.background,
    borderRadius: 6,
    border: `1px solid ${COLORS.primaryLight}`,
  },
  policiesTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 6,
  },
  policiesText: {
    fontSize: 9,
    color: COLORS.dark,
    lineHeight: 1.4,
  },
  
  // Hoteles
  hotelCard: {
    backgroundColor: COLORS.background,
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    borderLeft: `3px solid ${COLORS.primary}`,
  },
  hotelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  hotelName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.dark,
    flex: 1,
  },
  hotelButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  hotelButtonText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
  hotelInfo: {
    fontSize: 9,
    color: COLORS.textLight,
    marginTop: 2,
  },
  
  // Vuelos - Mejorado con fechas claras
  flightCard: {
    backgroundColor: COLORS.background,
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
    borderLeft: `3px solid ${COLORS.primary}`,
  },
  flightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  flightRoute: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  flightNumber: {
    backgroundColor: COLORS.primary,
    color: 'white',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 9,
    fontWeight: 'bold',
  },
  flightTimeline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  flightOrigin: {
    alignItems: 'flex-start',
    width: '35%',
  },
  flightDestination: {
    alignItems: 'flex-end',
    width: '35%',
  },
  flightConnector: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  flightConnectorLine: {
    width: '100%',
    height: 2,
    backgroundColor: COLORS.primary,
    marginBottom: 4,
  },
  flightConnectorArrow: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  flightTimeLarge: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  flightDateLarge: {
    fontSize: 9,
    color: COLORS.textLight,
    marginTop: 2,
  },
  flightAirport: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.primaryDark,
    marginTop: 4,
  },
  flightCity: {
    fontSize: 9,
    color: COLORS.textLight,
  },
  flightDuration: {
    fontSize: 8,
    color: COLORS.textLight,
    marginTop: 2,
  },
  flightMeta: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 10,
    paddingTop: 8,
    borderTop: `1px dashed ${COLORS.primaryLight}`,
  },
  flightMetaItem: {
    fontSize: 9,
    color: COLORS.textLight,
  },
  flightMetaLabel: {
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  
  // Price breakdown
  priceBreakdownSection: {
    marginTop: 10,
    padding: 10,
    backgroundColor: COLORS.background,
    borderRadius: 6,
    borderLeft: `3px solid ${COLORS.primary}`,
  },
  priceBreakdownTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.dark,
    marginBottom: 6,
  },
  priceBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  priceBreakdownLabel: {
    fontSize: 9,
    color: COLORS.textLight,
  },
  priceBreakdownValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  priceBreakdownDivider: {
    height: 1,
    backgroundColor: COLORS.textLight,
    marginVertical: 6,
  },
  priceBreakdownTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  priceBreakdownTotalLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  priceBreakdownTotalValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  });
}

// ============================================
// INTERFACES
// ============================================
interface CotizacionPDFProps {
  data: {
    cotizacion: {
      id: string;
      codigo: string;
      fecha_creacion: string;
      fecha_expiracion?: string;
      num_pasajeros: number;
      tipo_habitacion?: string;
      fecha_salida?: string;
      cliente_nombre?: string;
      cliente_apellido?: string;
      cliente_documento?: string;
      cliente_email?: string;
      cliente_telefono?: string;
      precio_total: number;
      tipo_cotizacion?: 'paquete' | 'manual';
      nombre_cotizacion?: string;
      itinerario_manual?: string;
      paquete_data?: {
        itinerario?: any;
        incluye?: string[];
        no_incluye?: string[];
      };
      incluye?: string[];
      no_incluye?: string[];
    };
    cliente: {
      nombre?: string;
      apellido?: string;
      documento?: string;
      email?: string;
      telefono?: string;
    };
    paquete: {
      titulo?: string;
      destino?: string;
      descripcion?: string;
      duracion_dias?: number;
      imagen_principal?: string;
      politicas_cancelacion?: string;
      itinerario?: any;
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
    hospedaje?: Array<any>;
    vuelos?: Array<any>;
    precios: {
      vuelos?: string | number;
      hospedajes?: string | number;
      extras?: string | number;
      servicios?: string | number;
      traslados?: string | number;
      subtotal?: string | number;
      impuestos?: string | number;
      total?: string | number;
      moneda?: string;
      precio_unitario?: string | number;
      anticipo?: string | number;
      saldo?: string | number;
    };
    vendedor: {
      nombre?: string;
      apellido?: string;
      email?: string;
      telefono?: string;
      iniciales?: string;
    };
  };
  colors?: Partial<typeof DEFAULT_COLORS>;
}
// ============================================
// HELPERS DE PRECIO (manejan strings formateados y números)
// ============================================
function parsePrice(value: string | number): number {
  if (typeof value === 'number') return value;
  // Convierte "5.980,00" -> 5980.00
  const clean = value.replace(/\./g, '').replace(',', '.');
  return parseFloat(clean) || 0;
}

function formatPrice(value: string | number): string {
  const num = typeof value === 'string' ? parsePrice(value) : value;
  const parts = num.toFixed(2).split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${integerPart},${parts[1]}`;
}

// ============================================
// COMPONENTE PDF
// ============================================
export function CotizacionPDFDocument({ data, colors }: CotizacionPDFProps) {
  const COLORS = { ...DEFAULT_COLORS, ...colors };
  const styles = createStyles(COLORS);
  const { cotizacion, cliente, paquete, pasajeros, hospedaje, vuelos, precios, vendedor } = data;
  
  // Calcular duración del viaje
  const calcularDuracion = () => {
    if (hospedaje && hospedaje.length > 0) {
      const checkin = new Date(hospedaje[0].fecha_checkin || '');
      const checkout = new Date(hospedaje[0].fecha_checkout || '');
      if (checkin && checkout) {
        const diff = Math.ceil((checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24));
        return diff;
      }
    }
    if (vuelos && vuelos.length >= 2) {
      const salida = new Date(vuelos[0].fecha_salida);
      const llegada = new Date(vuelos[vuelos.length - 1].fecha_llegada);
      if (salida && llegada) {
        const diff = Math.ceil((llegada.getTime() - salida.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return diff;
      }
    }
    return paquete.duracion_dias || 0;
  };
  
  const duracionDias = calcularDuracion();
  const esCotizacionManual = cotizacion.tipo_cotizacion === 'manual';
  const tituloCotizacion = cotizacion.nombre_cotizacion || paquete.titulo;
  const destino = hospedaje?.[0]?.ciudad || vuelos?.[vuelos.length - 1]?.destino_ciudad || paquete.destino;

  return (
    <Document>
      {/* ============================================
          PÁGINA 1: RESUMEN Y PRECIO
          ============================================ */}
      <Page size="A4" style={styles.page}>
        {/* Header - Título es el nombre del vendedor */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <View>
              <Text style={styles.companyName}>{vendedor.nombre} {vendedor.apellido}</Text>
              <Text style={styles.companyTagline}>Viajes y Turismo • tripconecta.com</Text>
            </View>
          </View>
          <View style={styles.quoteInfo}>
            <Text style={styles.quoteNumber}>{cotizacion.codigo}</Text>
            <Text style={styles.quoteDate}>Fecha: {cotizacion.fecha_creacion}</Text>
            <Text style={styles.quoteDate}>Válida hasta: {cotizacion.fecha_expiracion}</Text>
          </View>
        </View>

        {/* Datos del Cliente (Pasajero 1 - Titular) y Configuración */}
        <View style={styles.section}>
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>Pasajero 1 (Titular)</Text>
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
              <Text style={styles.sectionTitle}>Configuración del Viaje</Text>
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

        {/* Paquete / Cotización */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {esCotizacionManual ? 'Cotización Personalizada' : 'Paquete Turístico'}
          </Text>
          <View style={styles.packageCard}>
            {paquete.imagen_principal ? (
              <Image src={paquete.imagen_principal} style={styles.packageImage} />
            ) : null}
            <View style={styles.packageDetails}>
              <Text style={styles.packageTitle}>{tituloCotizacion}</Text>
              <View style={styles.packageMeta}>
                <Text style={styles.metaItem}>
                  <Text style={styles.metaBold}>Destino:</Text> {destino}
                </Text>
                <Text style={styles.metaItem}>
                  <Text style={styles.metaBold}>Duración:</Text> {duracionDias > 0 ? `${duracionDias} días` : 'No especificada'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Vuelos - Con fechas y horas claras */}
        {vuelos && vuelos.length > 0 && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Vuelos</Text>
            {vuelos.map((vuelo, idx) => (
              <View key={idx} style={styles.flightCard}>
                <View style={styles.flightHeader}>
                  <Text style={styles.flightRoute}>
                    {vuelo.origen_ciudad} → {vuelo.destino_ciudad}
                  </Text>
                  <Text style={styles.flightNumber}>
                    {vuelo.aerolinea_codigo} {vuelo.numero_vuelo}
                  </Text>
                </View>
                
                {/* Timeline visual con horas y fechas */}
                <View style={styles.flightTimeline}>
                  <View style={styles.flightOrigin}>
                    <Text style={styles.flightTimeLarge}>{vuelo.hora_salida}</Text>
                    <Text style={styles.flightDateLarge}>{vuelo.fecha_salida}</Text>
                    <Text style={styles.flightAirport}>{vuelo.origen_codigo}</Text>
                    <Text style={styles.flightCity}>{vuelo.origen_ciudad}</Text>
                  </View>
                  
                  <View style={styles.flightConnector}>
                    <View style={styles.flightConnectorLine} />
                    <Text style={styles.flightConnectorArrow}>✈</Text>
                    {vuelo.duracion && (
                      <Text style={styles.flightDuration}>{vuelo.duracion}</Text>
                    )}
                  </View>
                  
                  <View style={styles.flightDestination}>
                    <Text style={styles.flightTimeLarge}>{vuelo.hora_llegada}</Text>
                    <Text style={styles.flightDateLarge}>{vuelo.fecha_llegada}</Text>
                    <Text style={styles.flightAirport}>{vuelo.destino_codigo}</Text>
                    <Text style={styles.flightCity}>{vuelo.destino_ciudad}</Text>
                  </View>
                </View>
                
                <View style={styles.flightMeta}>
                  <Text style={styles.flightMetaItem}>
                    <Text style={styles.flightMetaLabel}>Aerolínea:</Text> {vuelo.aerolinea_nombre}
                  </Text>
                  <Text style={styles.flightMetaItem}>
                    <Text style={styles.flightMetaLabel}>Clase:</Text> {vuelo.clase_codigo}
                  </Text>
                  {vuelo.numero_vuelo && (
                    <Text style={styles.flightMetaItem}>
                      <Text style={styles.flightMetaLabel}>Vuelo:</Text> {vuelo.numero_vuelo}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Hotel desde Paquete - Después de Vuelos */}
        {(cotizacion.paquete_data as any)?.hotel_seleccionado && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hospedaje</Text>
            <View style={styles.hotelCard}>
              <View style={styles.hotelHeader}>
                <Text style={styles.hotelName}>{(cotizacion.paquete_data as any).hotel_seleccionado.nombre}</Text>
                {(cotizacion.paquete_data as any).hotel_seleccionado.link && (
                  <Link src={(cotizacion.paquete_data as any).hotel_seleccionado.link}>
                    <View style={styles.hotelButton}>
                      <Text style={styles.hotelButtonText}>Ver Hotel</Text>
                    </View>
                  </Link>
                )}
              </View>
              <Text style={styles.hotelInfo}>Ciudad: {(cotizacion.paquete_data as any).hotel_seleccionado.ciudad || 'No especificada'}</Text>
              {(cotizacion.paquete_data as any).hotel_seleccionado.tipo_habitacion && (
                <Text style={styles.hotelInfo}>Habitación: {(cotizacion.paquete_data as any).hotel_seleccionado.tipo_habitacion}</Text>
              )}
            </View>
          </View>
        )}

        {/* Tabla de Todos los Pasajeros */}
        {pasajeros.length > 0 && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Pasajeros ({pasajeros.length})</Text>
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
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Detalle de Precios</Text>
          
          <View style={styles.priceBreakdownSection}>
            {esCotizacionManual && (
              <>
                {/* Vuelos */}
                {parsePrice(precios.vuelos || '0') > 0 && (
                  <View style={styles.priceBreakdownRow}>
                    <Text style={styles.priceBreakdownLabel}>Vuelos</Text>
                    <Text style={styles.priceBreakdownValue}>${formatPrice(precios.vuelos || '0')} {precios.moneda}</Text>
                  </View>
                )}

                {/* Hospedajes */}
                {parsePrice(precios.hospedajes || '0') > 0 && (
                  <View style={styles.priceBreakdownRow}>
                    <Text style={styles.priceBreakdownLabel}>Hospedajes</Text>
                    <Text style={styles.priceBreakdownValue}>${formatPrice(precios.hospedajes || '0')} {precios.moneda}</Text>
                  </View>
                )}

                {/* Extras / Servicios */}
                {(parsePrice(precios.extras || '0') > 0 || parsePrice(precios.servicios || '0') > 0) && (
                  <View style={styles.priceBreakdownRow}>
                    <Text style={styles.priceBreakdownLabel}>Extras / Servicios</Text>
                    <Text style={styles.priceBreakdownValue}>${formatPrice(precios.extras || precios.servicios || '0')} {precios.moneda}</Text>
                  </View>
                )}

                {/* Subtotal */}
                <View style={styles.priceBreakdownRow}>
                  <Text style={styles.priceBreakdownLabel}>Subtotal</Text>
                  <Text style={styles.priceBreakdownValue}>${formatPrice(precios.subtotal || '0')} {precios.moneda}</Text>
                </View>

                {/* Impuestos */}
                {parsePrice(precios.impuestos || '0') > 0 && (
                  <View style={styles.priceBreakdownRow}>
                    <Text style={styles.priceBreakdownLabel}>Impuestos</Text>
                    <Text style={styles.priceBreakdownValue}>${formatPrice(precios.impuestos || '0')} {precios.moneda}</Text>
                  </View>
                )}

                <View style={styles.priceBreakdownDivider} />
              </>
            )}

            {/* Precio por persona */}
            <View style={styles.priceBreakdownRow}>
              <Text style={styles.priceBreakdownLabel}>Precio por persona</Text>
              <Text style={styles.priceBreakdownValue}>
                ${precios.precio_unitario ? formatPrice(precios.precio_unitario) : formatPrice(parsePrice(precios.total || 0) / (cotizacion.num_pasajeros || 1))} {precios.moneda}
              </Text>
            </View>
            
            <View style={styles.priceBreakdownDivider} />
            
            {/* Total */}
            <View style={styles.priceBreakdownTotal}>
              <Text style={styles.priceBreakdownTotalLabel}>TOTAL ({cotizacion.num_pasajeros} pasajeros)</Text>
              <Text style={styles.priceBreakdownTotalValue}>${formatPrice(precios.total || 0)} {precios.moneda}</Text>
            </View>
          </View>
        </View>

        {/* Incluye / No Incluye - Después del precio */}
        {(() => {
          const incluye = cotizacion.paquete_data?.incluye || cotizacion.incluye || paquete.incluye || [];
          const noIncluye = cotizacion.paquete_data?.no_incluye || cotizacion.no_incluye || paquete.no_incluye || [];
          
          if (incluye.length === 0 && noIncluye.length === 0) return null;
          
          return (
            <View style={styles.section} wrap={false}>
              <Text style={styles.sectionTitle}>Detalles del Servicio</Text>
              <View style={styles.includesGrid}>
                {incluye.length > 0 && (
                  <View style={[styles.includesBox, styles.includesBoxIncluye]}>
                    <Text style={[styles.includesTitle, styles.includesTitleGreen]}>Incluye</Text>
                    {incluye.map((item: string, idx: number) => (
                      <Text key={idx} style={[styles.includesItem, styles.checkGreen]}>+ {item}</Text>
                    ))}
                  </View>
                )}

                {noIncluye.length > 0 && (
                  <View style={[styles.includesBox, styles.includesBoxNoIncluye]}>
                    <Text style={[styles.includesTitle, styles.includesTitleRed]}>No incluye</Text>
                    {noIncluye.map((item: string, idx: number) => (
                      <Text key={idx} style={[styles.includesItem, styles.checkRed]}>- {item}</Text>
                    ))}
                  </View>
                )}
              </View>
            </View>
          );
        })()}

        {/* Itinerario del Paquete - Después de incluye/no incluye */}
        {(() => {
          const itin = cotizacion.paquete_data?.itinerario || paquete.itinerario;
          if (!itin) return null;
          
          return (
            <View style={styles.section} wrap={false}>
              <Text style={styles.sectionTitle}>Itinerario</Text>
              
              {/* Si es string */}
              {typeof itin === 'string' && (
                <View style={styles.dayCard}>
                  <Text style={styles.dayContent}>{itin}</Text>
                </View>
              )}
              
              {/* Si es objeto con {texto, dias} */}
              {typeof itin === 'object' && !Array.isArray(itin) && (itin as any).texto && (
                <View style={styles.dayCard}>
                  <Text style={styles.dayContent}>{(itin as any).texto}</Text>
                </View>
              )}
              
              {/* Si es array de días */}
              {typeof itin === 'object' && Array.isArray(itin) && itin.length > 0 && (
                itin.map((dia: any, idx: number) => (
                  <View key={idx} style={styles.dayCard}>
                    <View style={styles.dayHeader}>
                      <Text style={styles.dayBadge}>Día {dia.dia || idx + 1}</Text>
                      <Text style={styles.dayTitle}>{dia.titulo}</Text>
                    </View>
                    <Text style={styles.dayContent}>{dia.descripcion}</Text>
                  </View>
                ))
              )}
            </View>
          );
        })()}

        {/* Validez - 24 horas si no está paga */}
        <View style={styles.validityBanner} wrap={false}>
          <Text style={styles.validityText}>
            ⏰ Esta cotización tiene una validez de <Text style={styles.validityHighlight}>24 horas</Text> desde la fecha de emisión si aún no ha sido pagada. Una vez confirmada, el límite de validez será definido por el vendedor. Los precios están sujetos a disponibilidad.
          </Text>
        </View>

        {/* Vendedor */}
        <View style={styles.sellerSection} wrap={false}>
          <View style={styles.sellerAvatar}>
            <Text style={styles.sellerAvatarText}>{vendedor.iniciales}</Text>
          </View>
          <View style={styles.sellerInfo}>
            <Text style={styles.sellerName}>{vendedor.nombre} {vendedor.apellido}</Text>
            <Text style={styles.sellerContact}>{vendedor.email} | {vendedor.telefono || 'Sin teléfono'}</Text>
          </View>
        </View>

        {/* Footer - Solo al final */}
        <View style={styles.footerWithLogo} wrap={false}>
          <View style={styles.footerLogoSection}>
            <Image src="/logo-trip-conecta.png" style={styles.footerLogoImage} />
            <View style={styles.footerLogoText}>
              <Text style={styles.footerText}>Trip Conecta - www.tripconecta.com</Text>
              <Text style={styles.footerText}>soporte@tripconecta.com</Text>
            </View>
          </View>
          <View style={styles.footerVendedorSection}>
            <Text style={styles.footerText}>Cotización generada por {vendedor.nombre} {vendedor.apellido}</Text>
            <Text style={styles.footerText}>Para confirmar esta reserva, contacte a su vendedor asignado</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export default CotizacionPDFDocument;
