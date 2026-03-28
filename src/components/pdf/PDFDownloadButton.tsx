'use client';

import { useState } from 'react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { CotizacionPDFDocument } from './CotizacionPDF';
import { FileText, Download, Eye, X } from 'lucide-react';

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
  pasajeros?: Array<{
    nombre: string;
    apellido: string;
    documento?: string;
    fecha_nacimiento?: string;
    nacionalidad?: string;
  }>;
  hospedaje?: Array<any>;
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
    servicios?: number;
    traslados?: number;
    impuestos?: number;
    total?: number;
    moneda?: string;
  };
}

interface PDFDownloadButtonProps {
  data: CotizacionData;
  className?: string;
}

export function PDFDownloadButton({ data, className = '' }: PDFDownloadButtonProps) {
  const [showPreview, setShowPreview] = useState(false);

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
      nombre_cotizacion: data.nombre_cotizacion
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
    vuelos: data.vuelos || [],
    precios: {
      moneda: data.precios?.moneda || 'USD',
      precio_unitario: ((data.precio_total || 0) / (data.num_pasajeros || 1)).toLocaleString('es-UY', { minimumFractionDigits: 2 }),
      subtotal: (data.precio_total || 0).toLocaleString('es-UY', { minimumFractionDigits: 2 }),
      impuestos: (data.precios?.impuestos || 0).toLocaleString('es-UY', { minimumFractionDigits: 2 }),
      extras: '0.00',
      total: (data.precios?.total || data.precio_total || 0).toLocaleString('es-UY', { minimumFractionDigits: 2 }),
      anticipo: ((data.precios?.total || data.precio_total || 0) * 0.3).toLocaleString('es-UY', { minimumFractionDigits: 2 }),
      saldo: ((data.precios?.total || data.precio_total || 0) * 0.7).toLocaleString('es-UY', { minimumFractionDigits: 2 }),
      vuelos: (data.precios?.vuelos || 0) > 0 ? (data.precios?.vuelos || 0).toLocaleString('es-UY', { minimumFractionDigits: 2 }) : undefined,
      hospedajes: (data.precios?.hospedajes || 0) > 0 ? (data.precios?.hospedajes || 0).toLocaleString('es-UY', { minimumFractionDigits: 2 }) : undefined,
      servicios: (data.precios?.servicios || 0) > 0 ? (data.precios?.servicios || 0).toLocaleString('es-UY', { minimumFractionDigits: 2 }) : undefined,
      traslados: (data.precios?.traslados || 0) > 0 ? (data.precios?.traslados || 0).toLocaleString('es-UY', { minimumFractionDigits: 2 }) : undefined,
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
          {({ loading }) => (
            <button
              disabled={loading}
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
                  document={<CotizacionPDFDocument data={pdfData} />}
                  fileName={filename}
                >
                  {({ loading }) => (
                    <button
                      disabled={loading}
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
