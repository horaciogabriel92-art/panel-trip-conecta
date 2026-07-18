'use client';

import { useState, useEffect } from 'react';
import { PDFDownloadLink, PDFViewer, pdf } from '@react-pdf/renderer';
import { CotizacionPDFDocument } from './CotizacionPDF';
import { FileText, Download, Eye, X, Send, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';

interface CotizacionData {
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
  // Campos opcionales para cotizaciones manuales
  tipo_cotizacion?: 'paquete' | 'manual';
  nombre_cotizacion?: string;
  itinerario_manual?: string;
  imagen_url?: string;
  // Branding del PDF por tenant
  brand?: {
    logo_url?: string;
    nombre_marca?: string;
    tagline?: string;
    email?: string;
    telefono?: string;
    footer?: string;
  };
  // Datos ya estructurados - el componente padre debe proporcionarlos
  paquete?: {
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
  // Datos del paquete snapshot (CRM v2 - paquete_data JSONB)
  paquete_data?: {
    itinerario?: any;
    incluye?: string[];
    no_incluye?: string[];
  };
  pasajeros?: Array<{
    nombre: string;
    apellido: string;
    documento?: string;
    fecha_nacimiento?: string;
    nacionalidad?: string;
  }>;
  hospedaje?: Array<any>;
  traslados?: Array<any>;
  seguros?: Array<any>;
  extras?: Array<any>;
  vuelos?: Array<any>;
  vendedor?: {
    nombre?: string;
    apellido?: string;
    email?: string;
    telefono?: string;
  };
  // Desglose de precios
  precios?: {
    vuelos?: number;
    hospedajes?: number;
    extras?: number;
    servicios?: number;
    traslados?: number;
    seguros?: number;
    subtotal?: number;
    impuestos?: number;
    total?: number;
    moneda?: string;
  };
}

interface PDFDownloadButtonProps {
  data: CotizacionData;
  mostrarDesglose?: boolean;
  className?: string;
  cotizacionId?: string;
  clienteEmail?: string;
}

async function fetchLogoAsBase64(iataCode: string): Promise<string | null> {
  try {
    const res = await fetch(`/airlines/${iataCode}.png`);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export function PDFDownloadButton({ data, mostrarDesglose = true, className = '', cotizacionId, clienteEmail = '' }: PDFDownloadButtonProps) {
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const [showPreview, setShowPreview] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailTo, setEmailTo] = useState(clienteEmail);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [vuelosWithLogos, setVuelosWithLogos] = useState<any[]>(data.vuelos || []);
  const [loadingLogos, setLoadingLogos] = useState(false);
  const pdfColors = user?.preferencias?.pdf_colors;

  useEffect(() => {
    setEmailTo(clienteEmail || '');
  }, [clienteEmail]);

  useEffect(() => {
    async function loadLogos() {
      const vuelos = data.vuelos || [];
      if (vuelos.length === 0) {
        setVuelosWithLogos([]);
        return;
      }
      setLoadingLogos(true);
      const codes = [...new Set(vuelos.map((v: any) => v.aerolinea_codigo).filter(Boolean))];
      const map: Record<string, string | null> = {};
      await Promise.all(
        codes.map(async (code: string) => {
          map[code] = await fetchLogoAsBase64(code);
        })
      );
      setVuelosWithLogos(
        vuelos.map((v: any) => ({
          ...v,
          aerolinea_logo_base64: map[v.aerolinea_codigo] || undefined,
        }))
      );
      setLoadingLogos(false);
    }
    loadLogos();
  }, [data.vuelos]);

  // Preparar datos para el PDF - SIN parsing de notas
  // El componente padre debe proporcionar todos los datos estructurados
  const pdfData = {
    cotizacion: {
      id: data.id,
      codigo: data.codigo,
      fecha_creacion: new Date(data.fecha_creacion).toLocaleDateString('es-UY'),
      fecha_expiracion: data.fecha_expiracion 
        ? new Date(data.fecha_expiracion).toLocaleDateString('es-UY')
        : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('es-UY'),
      num_pasajeros: data.num_pasajeros || 1,
      tipo_habitacion: data.tipo_habitacion,
      fecha_salida: data.fecha_salida 
        ? new Date(data.fecha_salida).toLocaleDateString('es-UY')
        : undefined,
      dias_validez: 7,
      itinerario_manual: data.itinerario_manual,
      tipo_cotizacion: data.tipo_cotizacion,
      nombre_cotizacion: data.nombre_cotizacion,
      imagen_url: data.imagen_url,
      precio_total: data.precio_total,
      paquete_data: data.paquete_data
    },
    cliente: {
      nombre: data.cliente_nombre || 'Cliente',
      apellido: data.cliente_apellido || '',
      documento: data.cliente_documento || '',
      email: data.cliente_email || '',
      telefono: data.cliente_telefono || ''
    },
    paquete: {
      titulo: data.paquete?.titulo || data.nombre_cotizacion || 'Cotización',
      destino: data.paquete?.destino || '',
      descripcion: data.paquete?.descripcion || '',
      duracion_dias: data.paquete?.duracion_dias || 0,
      imagen_principal: data.paquete?.imagen_principal,
      politicas_cancelacion: data.paquete?.politicas_cancelacion,
      itinerario: data.paquete?.itinerario || { texto: '', dias: [] },
      incluye: data.paquete?.incluye || [],
      no_incluye: data.paquete?.no_incluye || []
    },
    pasajeros: (data.pasajeros || []).map((p: any) => ({
      nombre: p.nombre || '',
      apellido: p.apellido || '',
      documento: p.documento || '',
      fecha_nacimiento: p.fecha_nacimiento || '',
      nacionalidad: p.nacionalidad || ''
    })),
    hospedaje: data.hospedaje || [],
    traslados: data.traslados || [],
    seguros: data.seguros || [],
    extras: data.extras || [],
    vuelos: vuelosWithLogos || [],
    precios: {
      moneda: data.precios?.moneda || 'USD',
      precio_unitario: ((data.precios?.total || data.precio_total || 0) / (data.num_pasajeros || 1)).toLocaleString('es-UY', { minimumFractionDigits: 2 }),
      subtotal: (data.precios?.subtotal ?? (data.precios?.total || data.precio_total || 0)).toLocaleString('es-UY', { minimumFractionDigits: 2 }),
      impuestos: (data.precios?.impuestos || 0).toLocaleString('es-UY', { minimumFractionDigits: 2 }),
      extras: (data.precios?.extras || 0) > 0 ? (data.precios?.extras || 0).toLocaleString('es-UY', { minimumFractionDigits: 2 }) : '0.00',
      total: (data.precios?.total || data.precio_total || 0).toLocaleString('es-UY', { minimumFractionDigits: 2 }),
      anticipo: ((data.precios?.total || data.precio_total || 0) * 0.3).toLocaleString('es-UY', { minimumFractionDigits: 2 }),
      saldo: ((data.precios?.total || data.precio_total || 0) * 0.7).toLocaleString('es-UY', { minimumFractionDigits: 2 }),
      vuelos: (data.precios?.vuelos || 0) > 0 ? (data.precios?.vuelos || 0).toLocaleString('es-UY', { minimumFractionDigits: 2 }) : undefined,
      hospedajes: (data.precios?.hospedajes || 0) > 0 ? (data.precios?.hospedajes || 0).toLocaleString('es-UY', { minimumFractionDigits: 2 }) : undefined,
      servicios: (data.precios?.servicios || 0) > 0 ? (data.precios?.servicios || 0).toLocaleString('es-UY', { minimumFractionDigits: 2 }) : undefined,
      traslados: (data.precios?.traslados || 0) > 0 ? (data.precios?.traslados || 0).toLocaleString('es-UY', { minimumFractionDigits: 2 }) : undefined,
      seguros: (data.precios?.seguros || 0) > 0 ? (data.precios?.seguros || 0).toLocaleString('es-UY', { minimumFractionDigits: 2 }) : undefined,
    },
    vendedor: {
      nombre: data.vendedor?.nombre || 'Vendedor',
      apellido: data.vendedor?.apellido || '',
      email: data.vendedor?.email || '',
      telefono: data.vendedor?.telefono || '',
      iniciales: `${(data.vendedor?.nombre || '')[0] || ''}${(data.vendedor?.apellido || '')[0] || ''}`.toUpperCase()
    },
    brand: data.brand
  };

  const filename = `COT-${data.codigo}.pdf`;

  const handleSendEmail = async () => {
    if (!cotizacionId) {
      toastError('Falta el ID de cotización', 'Error');
      return;
    }
    if (!emailTo || !emailTo.includes('@')) {
      toastError('Ingresá un email válido', 'Error');
      return;
    }

    setSendingEmail(true);
    try {
      const doc = (
        <CotizacionPDFDocument
          data={pdfData}
          colors={pdfColors}
          mostrarDesglose={mostrarDesglose}
        />
      );
      const blob = await pdf(doc).toBlob();
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      await api.post(`/cotizaciones/${cotizacionId}/enviar-pdf`, {
        to: emailTo,
        pdfBase64: base64,
        filename
      });

      toastSuccess('Cotización enviada por email', '¡Listo!');
      setShowEmailModal(false);
    } catch (error: any) {
      console.error('Error enviando PDF:', error);
      toastError(
        error.response?.data?.error || error.message || 'Error al enviar el email',
        'Error'
      );
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex gap-2">
        {/* Botón Descargar PDF */}
        <PDFDownloadLink
          document={<CotizacionPDFDocument data={pdfData} colors={pdfColors} mostrarDesglose={mostrarDesglose} />}
          fileName={filename}
        >
          {({ loading }) => (
            <button
              disabled={loading || loadingLogos}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
            >
              {loading ? (
                <>
                  <FileText className="w-4 h-4 animate-pulse" />
                  Generando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Descargar PDF
                </>
              )}
            </button>
          )}
        </PDFDownloadLink>

        {/* Botón Vista Previa */}
        <button
          onClick={() => setShowPreview(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
        >
          <Eye className="w-4 h-4" />
          Vista Previa
        </button>

        {/* Botón Enviar por Email */}
        {cotizacionId && (
          <button
            onClick={() => setShowEmailModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
          >
            <Send className="w-4 h-4" />
            Enviar
          </button>
        )}
      </div>

      {/* Modal de Vista Previa */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-4xl h-[90vh] bg-white rounded-lg overflow-hidden flex flex-col">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-4 bg-slate-900 text-white">
              <h3 className="font-bold">Vista Previa: {filename}</h3>
              <div className="flex items-center gap-2">
                <PDFDownloadLink
                  document={<CotizacionPDFDocument data={pdfData} colors={pdfColors} mostrarDesglose={mostrarDesglose} />}
                  fileName={filename}
                >
                  {({ loading }) => (
                    <button
                      disabled={loading || loadingLogos}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-sm rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      {loading ? 'Generando...' : 'Descargar'}
                    </button>
                  )}
                </PDFDownloadLink>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 bg-slate-100">
              <PDFViewer width="100%" height="100%" className="border-0">
                <CotizacionPDFDocument data={pdfData} colors={pdfColors} mostrarDesglose={mostrarDesglose} />
              </PDFViewer>
            </div>
          </div>
        </div>
      )}

      {/* Modal Enviar por Email */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-md bg-[var(--background)] border border-[var(--border)] rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[var(--foreground)]">Enviar cotización por email</h3>
              <button
                onClick={() => setShowEmailModal(false)}
                className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[var(--muted-foreground)]" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--muted-foreground)] uppercase mb-2">
                  Email del cliente
                </label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="cliente@email.com"
                  className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
                />
              </div>

              <div className="p-3 bg-[var(--muted)] rounded-xl text-sm text-[var(--muted-foreground)]">
                Se adjuntará el PDF <span className="text-[var(--foreground)] font-medium">{filename}</span>.
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="flex-1 px-4 py-2 bg-[var(--muted)] hover:bg-[var(--muted)]/80 text-[var(--foreground)] rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={sendingEmail || !emailTo}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
                >
                  {sendingEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Enviar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PDFDownloadButton;
