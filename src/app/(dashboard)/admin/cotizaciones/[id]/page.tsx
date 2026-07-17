"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useFeature } from '@/hooks/useFeature';
import HistorialPagos from '@/components/ventas/HistorialPagos';
import AgregarPagoModal from '@/components/ventas/AgregarPagoModal';
import { PDFDownloadButton } from '@/components/pdf/PDFDownloadButton';
import { 
  ArrowLeft, 
  FileText, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Users, 
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  ArrowRight,
  UserCircle,
  CreditCard,
  Download,
  Receipt,
  Plane,
  Hotel,
  MapPin,
  FileDown,
  Wallet,
  BedDouble,
  Bus,
  Shield,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

interface Pasajero {
  id: string;
  nombre_snapshot: string;
  apellido_snapshot: string;
  documento_snapshot: string;
  tipo_habitacion: string;
  es_titular: boolean;
}

interface Vuelo {
  id?: string;
  origen_ciudad?: string;
  origen_nombre?: string;
  destino_ciudad?: string;
  destino_nombre?: string;
  fecha_salida?: string;
  hora_salida?: string;
  fecha_llegada?: string;
  hora_llegada?: string;
  aerolinea_nombre?: string;
  aerolinea_codigo?: string;
  numero_vuelo?: string;
  clase_codigo?: string;
  clase_nombre?: string;
}

interface Comprobante {
  id: string;
  nombre_archivo: string;
  url: string;
  ruta_archivo?: string;
}

interface Venta {
  id: string;
  codigo: string;
  fecha_creacion: string;
  precio_total: number;
  pago_heredado: boolean;
  monto_pagado_heredado?: number;
  tipo_pago_heredado?: string;
  medio_pago_heredado?: string;
  observaciones_pago_heredado?: string;
  comprobantes_pago_urls?: string;
  comision_estado: 'pendiente' | 'pagada';
  comision_monto: number;
}

interface Voucher {
  id: string;
  tipo_documento: 'vuelo' | 'hotel' | 'seguro' | 'otro';
  nombre_archivo: string;
  ruta_archivo: string;
  descripcion?: string;
  fecha_subida: string;
  url: string;
}

interface Cotizacion {
  id: string;
  codigo: string;
  cliente_nombre: string;
  cliente_email: string;
  cliente_telefono: string;
  vendedor_id: string;
  vendedor_nombre?: string;
  paquete_id: string;
  paquete_nombre?: string;
  num_pasajeros: number;
  tipo_habitacion: string;
  fecha_salida?: string;
  precio_total: number;
  comision_vendedor?: number;
  mostrar_desglose_pdf?: boolean;
  estado: 'nueva' | 'enviada' | 'vendida' | 'perdida';
  notas?: string;
  notas_internas?: string;
  fecha_creacion: string;
  fecha_expiracion?: string;
  fecha_envio?: string;
  fecha_venta?: string;
  tipo_cotizacion?: 'paquete' | 'manual';
  nombre_cotizacion?: string;
  destino_principal?: string;
  itinerario_manual?: string;
  itinerario?: any;
  incluye?: string[];
  no_incluye?: string[];
  paquete_data?: {
    itinerario?: any;
    incluye?: string[];
    no_incluye?: string[];
    hotel_seleccionado?: any;
    fecha_salida?: string;
    precio_vuelos?: number;
    precio_hospedajes?: number;
    precio_traslados?: number;
    precio_seguros?: number;
    precio_extras?: number;
    precio_subtotal?: number;
    precio_impuestos?: number;
  };
  // Campos de pago
  monto_pagado?: number;
  monto_restante?: number;
  fecha_pago_resto?: string;
  tipo_pago?: string;
  pagos?: Array<{
    id: string;
    monto: number;
    medio_pago?: string;
    fecha_pago: string;
    observaciones?: string;
    tipo: 'inicial' | 'adicional';
    comprobante_url?: string;
  }>;
  // Relaciones enriquecidas
  pasajeros?: Pasajero[];
  vuelos?: Vuelo[];
  hospedajes?: any[];
  hospedaje?: any[];
  traslados?: any[];
  seguros?: any[];
  extras?: any[];
  paquete?: Paquete;
  venta?: Venta;
  comprobantes_pago?: Comprobante[];
  vouchers?: Voucher[];
  datos_completos?: {
    cliente?: any;
    pasajeros?: any[];
  };
  // Desglose de precios
  precio_vuelos?: number;
  precio_hospedajes?: number;
  precio_traslados?: number;
  precio_seguros?: number;
  precio_extras?: number;
  precio_subtotal?: number;
  precio_impuestos?: number;
  precio_moneda?: string;
  // Datos completos del cliente desde la BD
  cliente?: {
    id: string;
    nombre: string;
    apellido: string;
    email?: string;
    telefono?: string;
    documento?: string;
    fecha_nacimiento?: string;
  };
  vendedor?: {
    id: string;
    nombre: string;
    apellido: string;
    email?: string;
    telefono?: string;
  };
}

interface Paquete {
  id: string;
  titulo: string;
  nombre?: string;  // fallback
  destino?: string;
  descripcion?: string;
  duracion?: number;
  duracion_dias?: number;
  noches?: number;
  categoria?: string;
  regimen?: string;
  imagen_url?: string;
  imagen_principal?: string;
  politicas_cancelacion?: string;
  incluye?: string[];
  no_incluye?: string[];
  itinerario?: { texto?: string; dias?: any[] } | any[] | string;
  vuelos?: any[];
}

export default function AdminCotizacionDetalle() {
  const { success: toastSuccess, error: toastError } = useToast();
  const { enabled: comisionesEnabled } = useFeature('comisiones');
  const params = useParams();
  const router = useRouter();
  const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAprobarModal, setShowAprobarModal] = useState(false);
  const [showRechazarModal, setShowRechazarModal] = useState(false);
  const [showPagarComision, setShowPagarComision] = useState(false);
  const [notasAdmin, setNotasAdmin] = useState('');
  
  // Estados para formulario de pago de comisión
  const [metodoPagoComision, setMetodoPagoComision] = useState('transferencia');
  const [referenciaPagoComision, setReferenciaPagoComision] = useState('');
  const [notasPagoComision, setNotasPagoComision] = useState('');
  
  // Estados para vouchers
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoadingVouchers, setIsLoadingVouchers] = useState(false);
  const [tipoVoucher, setTipoVoucher] = useState<'boleto_aereo' | 'voucher_hotel' | 'voucher_actividad' | 'seguro' | 'itinerario_final' | 'e_ticket' | 'boarding_pass' | 'otro'>('boleto_aereo');
  const [isUploadingVoucher, setIsUploadingVoucher] = useState(false);
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [showComisionModal, setShowComisionModal] = useState(false);
  const [comisionMontoInput, setComisionMontoInput] = useState('');
  const [pendingVoucherFile, setPendingVoucherFile] = useState<File | null>(null);
  const [isEnviandoConfirmacion, setIsEnviandoConfirmacion] = useState(false);

  // Estado para datos parseados de notas (cotizaciones de catálogo antiguas)
  const [datosPaqueteDesdeNotas, setDatosPaqueteDesdeNotas] = useState<{
    titulo?: string;
    destino?: string;
    descripcion?: string;
    duracion_dias?: number;
    imagen_principal?: string;
    politicas_cancelacion?: string;
    itinerario?: { texto?: string; dias?: any[] } | any[] | string;
    incluye?: string[];
    no_incluye?: string[];
    vuelos?: any[];
    hospedaje?: any[];
  } | null>(null);

  useEffect(() => {
    const fetchCotizacion = async () => {
      try {
        const res = await api.get(`/cotizaciones/${params.id}`);
        const cotizacionData = res.data;
        setCotizacion(cotizacionData);

        // Parsear notas si contienen JSON de paquete (cotizaciones antiguas de catálogo)
        if (cotizacionData.notas && cotizacionData.notas.includes('--- PAQUETE JSON ---')) {
          try {
            const paqueteMatch = cotizacionData.notas.match(/--- PAQUETE JSON ---\n([\s\S]+?)(?:\n--- |$)/);
            if (paqueteMatch) {
              const paqueteJson = JSON.parse(paqueteMatch[1]);
              setDatosPaqueteDesdeNotas({
                titulo: paqueteJson.titulo || paqueteJson.nombre,
                destino: paqueteJson.destino,
                descripcion: paqueteJson.descripcion,
                duracion_dias: paqueteJson.duracion_dias,
                imagen_principal: paqueteJson.imagen_principal || paqueteJson.imagen_url,
                politicas_cancelacion: paqueteJson.politicas_cancelacion,
                itinerario: paqueteJson.itinerario,
                incluye: paqueteJson.incluye,
                no_incluye: paqueteJson.no_incluye,
                vuelos: paqueteJson.vuelos,
                hospedaje: paqueteJson.hospedaje
              });
            }
          } catch (e) {
            console.error('Error parseando notas:', e);
          }
        }
      } catch (err) {
        console.error('Error cargando cotización:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchCotizacion();
    }
  }, [params.id]);

  const handleAprobar = async () => {
    try {
      await api.put(`/cotizaciones/${params.id}/aprobar`, { notas_admin: notasAdmin });
      toastSuccess('Cotización aprobada', 'Aprobada');
      setShowAprobarModal(false);
      router.refresh();
    } catch (err: any) {
      toastError(err.response?.data?.error || 'Error al aprobar', 'Error');
    }
  };

  const handleRechazar = async () => {
    try {
      await api.put(`/cotizaciones/${params.id}/rechazar`, { notas_admin: notasAdmin });
      toastSuccess('Cotización rechazada', 'Rechazada');
      setShowRechazarModal(false);
      router.push('/admin/cotizaciones');
    } catch (err: any) {
      toastError(err.response?.data?.error || 'Error al rechazar', 'Error');
    }
  };

  const handlePagarComision = async () => {
    if (!venta?.id) return;
    try {
      await api.put(`/ventas/${venta.id}/pagar-comision`, {
        metodo_pago: metodoPagoComision,
        referencia_pago: referenciaPagoComision || null,
        notas: notasPagoComision || null
      });
      toastSuccess('Comisión marcada como pagada', 'Pago registrado');
      setShowPagarComision(false);
      // Limpiar formulario
      setMetodoPagoComision('transferencia');
      setReferenciaPagoComision('');
      setNotasPagoComision('');
      // Refrescar datos
      const res = await api.get(`/cotizaciones/${params.id}`);
      setCotizacion(res.data);
    } catch (err: any) {
      toastError(err.response?.data?.error || 'Error al pagar comisión', 'Error');
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'vendida': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'enviada': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'nueva': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'perdida': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getStatusLabel = (estado: string) => {
    switch (estado) {
      case 'vendida': return 'VENDIDA';
      case 'enviada': return 'ENVIADA';
      case 'nueva': return 'NUEVA';
      case 'perdida': return 'PERDIDA';
      default: return estado.toUpperCase();
    }
  };

  const getPagoBadge = (tipo?: string) => {
    if (tipo === 'total') {
      return <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-bold">PAGO TOTAL</span>;
    } else if (tipo === 'parcial') {
      return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full font-bold">PAGO PARCIAL</span>;
    }
    return <span className="px-2 py-1 bg-slate-500/20 text-slate-400 text-xs rounded-full font-bold">PENDIENTE</span>;
  };

  const handleDownloadComprobante = async (comprobanteId: string, filename: string, rutaArchivo?: string) => {
    try {
      let downloadUrl: string;

      // Si el ID empieza con 'comp_' es un comprobante legacy del JSON
      // Usar endpoint de descarga por nombre de archivo
      if (comprobanteId.startsWith('comp_') && rutaArchivo) {
        // Extraer solo el nombre del archivo (sin la ruta)
        const filenameFromPath = rutaArchivo.split('/').pop() || filename;
        downloadUrl = `/upload/comprobante-pago/download-by-filename/${filenameFromPath}`;
      } else {
        // Comprobante de la tabla comprobantes_pago con ID real
        downloadUrl = `/upload/comprobante-pago/${comprobanteId}/download`;
      }
      
      // Usar el endpoint de descarga directa del backend
      const response = await api.get(downloadUrl, {
        responseType: 'blob'
      });
      
      // Crear blob y descargar
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (err: any) {
      console.error('Error descargando comprobante:', err);
      toastError('Error al descargar el comprobante', 'Descarga fallida');
    }
  };

  // ============================================
  // FUNCIONES PARA VOUCHERS
  // ============================================
  
  // Cargar vouchers cuando hay venta
  useEffect(() => {
    const fetchVouchers = async () => {
      if (cotizacion?.venta?.id) {
        setIsLoadingVouchers(true);
        try {
          const res = await api.get(`/upload/vouchers/${cotizacion.venta.id}`);
          setVouchers(res.data);
        } catch (err) {
          console.error('Error cargando vouchers:', err);
        } finally {
          setIsLoadingVouchers(false);
        }
      }
    };
    
    fetchVouchers();
  }, [cotizacion?.venta?.id]);
  
  // Subir voucher
  const handleVoucherUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !cotizacion?.venta?.id) return;
    
    // Precargar comisión actual de la venta
    const comisionActual = cotizacion.venta?.comision_monto ?? cotizacion.comision_vendedor ?? 0;
    setComisionMontoInput(String(comisionActual));
    setPendingVoucherFile(file);
    setShowComisionModal(true);
  };
  
  const confirmVoucherUpload = async () => {
    if (!pendingVoucherFile || !cotizacion?.venta?.id) return;
    
    setIsUploadingVoucher(true);
    setShowComisionModal(false);
    try {
      const formData = new FormData();
      formData.append('voucher', pendingVoucherFile);
      formData.append('tipo_documento', tipoVoucher);
      formData.append('comision_monto', comisionMontoInput);
      
      await api.post(`/upload/voucher/${cotizacion.venta.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Recargar vouchers
      const res = await api.get(`/upload/vouchers/${cotizacion.venta.id}`);
      setVouchers(res.data);
      
      // Refrescar cotización para ver comisión actualizada
      const cotRes = await api.get(`/cotizaciones/${params.id}`);
      setCotizacion(cotRes.data);
      
      toastSuccess('Voucher subido exitosamente', 'Subida OK');
    } catch (err: any) {
      console.error('Error subiendo voucher:', err);
      toastError(err.response?.data?.error || 'Error al subir voucher', 'Error');
    } finally {
      setIsUploadingVoucher(false);
      setPendingVoucherFile(null);
    }
  };
  
  // Descargar voucher
  const handleDownloadVoucher = async (voucherId: string, filename: string) => {
    try {
      const response = await api.get(`/upload/voucher/${voucherId}/download`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Error descargando voucher:', err);
      toastError('Error al descargar voucher', 'Descarga fallida');
    }
  };
  
  // Eliminar voucher
  const handleDeleteVoucher = async (voucherId: string) => {
    if (!confirm('¿Estás seguro de eliminar este voucher?')) return;
    
    try {
      await api.delete(`/upload/voucher/${voucherId}`);
      
      // Recargar vouchers
      if (cotizacion?.venta?.id) {
        const res = await api.get(`/upload/vouchers/${cotizacion.venta.id}`);
        setVouchers(res.data);
      }
      
      toastSuccess('Voucher eliminado exitosamente', 'Eliminado');
    } catch (err: any) {
      console.error('Error eliminando voucher:', err);
      toastError(err.response?.data?.error || 'Error al eliminar voucher', 'Error');
    }
  };

  // Enviar confirmación por email
  const handleEnviarConfirmacion = async () => {
    if (!cotizacion?.venta?.id) return;
    if (vouchers.length === 0) {
      toastError('No hay vouchers para adjuntar', 'Sin vouchers');
      return;
    }
    if (!window.confirm(`¿Enviar confirmación a ${cotizacion.cliente_email || 'el cliente'} con ${vouchers.length} voucher(s)?`)) return;

    setIsEnviandoConfirmacion(true);
    try {
      await api.post(`/ventas/${cotizacion.venta.id}/enviar-confirmacion`, {
        voucherIds: vouchers.map(v => v.id)
      });
      toastSuccess('Confirmación enviada correctamente', 'Email enviado');
    } catch (err: any) {
      console.error('Error enviando confirmación:', err);
      toastError(err.response?.data?.error || 'Error al enviar confirmación', 'Error');
    } finally {
      setIsEnviandoConfirmacion(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!cotizacion) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-[var(--foreground)]">Cotización no encontrada</h2>
        <Link href="/admin/cotizaciones" className="text-blue-400 hover:text-blue-300 mt-4 inline-block">
          ← Volver a cotizaciones
        </Link>
      </div>
    );
  }

  const isVendida = cotizacion.estado === 'vendida';
  const puedeEditar = cotizacion.estado === 'nueva' || cotizacion.estado === 'enviada';
  const venta = cotizacion.venta;
  const comprobantes = cotizacion.comprobantes_pago || [];
  const pasajeros = cotizacion.pasajeros || [];
  const vuelos = cotizacion.vuelos || [];
  const paquete = cotizacion.paquete;
  const numPasajerosReal = cotizacion.pasajeros?.length || cotizacion.num_pasajeros || 1;
  const imagen = paquete?.imagen_url || paquete?.imagen_principal || datosPaqueteDesdeNotas?.imagen_principal || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800';

  // Datos normalizados para el PDF de cotización
  const pdfData = {
    id: cotizacion.id,
    codigo: cotizacion.codigo,
    fecha_creacion: cotizacion.fecha_creacion,
    fecha_expiracion: cotizacion.fecha_expiracion,
    num_pasajeros: numPasajerosReal,
    tipo_habitacion: cotizacion.tipo_habitacion,
    fecha_salida: cotizacion.fecha_salida || (cotizacion.paquete_data as any)?.fecha_salida || (paquete as any)?.fecha_salida,
    cliente_nombre: cotizacion.cliente_nombre,
    cliente_apellido: cotizacion.cliente?.apellido,
    cliente_documento: cotizacion.cliente?.documento,
    cliente_email: cotizacion.cliente_email,
    cliente_telefono: cotizacion.cliente_telefono,
    precio_total: cotizacion.precio_total,
    tipo_cotizacion: cotizacion.tipo_cotizacion,
    nombre_cotizacion: cotizacion.nombre_cotizacion,
    itinerario_manual: cotizacion.itinerario_manual,
    paquete: {
      titulo: paquete?.titulo || paquete?.nombre || datosPaqueteDesdeNotas?.titulo || cotizacion.nombre_cotizacion || 'Cotización',
      destino: paquete?.destino || datosPaqueteDesdeNotas?.destino || cotizacion.destino_principal || cotizacion.hospedaje?.[0]?.ciudad || cotizacion.hospedajes?.[0]?.ciudad || 'Destino no especificado',
      descripcion: paquete?.descripcion || datosPaqueteDesdeNotas?.descripcion,
      duracion_dias: paquete?.duracion_dias || paquete?.duracion || datosPaqueteDesdeNotas?.duracion_dias || 0,
      imagen_principal: paquete?.imagen_principal || paquete?.imagen_url || datosPaqueteDesdeNotas?.imagen_principal,
      politicas_cancelacion: paquete?.politicas_cancelacion || datosPaqueteDesdeNotas?.politicas_cancelacion,
      itinerario: (() => {
        if (paquete?.itinerario) return paquete.itinerario;
        if (datosPaqueteDesdeNotas?.itinerario) return datosPaqueteDesdeNotas.itinerario;
        if (cotizacion.itinerario_manual) return { texto: cotizacion.itinerario_manual, dias: [] };
        if (cotizacion.itinerario) return cotizacion.itinerario;
        return { texto: '', dias: [] };
      })(),
      incluye: paquete?.incluye || datosPaqueteDesdeNotas?.incluye || cotizacion.incluye || [],
      no_incluye: paquete?.no_incluye || datosPaqueteDesdeNotas?.no_incluye || cotizacion.no_incluye || []
    },
    pasajeros: (() => {
      if (cotizacion.pasajeros && numPasajerosReal > 0) {
        return cotizacion.pasajeros.map((pv: any) => ({
          nombre: pv.nombre_snapshot || pv.pasajero?.nombre || '',
          apellido: pv.apellido_snapshot || pv.pasajero?.apellido || '',
          documento: pv.documento_snapshot || pv.pasajero?.documento || '',
          fecha_nacimiento: pv.pasajero?.fecha_nacimiento || '',
          nacionalidad: pv.pasajero?.nacionalidad || ''
        }));
      }
      const titular = cotizacion.datos_completos?.cliente ? [{
        nombre: cotizacion.datos_completos.cliente.nombre,
        apellido: cotizacion.datos_completos.cliente.apellido,
        documento: cotizacion.datos_completos.cliente.documento,
        fecha_nacimiento: cotizacion.datos_completos.cliente.fecha_nacimiento,
        nacionalidad: cotizacion.datos_completos.cliente.nacionalidad
      }] : [];
      const otros = cotizacion.datos_completos?.pasajeros || [];
      return [...titular, ...otros];
    })(),
    vuelos: (() => {
      if (cotizacion.vuelos && cotizacion.vuelos.length > 0) {
        return cotizacion.vuelos.map((v: any) => ({
          aerolinea_codigo: v.aerolinea_codigo || '',
          aerolinea_nombre: v.aerolinea_nombre || '',
          numero_vuelo: v.numero_vuelo || '',
          clase_codigo: v.clase_codigo || v.clase_nombre || '',
          fecha_salida: v.fecha_salida || '',
          hora_salida: v.hora_salida || '',
          fecha_llegada: v.fecha_llegada || '',
          hora_llegada: v.hora_llegada || '',
          origen_codigo: v.origen_codigo || '',
          origen_ciudad: v.origen_nombre || v.origen_ciudad || '',
          destino_codigo: v.destino_codigo || '',
          destino_ciudad: v.destino_nombre || v.destino_ciudad || ''
        }));
      }
      return paquete?.vuelos || datosPaqueteDesdeNotas?.vuelos || [];
    })(),
    hospedaje: (() => {
      if (cotizacion.hospedajes && cotizacion.hospedajes.length > 0) {
        return cotizacion.hospedajes.map((h: any) => ({
          ...h,
          nombre_alojamiento: h.nombre_alojamiento || h.nombre_hotel,
          tipo_alojamiento: h.tipo_alojamiento || 'Hotel',
        }));
      }
      return cotizacion.hospedaje || datosPaqueteDesdeNotas?.hospedaje || [];
    })(),
    traslados: cotizacion.traslados || [],
    seguros: cotizacion.seguros || [],
    extras: cotizacion.extras || [],
    precios: {
      vuelos: cotizacion.precio_vuelos ?? (cotizacion.paquete_data as any)?.precio_vuelos,
      hospedajes: cotizacion.precio_hospedajes ?? (cotizacion.paquete_data as any)?.precio_hospedajes,
      traslados: cotizacion.precio_traslados ?? (cotizacion.paquete_data as any)?.precio_traslados,
      seguros: cotizacion.precio_seguros ?? (cotizacion.paquete_data as any)?.precio_seguros,
      extras: cotizacion.precio_extras ?? (cotizacion.paquete_data as any)?.precio_extras,
      subtotal: cotizacion.precio_subtotal ?? (cotizacion.paquete_data as any)?.precio_subtotal,
      impuestos: cotizacion.precio_impuestos ?? (cotizacion.paquete_data as any)?.precio_impuestos,
      total: cotizacion.precio_total,
      moneda: cotizacion.precio_moneda || 'USD'
    },
    vendedor: cotizacion.vendedor ? {
      nombre: cotizacion.vendedor.nombre,
      apellido: cotizacion.vendedor.apellido,
      email: cotizacion.vendedor.email,
      telefono: cotizacion.vendedor.telefono
    } : undefined,
    paquete_data: cotizacion.paquete_data
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/admin/cotizaciones" className="p-2 bg-[var(--muted)] rounded-xl hover:bg-[var(--muted)] transition-all">
          <ArrowLeft className="w-5 h-5 text-[var(--muted-foreground)]" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-[var(--foreground)]">Cotización {cotizacion.codigo}</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${getStatusColor(cotizacion.estado)}`}>
              {getStatusLabel(cotizacion.estado)}
            </span>
            {isVendida && venta && (
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20">
                VENTA: {venta.codigo}
              </span>
            )}
          </div>
          <p className="text-[var(--muted-foreground)] text-sm">
            Creada el {new Date(cotizacion.fecha_creacion).toLocaleDateString('es-AR')}
            {cotizacion.fecha_envio && ` • Enviada el ${new Date(cotizacion.fecha_envio).toLocaleDateString('es-AR')}`}
          </p>
        </div>
        <div className="flex gap-2">
          <PDFDownloadButton
            mostrarDesglose={cotizacion.mostrar_desglose_pdf !== false}
            data={pdfData}
          />
          {puedeEditar && (
            <Link 
              href={`/admin/cotizaciones/${cotizacion.id}/editar`}
              className="p-3 bg-[var(--muted)] rounded-xl hover:bg-[var(--border)] transition-all"
              title="Editar"
            >
              <Edit className="w-5 h-5 text-[var(--muted-foreground)]" />
            </Link>
          )}
        </div>

      </div>

      {/* BANNER VENTA - Solo si está vendida */}
      {isVendida && venta && (
        <div className="glass-card rounded-2xl p-6 bg-gradient-to-r from-green-500/10 to-purple-500/10 border-green-500/20">
          <div className="flex flex-wrap items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black text-[var(--foreground)]">¡Venta Confirmada!</h3>
              <p className="text-[var(--muted-foreground)]">
                Venta <strong className="text-green-400">{venta.codigo}</strong> realizada el {' '}
                {new Date(venta.fecha_creacion).toLocaleDateString('es-AR')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl md:text-3xl font-black text-green-400">${formatCurrency(venta.precio_total)}</p>
              <p className="text-sm text-[var(--muted-foreground)]">Monto total</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info del vendedor */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-blue-400" />
              Vendedor
            </h3>
            <div className="p-4 bg-[var(--muted)] rounded-xl">
              <p className="font-medium text-[var(--foreground)]">{cotizacion.vendedor_nombre || 'Vendedor no encontrado'}</p>
              {cotizacion.vendedor?.email && (
                <p className="text-sm text-[var(--muted-foreground)]">{cotizacion.vendedor.email}</p>
              )}
            </div>
          </div>

          {/* PAQUETE / NOMBRE DE COTIZACIÓN */}
          {(paquete || cotizacion.paquete_nombre || cotizacion.nombre_cotizacion || datosPaqueteDesdeNotas) && (
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="relative h-48">
                <img src={imagen} alt={paquete?.nombre || cotizacion.nombre_cotizacion} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-6">
                  <p className="text-xs text-blue-300 uppercase font-black mb-1">
                    {cotizacion.tipo_cotizacion === 'manual' ? 'Cotización Personalizada' : 'Paquete'}
                  </p>
                  <h3 className="text-xl font-black text-[var(--foreground)]">
                    {cotizacion.nombre_cotizacion || paquete?.titulo || paquete?.nombre || datosPaqueteDesdeNotas?.titulo || cotizacion.paquete_nombre || 'Cotización'}
                  </h3>
                  {(paquete?.destino || datosPaqueteDesdeNotas?.destino || cotizacion.destino_principal || cotizacion.hospedaje?.[0]?.ciudad || cotizacion.hospedajes?.[0]?.ciudad) && (
                    <p className="text-[var(--foreground)] text-sm">
                      {paquete?.destino || datosPaqueteDesdeNotas?.destino || cotizacion.destino_principal || cotizacion.hospedaje?.[0]?.ciudad || cotizacion.hospedajes?.[0]?.ciudad}
                    </p>
                  )}
                </div>
              </div>
              <div className="p-6">
                <div className="flex gap-4 mb-4">
                  <div className="px-3 py-1 bg-[var(--background)] rounded-lg">
                    <span className="text-xs text-[var(--muted-foreground)]">DURACIÓN</span>
                    <p className="font-bold text-[var(--foreground)]">{(paquete?.duracion_dias || paquete?.duracion || datosPaqueteDesdeNotas?.duracion_dias || (cotizacion.paquete_data as any)?.duracion_dias || '-')} días</p>
                  </div>
                  {paquete?.noches && (
                    <div className="px-3 py-1 bg-[var(--background)] rounded-lg">
                      <span className="text-xs text-[var(--muted-foreground)]">NOCHES</span>
                      <p className="font-bold text-[var(--foreground)]">{paquete.noches}</p>
                    </div>
                  )}
                </div>
                {(paquete?.descripcion || datosPaqueteDesdeNotas?.descripcion) && (
                  <p className="text-[var(--muted-foreground)] text-sm whitespace-pre-line">
                    {paquete?.descripcion || datosPaqueteDesdeNotas?.descripcion}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Detalles de la cotización */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Detalles de la Cotización
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-[var(--muted)] rounded-xl">
                <p className="text-xs text-[var(--muted-foreground)] uppercase font-black mb-1">Pasajeros</p>
                <p className="text-xl font-black text-[var(--foreground)]">{numPasajerosReal}</p>
              </div>
              <div className="p-4 bg-[var(--muted)] rounded-xl">
                <p className="text-xs text-[var(--muted-foreground)] uppercase font-black mb-1">Habitación</p>
                <p className="text-xl font-black text-[var(--foreground)] capitalize">
                  {cotizacion.tipo_habitacion ||
                   (cotizacion.paquete_data as any)?.hotel_seleccionado?.tipo_habitacion ||
                   'No especificada'}
                </p>
              </div>
              <div className="p-4 bg-[var(--muted)] rounded-xl">
                <p className="text-xs text-[var(--muted-foreground)] uppercase font-black mb-1">Fecha Salida</p>
                <p className="text-lg font-black text-[var(--foreground)]">
                  {(cotizacion.fecha_salida || (cotizacion.paquete_data as any)?.fecha_salida || (paquete as any)?.fecha_salida)
                    ? new Date(cotizacion.fecha_salida || (cotizacion.paquete_data as any)?.fecha_salida || (paquete as any)?.fecha_salida).toLocaleDateString('es-AR')
                    : 'A definir'
                  }
                </p>
              </div>
              <div className="p-4 bg-[var(--muted)] rounded-xl">
                <p className="text-xs text-[var(--muted-foreground)] uppercase font-black mb-1">Total</p>
                <p className="text-xl font-black text-blue-400">${formatCurrency(cotizacion.precio_total)}</p>
              </div>
            </div>
          </div>

          {/* Itinerario - Prioridad: paquete_data > paquete > notas parseadas > manual */}
          {(() => {
            const itin = cotizacion.paquete_data?.itinerario || paquete?.itinerario || datosPaqueteDesdeNotas?.itinerario || cotizacion.itinerario;
            if (!itin && !cotizacion.itinerario_manual) return null;
            return (
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  Itinerario
                </h3>
                {(() => {
                  const itinFinal = itin || { texto: cotizacion.itinerario_manual, dias: [] };
                  if (typeof itinFinal === 'string') {
                    return <p className="text-[var(--foreground)] whitespace-pre-line break-words overflow-hidden">{itinFinal}</p>;
                  }
                  if (itinFinal && typeof itinFinal === 'object' && !Array.isArray(itinFinal) && 'texto' in itinFinal) {
                    const itinObj = itinFinal as { texto?: string; dias?: any[] };
                    return (
                      <div className="space-y-4">
                        {itinObj.texto && (
                          <p className="text-[var(--foreground)] whitespace-pre-line break-words overflow-hidden">{itinObj.texto}</p>
                        )}
                        {Array.isArray(itinObj.dias) && itinObj.dias.length > 0 && (
                          <div className="space-y-3">
                            {itinObj.dias.map((dia: any, idx: number) => (
                              <div key={idx} className="p-4 bg-[var(--muted)] rounded-xl border-l-2 border-blue-500">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-bold">
                                    Día {dia.dia || idx + 1}
                                  </span>
                                  <span className="font-medium text-[var(--foreground)]">{dia.titulo}</span>
                                </div>
                                <p className="text-[var(--foreground)] text-sm break-words overflow-hidden">{dia.descripcion}</p>
                                {dia.actividades && dia.actividades.length > 0 && (
                                  <ul className="mt-2 space-y-1">
                                    {dia.actividades.map((act: string, actIdx: number) => (
                                      <li key={actIdx} className="text-[var(--muted-foreground)] text-sm break-words overflow-hidden">• {act}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }
                  if (Array.isArray(itinFinal) && itinFinal.length > 0) {
                    return (
                      <div className="space-y-3">
                        {itinFinal.map((dia: any, idx: number) => (
                          <div key={idx} className="p-4 bg-[var(--muted)] rounded-xl border-l-2 border-blue-500">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-bold">
                                Día {dia.dia || idx + 1}
                              </span>
                              <span className="font-medium text-[var(--foreground)]">{dia.titulo}</span>
                            </div>
                            <p className="text-[var(--foreground)] text-sm break-words overflow-hidden">{dia.descripcion}</p>
                            {dia.actividades && dia.actividades.length > 0 && (
                              <ul className="mt-2 space-y-1">
                                {dia.actividades.map((act: string, actIdx: number) => (
                                  <li key={actIdx} className="text-[var(--muted-foreground)] text-sm break-words overflow-hidden">• {act}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            );
          })()}

          {/* Vuelos - Cotizaciones de catálogo (desde paquete) */}
          {cotizacion.tipo_cotizacion !== 'manual' && (paquete?.vuelos?.length || datosPaqueteDesdeNotas?.vuelos?.length) && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <Plane className="w-5 h-5 text-blue-400" />
                Vuelos del Paquete
              </h3>
              <div className="space-y-3">
                {(paquete?.vuelos || datosPaqueteDesdeNotas?.vuelos || []).map((vuelo: any, idx: number) => (
                  <div key={idx} className="p-4 bg-[var(--muted)] rounded-xl border border-[var(--border)]">
                    <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-bold uppercase">
                        {vuelo.tipo === 'ida' ? 'Vuelo de Ida' : 'Vuelo de Vuelta'}
                      </span>
                      {vuelo.numero_vuelo && (
                        <span className="text-sm text-[var(--muted-foreground)]">{vuelo.numero_vuelo}</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-[var(--muted-foreground)] text-xs">Origen</p>
                        <p className="text-[var(--foreground)] font-medium">{vuelo.origen_nombre || vuelo.origen_codigo || '-'}</p>
                      </div>
                      <div>
                        <p className="text-[var(--muted-foreground)] text-xs">Destino</p>
                        <p className="text-[var(--foreground)] font-medium">{vuelo.destino_nombre || vuelo.destino_codigo || '-'}</p>
                      </div>
                      <div>
                        <p className="text-[var(--muted-foreground)] text-xs">Fecha</p>
                        <p className="text-[var(--foreground)]">{vuelo.fecha_salida || '-'}</p>
                      </div>
                      <div>
                        <p className="text-[var(--muted-foreground)] text-xs">Horario</p>
                        <p className="text-[var(--foreground)]">{vuelo.hora_salida || '--:--'} - {vuelo.hora_llegada || '--:--'}</p>
                      </div>
                    </div>
                    {(vuelo.aerolinea_nombre || vuelo.clase) && (
                      <div className="grid grid-cols-2 gap-4 text-sm mt-2 pt-2 border-t border-[var(--border)]">
                        {vuelo.aerolinea_nombre && (
                          <div>
                            <p className="text-[var(--muted-foreground)] text-xs">Aerolínea</p>
                            <p className="text-[var(--foreground)]">{vuelo.aerolinea_nombre}</p>
                          </div>
                        )}
                        {vuelo.clase && (
                          <div>
                            <p className="text-[var(--muted-foreground)] text-xs">Clase</p>
                            <p className="text-[var(--foreground)]">{vuelo.clase}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Incluye / No incluye */}
          {(cotizacion.paquete_data?.incluye?.length || cotizacion.paquete_data?.no_incluye?.length ||
            paquete?.incluye?.length || paquete?.no_incluye?.length ||
            datosPaqueteDesdeNotas?.incluye?.length || datosPaqueteDesdeNotas?.no_incluye?.length ||
            cotizacion.incluye?.length || cotizacion.no_incluye?.length) && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-400" />
                Detalles del Servicio
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(cotizacion.paquete_data?.incluye?.length || paquete?.incluye?.length || datosPaqueteDesdeNotas?.incluye?.length || cotizacion.incluye?.length) && (
                  <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                    <p className="text-green-400 font-bold mb-2">Incluye</p>
                    <ul className="space-y-1">
                      {(cotizacion.paquete_data?.incluye || paquete?.incluye || datosPaqueteDesdeNotas?.incluye || cotizacion.incluye || []).map((item: string, idx: number) => (
                        <li key={idx} className="text-[var(--foreground)] text-sm">+ {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {(cotizacion.paquete_data?.no_incluye?.length || paquete?.no_incluye?.length || datosPaqueteDesdeNotas?.no_incluye?.length || cotizacion.no_incluye?.length) && (
                  <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                    <p className="text-red-400 font-bold mb-2">No incluye</p>
                    <ul className="space-y-1">
                      {(cotizacion.paquete_data?.no_incluye || paquete?.no_incluye || datosPaqueteDesdeNotas?.no_incluye || cotizacion.no_incluye || []).map((item: string, idx: number) => (
                        <li key={idx} className="text-[var(--foreground)] text-sm">- {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Datos del cliente - COMPLETOS */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              Datos del Cliente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre completo */}
              <div className="flex items-center gap-3 p-4 bg-[var(--muted)] rounded-xl min-w-0">
                <User className="w-5 h-5 text-[var(--muted-foreground)] shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-[var(--muted-foreground)] uppercase">Nombre Completo</p>
                  <p className="font-medium text-[var(--foreground)] break-words">
                    {cotizacion.cliente?.apellido 
                      ? `${cotizacion.cliente.nombre} ${cotizacion.cliente.apellido}`
                      : cotizacion.cliente_nombre}
                  </p>
                </div>
              </div>
              
              {/* Documento */}
              {cotizacion.cliente?.documento && (
                <div className="flex items-center gap-3 p-4 bg-[var(--muted)] rounded-xl">
                  <FileText className="w-5 h-5 text-[var(--muted-foreground)]" />
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)] uppercase">Documento</p>
                    <p className="font-medium text-[var(--foreground)]">{cotizacion.cliente.documento}</p>
                  </div>
                </div>
              )}
              
              {/* Email */}
              <div className="flex items-center gap-3 p-4 bg-[var(--muted)] rounded-xl min-w-0">
                <Mail className="w-5 h-5 text-[var(--muted-foreground)] shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-[var(--muted-foreground)] uppercase">Email</p>
                  <p className="font-medium text-[var(--foreground)] break-all">
                    {cotizacion.cliente?.email || cotizacion.cliente_email || '-'}
                  </p>
                </div>
              </div>
              
              {/* Teléfono */}
              <div className="flex items-center gap-3 p-4 bg-[var(--muted)] rounded-xl">
                <Phone className="w-5 h-5 text-[var(--muted-foreground)]" />
                <div>
                  <p className="text-xs text-[var(--muted-foreground)] uppercase">Teléfono</p>
                  <p className="font-medium text-[var(--foreground)]">
                    {cotizacion.cliente?.telefono || cotizacion.cliente_telefono || '-'}
                  </p>
                </div>
              </div>
              
              {/* Fecha de nacimiento */}
              {cotizacion.cliente?.fecha_nacimiento && (
                <div className="flex items-center gap-3 p-4 bg-[var(--muted)] rounded-xl">
                  <Calendar className="w-5 h-5 text-[var(--muted-foreground)]" />
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)] uppercase">Fecha de Nacimiento</p>
                    <p className="font-medium text-[var(--foreground)]">
                      {new Date(cotizacion.cliente.fecha_nacimiento).toLocaleDateString('es-AR')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* LISTA DE PASAJEROS */}
          {pasajeros.length > 0 && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Pasajeros ({pasajeros.length})
              </h3>
              <div className="space-y-3">
                {pasajeros.map((p, idx) => (
                  <div key={p.id || idx} className="p-4 bg-[var(--muted)] rounded-xl">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                          <span className="text-blue-400 font-bold">{idx + 1}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-[var(--foreground)] break-words">
                            {p.nombre_snapshot} {p.apellido_snapshot}
                            {p.es_titular && <span className="ml-2 px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">Titular</span>}
                          </p>
                          <p className="text-sm text-[var(--muted-foreground)]">{p.documento_snapshot}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-[var(--background)] rounded-full text-sm text-[var(--muted-foreground)] capitalize">
                        {p.tipo_habitacion?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VUELOS (nuevo schema / manual) */}
          {vuelos.length > 0 && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <Plane className="w-5 h-5 text-blue-400" />
                Vuelos ({vuelos.length})
              </h3>
              <div className="space-y-3">
                {vuelos.map((v, idx) => (
                  <div key={v.id || idx} className="p-4 bg-[var(--muted)] rounded-xl border border-[var(--border)]">
                    <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
                      <span className="text-[var(--foreground)] font-bold">
                        {v.origen_ciudad || v.origen_nombre || '?'} → {v.destino_ciudad || v.destino_nombre || '?'}
                      </span>
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-bold">
                        {v.aerolinea_nombre || v.aerolinea_codigo || 'AV'} {v.numero_vuelo}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-[var(--muted-foreground)] text-xs">Origen</p>
                        <p className="text-[var(--foreground)] font-medium">{v.origen_ciudad || v.origen_nombre || '-'}</p>
                      </div>
                      <div>
                        <p className="text-[var(--muted-foreground)] text-xs">Destino</p>
                        <p className="text-[var(--foreground)] font-medium">{v.destino_ciudad || v.destino_nombre || '-'}</p>
                      </div>
                      <div>
                        <p className="text-[var(--muted-foreground)] text-xs">Fecha</p>
                        <p className="text-[var(--foreground)]">{v.fecha_salida ? new Date(v.fecha_salida).toLocaleDateString('es-AR') : '-'}</p>
                      </div>
                      <div>
                        <p className="text-[var(--muted-foreground)] text-xs">Horario</p>
                        <p className="text-[var(--foreground)]">{v.hora_salida || '--:--'} - {v.hora_llegada || '--:--'}</p>
                      </div>
                    </div>
                    {(v.aerolinea_nombre || v.clase_codigo) && (
                      <div className="grid grid-cols-2 gap-4 text-sm mt-2 pt-2 border-t border-[var(--border)]">
                        {v.aerolinea_nombre && (
                          <div>
                            <p className="text-[var(--muted-foreground)] text-xs">Aerolínea</p>
                            <p className="text-[var(--foreground)]">{v.aerolinea_nombre}</p>
                          </div>
                        )}
                        {v.clase_codigo && (
                          <div>
                            <p className="text-[var(--muted-foreground)] text-xs">Clase</p>
                            <p className="text-[var(--foreground)]">{v.clase_codigo}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HOSSEDajes (nuevo schema o legacy) */}
          {(cotizacion.hospedajes?.length || cotizacion.hospedaje?.length) && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-blue-400" />
                Hospedaje
              </h3>
              <div className="space-y-3">
                {(cotizacion.hospedajes || cotizacion.hospedaje || []).map((hotel: any, idx: number) => (
                  <div key={hotel.id || idx} className="p-4 bg-[var(--muted)] rounded-xl border border-[var(--border)]">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-[var(--foreground)] font-bold">{hotel.nombre_alojamiento || hotel.nombre_hotel || hotel.nombre}</p>
                        <p className="text-[var(--muted-foreground)] text-sm">{hotel.ciudad || hotel.ubicacion}</p>
                      </div>
                      {hotel.link_hotel && (
                        <a
                          href={hotel.link_hotel}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-500/30 transition-colors"
                        >
                          Ver Hotel
                        </a>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3">
                      <div>
                        <p className="text-[var(--muted-foreground)] text-xs">Check-in</p>
                        <p className="text-[var(--foreground)]">{hotel.fecha_checkin || hotel.check_in || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[var(--muted-foreground)] text-xs">Check-out</p>
                        <p className="text-[var(--foreground)]">{hotel.fecha_checkout || hotel.check_out || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[var(--muted-foreground)] text-xs">Habitación</p>
                        <p className="text-[var(--foreground)]">{hotel.tipo_habitacion || hotel.tipo_alojamiento || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[var(--muted-foreground)] text-xs">Régimen</p>
                        <p className="text-[var(--foreground)] capitalize">{hotel.regimen?.replace('_', ' ') || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TRASLADOS */}
          {cotizacion.traslados && cotizacion.traslados.length > 0 && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <Bus className="w-5 h-5 text-blue-400" />
                Traslados
              </h3>
              <div className="space-y-3">
                {cotizacion.traslados.map((t: any, idx: number) => (
                  <div key={t.id || idx} className="p-4 bg-[var(--muted)] rounded-xl border border-[var(--border)]">
                    <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
                      <span className="text-[var(--foreground)] font-bold">{t.nombre || t.tipo || 'Traslado'}</span>
                      {t.precio_por_persona > 0 && (
                        <span className="text-sm text-blue-400">${formatCurrency(t.precio_por_persona)} por persona</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-[var(--muted-foreground)] text-xs">Origen</p>
                        <p className="text-[var(--foreground)]">{t.origen || '-'}</p>
                      </div>
                      <div>
                        <p className="text-[var(--muted-foreground)] text-xs">Destino</p>
                        <p className="text-[var(--foreground)]">{t.destino || '-'}</p>
                      </div>
                      <div>
                        <p className="text-[var(--muted-foreground)] text-xs">Fecha</p>
                        <p className="text-[var(--foreground)]">{t.fecha || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[var(--muted-foreground)] text-xs">Hora</p>
                        <p className="text-[var(--foreground)]">{t.hora || 'N/A'}</p>
                      </div>
                    </div>
                    {t.notas && (
                      <p className="text-[var(--muted-foreground)] text-sm mt-2 pt-2 border-t border-[var(--border)]">{t.notas}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEGUROS */}
          {cotizacion.seguros && cotizacion.seguros.length > 0 && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                Seguros
              </h3>
              <div className="space-y-3">
                {cotizacion.seguros.map((s: any, idx: number) => (
                  <div key={s.id || idx} className="p-4 bg-[var(--muted)] rounded-xl border border-[var(--border)]">
                    <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
                      <span className="text-[var(--foreground)] font-bold">{s.compania || s.compañia || 'Seguro'}</span>
                      {s.precio_por_persona > 0 && (
                        <span className="text-sm text-blue-400">${formatCurrency(s.precio_por_persona)} por persona</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-[var(--muted-foreground)] text-xs">Cobertura</p>
                        <p className="text-[var(--foreground)]">{s.tipo_cobertura || s.cobertura || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[var(--muted-foreground)] text-xs">Detalle</p>
                        <p className="text-[var(--foreground)]">{s.cobertura_detalle || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[var(--muted-foreground)] text-xs">Inicio</p>
                        <p className="text-[var(--foreground)]">{s.fecha_inicio || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[var(--muted-foreground)] text-xs">Fin</p>
                        <p className="text-[var(--foreground)]">{s.fecha_fin || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EXTRAS */}
          {cotizacion.extras && cotizacion.extras.length > 0 && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                Extras
              </h3>
              <div className="space-y-3">
                {cotizacion.extras.map((e: any, idx: number) => (
                  <div key={e.id || idx} className="p-4 bg-[var(--muted)] rounded-xl border border-[var(--border)]">
                    <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
                      <span className="text-[var(--foreground)] font-bold">{e.nombre || 'Extra'}</span>
                      {e.precio_por_persona > 0 && (
                        <span className="text-sm text-blue-400">${formatCurrency(e.precio_por_persona)} por persona</span>
                      )}
                    </div>
                    {e.descripcion && (
                      <p className="text-[var(--muted-foreground)] text-sm">{e.descripcion}</p>
                    )}
                    <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                      <div>
                        <p className="text-[var(--muted-foreground)] text-xs">Fecha</p>
                        <p className="text-[var(--foreground)]">{e.fecha || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[var(--muted-foreground)] text-xs">Tipo</p>
                        <p className="text-[var(--foreground)] capitalize">{e.tipo || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DATOS DE PAGO (solo si está vendida) */}
          {isVendida && venta && (
            <div className="space-y-4">
              <HistorialPagos
                precioTotal={cotizacion.precio_total}
                montoPagado={cotizacion.monto_pagado || 0}
                montoRestante={cotizacion.monto_restante || Math.max(0, cotizacion.precio_total - (cotizacion.monto_pagado || 0))}
                tipoPago={cotizacion.tipo_pago}
                pagos={cotizacion.pagos || []}
              />

              {cotizacion.tipo_pago !== 'total' && (cotizacion.monto_restante || Math.max(0, cotizacion.precio_total - (cotizacion.monto_pagado || 0))) > 0 && (
                <button
                  onClick={() => setShowPagoModal(true)}
                  className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl transition-colors"
                >
                  Registrar pago adicional
                </button>
              )}

              {venta.observaciones_pago_heredado && (
                <div className="glass-card rounded-2xl p-6 border-green-500/20">
                  <p className="text-xs text-[var(--muted-foreground)] uppercase mb-1">Observaciones originales de Pago</p>
                  <p className="text-[var(--foreground)]">{venta.observaciones_pago_heredado}</p>
                </div>
              )}
            </div>
          )}

          {/* COMPROBANTES DE PAGO */}
          {comprobantes.length > 0 && (
            <div className="glass-card rounded-2xl p-6 border-blue-500/20">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-400" />
                Comprobantes de Pago ({comprobantes.length})
              </h3>
              <div className="space-y-3">
                {comprobantes.map((comp) => (
                  <div key={comp.id} className="p-4 bg-[var(--muted)] rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <FileDown className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--foreground)] truncate max-w-[300px]">
                            {comp.nombre_archivo}
                          </p>
                          <p className="text-xs text-[var(--muted-foreground)]">Comprobante de pago</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDownloadComprobante(comp.id, comp.nombre_archivo, comp.ruta_archivo || comp.url)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 transition-all"
                      >
                        <Download className="w-4 h-4" />
                        Descargar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VOUCHERS DE VIAJE - Solo admin puede subir */}
          {isVendida && venta && (
            <div className="glass-card rounded-2xl p-6 border-purple-500/20">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" />
                Vouchers de Viaje ({vouchers.length})
              </h3>
              
              {/* Lista de vouchers */}
              {isLoadingVouchers ? (
                <div className="flex justify-center py-4">
                  <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : vouchers.length > 0 ? (
                <div className="space-y-3 mb-6">
                  {vouchers.map((v) => (
                    <div key={v.id} className="p-4 bg-[var(--muted)] rounded-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <FileDown className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <p className="font-medium text-[var(--foreground)] truncate max-w-[200px]">
                              {v.nombre_archivo}
                            </p>
                            <p className="text-xs text-[var(--muted-foreground)] capitalize">
                              {v.tipo_documento === 'vuelo' && '✈️ Vuelo'}
                              {v.tipo_documento === 'hotel' && '🏨 Hotel'}
                              {v.tipo_documento === 'seguro' && '🛡️ Seguro'}
                              {v.tipo_documento === 'otro' && '📄 Otro'}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDownloadVoucher(v.id, v.nombre_archivo)}
                            className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl flex items-center gap-2 transition-all"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteVoucher(v.id)}
                            className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-xl flex items-center gap-2 transition-all"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-[var(--muted)] rounded-xl text-center mb-6">
                  <p className="text-[var(--muted-foreground)] text-sm">
                    No hay vouchers subidos aún
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                    Sube los vouchers de vuelo, hotel, etc.
                  </p>
                </div>
              )}

              {vouchers.length > 0 && cotizacion?.cliente_email && (
                <button
                  onClick={handleEnviarConfirmacion}
                  disabled={isEnviandoConfirmacion}
                  className="w-full mb-6 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isEnviandoConfirmacion ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                  Enviar confirmación al cliente
                </button>
              )}

              {/* Formulario subir nuevo voucher */}
              <div className="border-t border-[var(--border)] pt-4">
                <h4 className="text-sm font-medium text-[var(--foreground)] mb-3">Subir nuevo voucher</h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={tipoVoucher}
                    onChange={(e) => setTipoVoucher(e.target.value as any)}
                    className="bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-purple-500"
                  >
                    <option value="boleto_aereo">✈️ Vuelo</option>
                    <option value="voucher_hotel">🏨 Hotel</option>
                    <option value="voucher_actividad">🎯 Actividad</option>
                    <option value="seguro">🛡️ Seguro</option>
                    <option value="itinerario_final">📋 Itinerario</option>
                    <option value="e_ticket">🎫 E-Ticket</option>
                    <option value="boarding_pass">🛂 Boarding Pass</option>
                    <option value="otro">📄 Otro</option>
                  </select>
                  <div className="flex-1">
                    <label className="flex items-center justify-center w-full h-12 px-4 bg-[var(--muted)] border border-[var(--border)] border-dashed rounded-xl cursor-pointer hover:bg-[var(--muted)]/80 transition-all">
                      <span className="text-sm text-[var(--muted-foreground)]">
                        {isUploadingVoucher ? 'Subiendo...' : 'Seleccionar archivo (PDF, JPG, PNG)'}
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleVoucherUpload}
                        disabled={isUploadingVoucher}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-2">
                  Al subir un voucher, el estado de la venta cambiará a "Emitida"
                </p>
              </div>
            </div>
          )}

          {/* Notas */}
          {cotizacion.notas && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">Notas del Vendedor</h3>
              <p className="text-[var(--muted-foreground)] whitespace-pre-wrap">{cotizacion.notas}</p>
            </div>
          )}
        </div>

        {/* Columna derecha - Acciones */}
        <div className="space-y-6">
          {/* Resumen */}
          <div className="glass-card rounded-2xl p-6 sticky top-6">
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">Resumen Financiero</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">Precio por persona</span>
                <span className="text-[var(--foreground)]">
                  ${formatCurrency(Math.round(cotizacion.precio_total / cotizacion.num_pasajeros))}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">Pasajeros</span>
                <span className="text-[var(--foreground)]">{cotizacion.num_pasajeros}</span>
              </div>
              <div className="h-px bg-[var(--muted)] my-3" />
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-[var(--foreground)]">Total</span>
                <span className="text-2xl font-black text-blue-400">${formatCurrency(cotizacion.precio_total)}</span>
              </div>
              {comisionesEnabled && cotizacion.comision_vendedor && (
                <div className="flex justify-between text-sm pt-2">
                  <span className="text-[var(--muted-foreground)]">Comisión vendedor</span>
                  <span className="text-green-400 font-medium">${formatCurrency(cotizacion.comision_vendedor)}</span>
                </div>
              )}
            </div>

            {cotizacion.estado === 'nueva' && (
              <div className="space-y-3">
                <button
                  onClick={() => setShowAprobarModal(true)}
                  className="w-full py-4 bg-green-600 hover:bg-green-700 text-[var(--foreground)] font-black rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Aprobar Cotización
                </button>
                <button
                  onClick={() => setShowRechazarModal(true)}
                  className="w-full py-4 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-black rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Rechazar
                </button>
              </div>
            )}

            {cotizacion.estado === 'vendida' && venta && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <div className="text-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-green-400 font-medium">Cotización vendida</p>
                  <p className="text-[var(--muted-foreground)] text-sm mt-1">
                    Venta {venta.codigo}
                  </p>
                  {comisionesEnabled && (
                    venta.comision_estado === 'pagada' ? (
                      <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Comisión pagada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
                        <AlertCircle className="w-3 h-3" />
                        Comisión pendiente
                      </span>
                    )
                  )}
                </div>
                
                {comisionesEnabled && venta.comision_estado !== 'pagada' && (
                  <button
                    onClick={() => setShowPagarComision(true)}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <DollarSign className="w-5 h-5" />
                    Marcar Comisión Pagada
                  </button>
                )}
              </div>
            )}

            {cotizacion.estado === 'enviada' && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center">
                <AlertCircle className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-blue-400 font-medium">Cotización enviada</p>
                <p className="text-[var(--muted-foreground)] text-sm mt-1">
                  Esperando respuesta del cliente
                </p>
              </div>
            )}

            {cotizacion.estado === 'perdida' && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="text-red-400 font-medium">Cotización perdida</p>
              </div>
            )}

            {/* Notas internas */}
            {cotizacion.notas_internas && (
              <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <h4 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Notas internas
                </h4>
                <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap">
                  {cotizacion.notas_internas}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Aprobar */}
      {showAprobarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 md:p-8">
            <h3 className="text-2xl font-black text-[var(--foreground)] mb-4">Aprobar Cotización</h3>
            <p className="text-[var(--muted-foreground)] mb-6">
              ¿Estás seguro de aprobar esta cotización? El vendedor podrá enviarla al cliente.
            </p>
            <div className="mb-4">
              <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Notas (opcional)</label>
              <textarea
                rows={3}
                value={notasAdmin}
                onChange={(e) => setNotasAdmin(e.target.value)}
                className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500 resize-none"
                placeholder="Observaciones para el vendedor..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAprobarModal(false)}
                className="flex-1 py-3 rounded-xl bg-[var(--muted)] hover:bg-[var(--muted)] text-[var(--foreground)] font-medium transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleAprobar}
                className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-[var(--foreground)] font-bold transition-all"
              >
                Aprobar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Rechazar */}
      {showRechazarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 md:p-8">
            <h3 className="text-2xl font-black text-[var(--foreground)] mb-4">Rechazar Cotización</h3>
            <p className="text-[var(--muted-foreground)] mb-6">
              ¿Estás seguro de rechazar esta cotización? Esta acción no se puede deshacer.
            </p>
            <div className="mb-4">
              <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Motivo del rechazo *</label>
              <textarea
                rows={3}
                value={notasAdmin}
                onChange={(e) => setNotasAdmin(e.target.value)}
                className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500 resize-none"
                placeholder="Indica el motivo del rechazo..."
                required
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRechazarModal(false)}
                className="flex-1 py-3 rounded-xl bg-[var(--muted)] hover:bg-[var(--muted)] text-[var(--foreground)] font-medium transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleRechazar}
                disabled={!notasAdmin}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-[var(--foreground)] font-bold transition-all"
              >
                Rechazar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pagar Comisión */}
      {comisionesEnabled && showPagarComision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-md rounded-3xl p-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-black text-[var(--foreground)] mb-4">Pagar Comisión</h3>
            
            {/* Info de la comisión */}
            <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl mb-6">
              <p className="text-sm text-[var(--muted-foreground)]">Monto de comisión:</p>
              <p className="text-2xl font-black text-purple-400">
                ${venta?.comision_monto ? formatCurrency(venta.comision_monto) : '-'}
              </p>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                Vendedor: {cotizacion?.vendedor_nombre || '-'}
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">
                Venta: {venta?.codigo || '-'}
              </p>
            </div>

            {/* Formulario de pago */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Método de pago *
                </label>
                <select
                  value={metodoPagoComision}
                  onChange={(e) => setMetodoPagoComision(e.target.value)}
                  className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-purple-500"
                >
                  <option value="transferencia">Transferencia bancaria</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="cheque">Cheque</option>
                  <option value="mercadopago">MercadoPago</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Referencia de pago
                </label>
                <input
                  type="text"
                  value={referenciaPagoComision}
                  onChange={(e) => setReferenciaPagoComision(e.target.value)}
                  placeholder="Ej: Transferencia #12345"
                  className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Notas adicionales
                </label>
                <textarea
                  value={notasPagoComision}
                  onChange={(e) => setNotasPagoComision(e.target.value)}
                  placeholder="Notas sobre el pago..."
                  rows={3}
                  className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-purple-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPagarComision(false)}
                className="flex-1 py-3 rounded-xl bg-[var(--muted)] hover:bg-[var(--muted)] text-[var(--foreground)] font-medium transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handlePagarComision}
                className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all"
              >
                Confirmar Pago
              </button>
            </div>
          </div>
        </div>
      )}

      {showPagoModal && venta && (
        <AgregarPagoModal
          ventaId={venta.id}
          cotizacionId={cotizacion?.id || ''}
          montoRestante={Math.max(0, (cotizacion?.precio_total || 0) - (cotizacion?.monto_pagado || 0))}
          onClose={() => setShowPagoModal(false)}
          onSuccess={() => {
            setShowPagoModal(false);
            window.location.reload();
          }}
        />
      )}

      {/* Modal Comisión al subir voucher */}
      {showComisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-md rounded-3xl p-6 md:p-8">
            <h3 className="text-xl font-black text-[var(--foreground)] mb-4">
              Asignar comisión del vendedor
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              Define el monto fijo en USD que recibirá el vendedor por esta venta.
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[var(--muted-foreground)] mb-1 block">
                  Comisión (USD)
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={comisionMontoInput}
                  onChange={(e) => setComisionMontoInput(e.target.value)}
                  className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-purple-500"
                  placeholder="Ej: 50"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowComisionModal(false);
                    setPendingVoucherFile(null);
                  }}
                  className="flex-1 py-3 rounded-xl bg-[var(--muted)] hover:bg-[var(--muted)] text-[var(--foreground)] font-medium transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmVoucherUpload}
                  disabled={isUploadingVoucher}
                  className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all disabled:opacity-50"
                >
                  {isUploadingVoucher ? 'Subiendo...' : 'Confirmar y subir'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
