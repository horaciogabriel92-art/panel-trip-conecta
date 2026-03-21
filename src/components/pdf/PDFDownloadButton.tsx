'use client';

import { useState } from 'react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { CotizacionPDFDocument } from './CotizacionPDF';
import { FileText, Download, RefreshCw, Eye, Loader2, X } from 'lucide-react';

interface CotizacionData {
  id: string;
  codigo: string;
  fecha_creacion: string;
  fecha_expiracion?: string;
  num_pasajeros: number;
  tipo_habitacion?: string;
  fecha_salida?: string;
  cliente_nombre: string;
  cliente_email?: string;
  cliente_telefono?: string;
  precio_total: number;
  notas?: string;
  // Campos para cotizaciones manuales
  tipo_cotizacion?: 'paquete' | 'manual';
  nombre_cotizacion?: string;
  itinerario_manual?: string;
  incluye?: string[];
  no_incluye?: string[];
  paquete?: {
    titulo?: string;
    destino?: string;
    descripcion?: string;
    duracion_dias?: number;
    imagen_principal?: string;
    politicas_cancelacion?: string;
    itinerario?: any[] | string;
    incluye?: string[];
    no_incluye?: string[];
  };
  vendedor?: {
    nombre?: string;
    apellido?: string;
    email?: string;
    telefono?: string;
  };
  pasajeros?: Array<{
    nombre: string;
    apellido: string;
    documento?: string;
    fecha_nacimiento?: string;
    nacionalidad?: string;
  }>;
  hospedaje?: Array<{
    nombre_hotel: string;
    link_hotel?: string;
    ciudad: string;
    fecha_checkin?: string;
    fecha_checkout?: string;
    tipo_habitacion?: string;
    regimen?: string;
  }>;
  vuelos?: Array<{
    linea: number;
    aerolinea_codigo: string;
    aerolinea_nombre: string;
    numero_vuelo: string;
    clase_codigo: string;
    fecha_salida: string;
    fecha_llegada: string;
    hora_salida: string;
    hora_llegada: string;
    origen_codigo: string;
    origen_ciudad: string;
    destino_codigo: string;
    destino_ciudad: string;
  }>;
}

interface PDFDownloadButtonProps {
  data: CotizacionData;
  className?: string;
}

export function PDFDownloadButton({ data, className = '' }: PDFDownloadButtonProps) {
  const [showPreview, setShowPreview] = useState(false);

  // Parsear paquete y datos_completos desde notas JSON
  let paqueteDesdeNotas: any = null;
  let datosCompletos: any = {};
  
  if (data.notas) {
    // Buscar PAQUETE JSON
    const paqueteMatch = data.notas.match(/--- PAQUETE JSON ---\n([\s\S]+?)(?:\n--- |$)/);
    if (paqueteMatch) {
      try {
        paqueteDesdeNotas = JSON.parse(paqueteMatch[1]);
      } catch (e) {
        console.error('Error parseando paquete JSON:', e);
      }
    }
    
    // Buscar DATOS COMPLETOS
    const datosMatch = data.notas.match(/--- DATOS COMPLETOS ---\n([\s\S]+?)(?:\n--- |$)/);
    if (datosMatch) {
      try {
        datosCompletos = JSON.parse(datosMatch[1]);
      } catch (e) {
        console.error('Error parseando datos_completos:', e);
      }
    }
  }

  // Preparar datos para el PDF
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
      dias_validez: 7
    },
    cliente: {
      nombre: datosCompletos.cliente?.nombre || data.cliente_nombre || 'No especificado',
      apellido: datosCompletos.cliente?.apellido || '',
      documento: datosCompletos.cliente?.documento || '',
      email: datosCompletos.cliente?.email || data.cliente_email || '',
      telefono: datosCompletos.cliente?.telefono || data.cliente_telefono || ''
    },
    paquete: {
      titulo: paqueteDesdeNotas?.titulo || data.paquete?.titulo || 'Paquete no disponible',
      destino: paqueteDesdeNotas?.destino || data.paquete?.destino || '',
      descripcion: paqueteDesdeNotas?.descripcion || data.paquete?.descripcion || '',
      duracion_dias: paqueteDesdeNotas?.duracion_dias || data.paquete?.duracion_dias || 0,
      imagen_principal: paqueteDesdeNotas?.imagen_principal || data.paquete?.imagen_principal,
      politicas_cancelacion: paqueteDesdeNotas?.politicas_cancelacion || data.paquete?.politicas_cancelacion,
      itinerario: paqueteDesdeNotas?.itinerario || data.paquete?.itinerario || [],
      incluye: paqueteDesdeNotas?.incluye || data.paquete?.incluye || [],
      no_incluye: paqueteDesdeNotas?.no_incluye || data.paquete?.no_incluye || []
    },
    pasajeros: [
      // Pasajero 1 (titular)
      {
        nombre: datosCompletos.cliente?.nombre || '',
        apellido: datosCompletos.cliente?.apellido || '',
        documento: datosCompletos.cliente?.documento || '',
        fecha_nacimiento: datosCompletos.cliente?.fecha_nacimiento
          ? new Date(datosCompletos.cliente.fecha_nacimiento).toLocaleDateString('es-UY')
          : '',
        nacionalidad: datosCompletos.cliente?.nacionalidad || ''
      },
      // Pasajeros adicionales (2 en adelante)
      ...(datosCompletos.pasajeros || []).map((p: any) => ({
        nombre: p.nombre || '',
        apellido: p.apellido || '',
        documento: p.documento || '',
        fecha_nacimiento: p.fecha_nacimiento 
          ? new Date(p.fecha_nacimiento).toLocaleDateString('es-UY')
          : '',
        nacionalidad: p.nacionalidad || ''
      }))
    ],
    hospedaje: data.hospedaje || [],
    precios: {
      moneda: 'USD',
      precio_unitario: ((data.precio_total || 0) / (data.num_pasajeros || 1)).toLocaleString('es-UY', { minimumFractionDigits: 2 }),
      subtotal: (data.precio_total || 0).toLocaleString('es-UY', { minimumFractionDigits: 2 }),
      impuestos: '0.00',
      extras: '0.00',
      total: (data.precio_total || 0).toLocaleString('es-UY', { minimumFractionDigits: 2 }),
      anticipo: ((data.precio_total || 0) * 0.3).toLocaleString('es-UY', { minimumFractionDigits: 2 }),
      saldo: ((data.precio_total || 0) * 0.7).toLocaleString('es-UY', { minimumFractionDigits: 2 })
    },
    vendedor: {
      nombre: data.vendedor?.nombre || 'Vendedor',
      apellido: data.vendedor?.apellido || '',
      email: data.vendedor?.email || '',
      telefono: data.vendedor?.telefono || '',
      iniciales: `${(data.vendedor?.nombre || '')[0] || ''}${(data.vendedor?.apellido || '')[0] || ''}`.toUpperCase()
    }
  };

  const filename = `COT-${data.codigo}.pdf`;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex gap-2">
        {/* Botón Descargar PDF */}
        <PDFDownloadLink
          document={<CotizacionPDFDocument data={pdfData} />}
          fileName={filename}
        >
          {({ loading, error }) => (
            <button
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              {loading ? 'Generando...' : 'Descargar PDF'}
            </button>
          )}
        </PDFDownloadLink>

        {/* Botón Vista Previa */}
        <button
          onClick={() => setShowPreview(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          title="Ver PDF"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Modal de Vista Previa */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-4xl h-[90vh] bg-white rounded-xl overflow-hidden">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-4 bg-gray-100 border-b">
              <h3 className="font-bold text-gray-800">Vista Previa: {filename}</h3>
              <div className="flex gap-2">
                <PDFDownloadLink
                  document={<CotizacionPDFDocument data={pdfData} />}
                  fileName={filename}
                >
                  {({ loading }) => (
                    <button
                      disabled={loading}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      Descargar
                    </button>
                  )}
                </PDFDownloadLink>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Viewer */}
            <div className="h-[calc(90vh-65px)]">
              <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
                <CotizacionPDFDocument data={pdfData} />
              </PDFViewer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PDFDownloadButton;
