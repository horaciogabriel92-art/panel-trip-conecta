"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
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
  Printer,
  ArrowRight,
  UserCircle,
  CreditCard,
  Download,
  Receipt,
  Plane,
  Hotel,
  MapPin,
  FileDown,
  Wallet
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
  destino_ciudad?: string;
  fecha_salida?: string;
  aerolinea_nombre?: string;
  numero_vuelo?: string;
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
  estado: 'nueva' | 'enviada' | 'vendida' | 'perdida';
  notas?: string;
  fecha_creacion: string;
  fecha_expiracion?: string;
  fecha_envio?: string;
  fecha_venta?: string;
  // Campos de pago
  monto_pagado?: number;
  monto_restante?: number;
  fecha_pago_resto?: string;
  tipo_pago?: string;
  // Relaciones enriquecidas
  pasajeros?: Pasajero[];
  vuelos?: Vuelo[];
  paquete?: Paquete;
  venta?: Venta;
  comprobantes_pago?: Comprobante[];
  vouchers?: Voucher[];
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
  descripcion?: string;
  duracion?: number;
  noches?: number;
  categoria?: string;
  regimen?: string;
  itinerario?: { texto?: string; dias?: any[] } | any[] | string;
}

export default function AdminCotizacionDetalle() {
  const { success: toastSuccess, error: toastError } = useToast();
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

  useEffect(() => {
    const fetchCotizacion = async () => {
      try {
        const res = await api.get(`/cotizaciones/${params.id}`);
        console.log('[Admin Cotizacion] Data recibida:', res.data);
        setCotizacion(res.data);
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
      console.log('[Download] Descargando comprobante:', { comprobanteId, filename, rutaArchivo });
      
      let downloadUrl: string;
      
      // Si el ID empieza con 'comp_' es un comprobante legacy del JSON
      // Usar endpoint de descarga por nombre de archivo
      if (comprobanteId.startsWith('comp_') && rutaArchivo) {
        // Extraer solo el nombre del archivo (sin la ruta)
        const filenameFromPath = rutaArchivo.split('/').pop() || filename;
        console.log('[Download] Filename from path:', filenameFromPath);
        downloadUrl = `/upload/comprobante-pago/download-by-filename/${filenameFromPath}`;
      } else {
        // Comprobante de la tabla comprobantes_pago con ID real
        downloadUrl = `/upload/comprobante-pago/${comprobanteId}/download`;
      }
      
      console.log('[Download] URL:', downloadUrl);
      
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
    
    setIsUploadingVoucher(true);
    try {
      const formData = new FormData();
      formData.append('voucher', file);
      formData.append('tipo_documento', tipoVoucher);
      
      await api.post(`/upload/voucher/${cotizacion.venta.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Recargar vouchers
      const res = await api.get(`/upload/vouchers/${cotizacion.venta.id}`);
      setVouchers(res.data);
      
      toastSuccess('Voucher subido exitosamente', 'Subida OK');
    } catch (err: any) {
      console.error('Error subiendo voucher:', err);
      toastError(err.response?.data?.error || 'Error al subir voucher', 'Error');
    } finally {
      setIsUploadingVoucher(false);
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
  const venta = cotizacion.venta;
  const comprobantes = cotizacion.comprobantes_pago || [];
  const pasajeros = cotizacion.pasajeros || [];
  const vuelos = cotizacion.vuelos || [];
  const paquete = cotizacion.paquete;

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
          <button 
            onClick={() => window.print()}
            className="p-3 bg-[var(--muted)] rounded-xl hover:bg-[var(--muted)] transition-all"
          >
            <Printer className="w-5 h-5 text-[var(--muted-foreground)]" />
          </button>
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

          {/* DATOS DEL PAQUETE */}
          {(paquete || cotizacion.paquete_nombre) && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-400" />
                Paquete: {paquete?.titulo || paquete?.nombre || cotizacion.paquete_nombre || 'No especificado'}
              </h3>
              {paquete && (
                <div className="p-4 bg-[var(--muted)] rounded-xl">
                  <div className="flex gap-4">
                    <div className="px-3 py-1 bg-[var(--background)] rounded-lg">
                      <span className="text-xs text-[var(--muted-foreground)]">DURACIÓN</span>
                      <p className="font-bold text-[var(--foreground)]">{paquete.duracion || '-'} días</p>
                    </div>
                    {paquete.noches && (
                      <div className="px-3 py-1 bg-[var(--background)] rounded-lg">
                        <span className="text-xs text-[var(--muted-foreground)]">NOCHES</span>
                        <p className="font-bold text-[var(--foreground)]">{paquete.noches}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
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

          {/* VUELOS */}
          {vuelos.length > 0 && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <Plane className="w-5 h-5 text-blue-400" />
                Vuelos
              </h3>
              <div className="space-y-3">
                {vuelos.map((v, idx) => (
                  <div key={v.id || idx} className="p-4 bg-[var(--muted)] rounded-xl">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="text-center min-w-0">
                          <p className="text-lg font-black text-[var(--foreground)] break-words">{v.origen_ciudad || '?'}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">Origen</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-blue-400" />
                        <div className="text-center min-w-0">
                          <p className="text-lg font-black text-[var(--foreground)] break-words">{v.destino_ciudad || '?'}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">Destino</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-[var(--foreground)]">{v.aerolinea_nombre || 'Aerolínea'}</p>
                        {v.fecha_salida && (
                          <p className="text-sm text-[var(--muted-foreground)]">
                            {new Date(v.fecha_salida).toLocaleDateString('es-AR')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DATOS DE PAGO (solo si está vendida) */}
          {isVendida && venta && (
            <div className="glass-card rounded-2xl p-6 border-green-500/20">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-green-400" />
                Información de Pago
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-[var(--muted)] rounded-xl">
                  <p className="text-xs text-[var(--muted-foreground)] uppercase mb-1">Estado del Pago</p>
                  <div className="flex items-center gap-2">
                    {getPagoBadge(venta.tipo_pago_heredado)}
                  </div>
                </div>
                {venta.monto_pagado_heredado && (
                  <div className="p-4 bg-[var(--muted)] rounded-xl">
                    <p className="text-xs text-[var(--muted-foreground)] uppercase mb-1">Monto Pagado</p>
                    <p className="text-xl font-black text-green-400">${formatCurrency(venta.monto_pagado_heredado)}</p>
                  </div>
                )}
                {/* NUEVO: Monto Restante */}
                {(() => {
                  const montoRestante = Math.max(0, (cotizacion?.precio_total || 0) - (venta?.monto_pagado_heredado || 0));
                  return montoRestante > 0 ? (
                    <div className="p-4 bg-[var(--muted)] rounded-xl border border-orange-500/20">
                      <p className="text-xs text-[var(--muted-foreground)] uppercase mb-1">Monto Restante</p>
                      <p className="text-xl font-black text-orange-400">${formatCurrency(montoRestante)}</p>
                    </div>
                  ) : (
                    <div className="p-4 bg-[var(--muted)] rounded-xl border border-green-500/20">
                      <p className="text-xs text-[var(--muted-foreground)] uppercase mb-1">Monto Restante</p>
                      <p className="text-xl font-black text-green-400">$0</p>
                      <p className="text-xs text-green-400 mt-1">Pago completo</p>
                    </div>
                  );
                })()}
                {venta.medio_pago_heredado && (
                  <div className="p-4 bg-[var(--muted)] rounded-xl">
                    <p className="text-xs text-[var(--muted-foreground)] uppercase mb-1">Medio de Pago</p>
                    <p className="font-medium text-[var(--foreground)] capitalize">{venta.medio_pago_heredado}</p>
                  </div>
                )}
                {/* NUEVO: Fecha pago resto */}
                {(() => {
                  const montoRestante = Math.max(0, (cotizacion?.precio_total || 0) - (venta?.monto_pagado_heredado || 0));
                  return montoRestante > 0 && cotizacion?.fecha_pago_resto ? (
                    <div className="p-4 bg-[var(--muted)] rounded-xl border border-orange-500/20">
                      <p className="text-xs text-[var(--muted-foreground)] uppercase mb-1">Fecha Pago Resto</p>
                      <p className="text-lg font-bold text-orange-400">
                        {new Date(cotizacion.fecha_pago_resto).toLocaleDateString('es-AR')}
                      </p>
                    </div>
                  ) : null;
                })()}
              </div>
              {venta.observaciones_pago_heredado && (
                <div className="p-4 bg-[var(--muted)] rounded-xl">
                  <p className="text-xs text-[var(--muted-foreground)] uppercase mb-1">Observaciones de Pago</p>
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
              {cotizacion.comision_vendedor && (
                <div className="flex justify-between text-sm pt-2">
                  <span className="text-[var(--muted-foreground)]">Comisión vendedor (12%)</span>
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
                  {venta.comision_estado === 'pagada' ? (
                    <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium">
                      <CheckCircle className="w-3 h-3" />
                      Comisión pagada
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-medium">
                      <AlertCircle className="w-3 h-3" />
                      Comisión pendiente
                    </span>
                  )}
                </div>
                
                {venta.comision_estado !== 'pagada' && (
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
      {showPagarComision && (
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
    </div>
  );
}
