"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

// Configuración para forzar renderizado dinámico y evitar problemas de build
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import api from '@/lib/api';
import { PDFDownloadButton } from '@/components/pdf/PDFDownloadButton';
import { 
  ArrowLeft, 
  FileText, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Users, 
  BedDouble,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  Send,
  Edit,
  Printer,
  CreditCard,
  Plane
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/utils';

interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  email: string | null;
  telefono: string | null;
  tipo_documento: string;
  documento: string;
  fecha_nacimiento: string | null;
  nacionalidad: string;
}

interface PasajeroVinculado {
  id: string;
  cotizacion_id: string;
  pasajero_id: string;
  es_titular: boolean;
  nombre_snapshot: string;
  apellido_snapshot: string;
  documento_snapshot: string | null;
  tipo_habitacion: string | null;
  regimen: string | null;
  precio_individual: number | null;
  pasajero?: Cliente;
}

interface Vuelo {
  id: string;
  tipo_trayecto: string;
  aerolinea_nombre: string;
  numero_vuelo: string;
  origen_codigo: string;
  origen_nombre: string;
  destino_codigo: string;
  destino_nombre: string;
  fecha_salida: string;
  hora_salida: string;
  fecha_llegada: string;
  hora_llegada: string;
  clase_nombre: string;
}

interface Hospedaje {
  id: string;
  nombre_hotel: string;
  ciudad: string;
  fecha_checkin: string;
  fecha_checkout: string;
  tipo_habitacion: string;
  regimen: string;
  noches: number;
}

interface Cotizacion {
  id: string;
  codigo: string;
  // Nuevo schema CRM
  cliente_id: string;
  cliente?: Cliente;
  pasajeros?: PasajeroVinculado[];
  vuelos?: Vuelo[];
  hospedajes?: Hospedaje[];
  // Datos de la cotización
  nombre_cotizacion?: string;
  tipo_cotizacion?: 'paquete' | 'manual';
  destino_principal?: string;
  num_pasajeros: number;
  precio_total: number;
  precio_moneda?: string;
  precio_vuelos?: number;
  precio_hospedajes?: number;
  comision_vendedor?: number;
  estado: 'nueva' | 'enviada' | 'vendida' | 'perdida';
  notas?: string;
  fecha_creacion: string;
  fecha_expiracion?: string;
  fecha_salida?: string;
  // JSONB data
  paquete_data?: {
    itinerario?: { texto?: string; dias?: any[] } | any[] | string;
    incluye?: string[];
    no_incluye?: string[];
    politicas_cancelacion?: string;
    hotel_seleccionado?: {
      id: string;
      nombre: string;
      link?: string;
      ciudad?: string;
      tipo_habitacion?: string;
      precio_por_persona?: number;
    };
  };
  itinerario?: { texto?: string; dias?: any[] };
  // Legacy fields (para cotizaciones viejas)
  cliente_nombre?: string;
  cliente_email?: string;
  cliente_telefono?: string;
  paquete_id?: string;
  paquete_nombre?: string;
  tipo_habitacion?: string;
  hospedaje?: any[];
  datos_completos?: any;
  itinerario_manual?: string;
  incluye?: string[];
  no_incluye?: string[];
}

interface Paquete {
  id: string;
  nombre: string;
  titulo: string;
  destino: string;
  descripcion?: string;
  duracion_dias?: number;
  imagen_url?: string;
  imagen_principal?: string;
  itinerario?: { texto?: string; dias?: any[] } | any[] | string;
  incluye?: string[];
  no_incluye?: string[];
  vuelos?: any[];
  politicas_cancelacion?: string;
}

export default function CotizacionDetalle() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  // Detectar si venimos del kanban con accion=cerrar
  const accion = searchParams.get('accion');
  const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null);
  
  // Calcular número real de pasajeros desde los datos vinculados
  const numPasajerosReal = cotizacion?.pasajeros?.length || cotizacion?.num_pasajeros || 1;
  const [paquete, setPaquete] = useState<Paquete | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConverting, setIsConverting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showVentaModal, setShowVentaModal] = useState(false);
  const [editData, setEditData] = useState<Partial<Cotizacion>>({});
  
  // Datos de conversión a venta
  const [ventaData, setVentaData] = useState({
    pago_realizado: false,
    monto_pagado: '',
    tipo_pago: 'total' as 'total' | 'adelanto' | 'pendiente',
    medio_pago: 'transferencia',
    datos_pasajeros: '',
    observaciones_pago: ''
  });
  
  // Estado para comprobantes
  const [comprobantes, setComprobantes] = useState<File[]>([]);
  const [comprobantesPreview, setComprobantesPreview] = useState<{name: string, type: string}[]>([]);
  const [isUploadingComprobantes, setIsUploadingComprobantes] = useState(false);
  
  // Estado para datos parseados de notas (cotizaciones de catálogo)
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
        setEditData(cotizacionData);
        
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
        
        // Parsear datos completos de pasajeros desde notas
        if (cotizacionData.notas && cotizacionData.notas.includes('--- DATOS COMPLETOS ---')) {
          try {
            const datosMatch = cotizacionData.notas.match(/--- DATOS COMPLETOS ---\n([\s\S]+?)(?:\n--- |$)/);
            if (datosMatch) {
              const datosJson = JSON.parse(datosMatch[1]);
              // Mergear con datos_completos existente o crear nuevo
              setCotizacion((prev: any) => ({
                ...prev,
                datos_completos: {
                  ...prev?.datos_completos,
                  ...datosJson
                }
              }));
            }
          } catch (e) {
            console.error('Error parseando datos completos:', e);
          }
        }
        
        // Usar paquete de la cotización si existe, sino cargarlo
        if (cotizacionData.paquete) {
          setPaquete(cotizacionData.paquete);
        } else if (cotizacionData.paquete_id) {
          const paqueteRes = await api.get(`/paquetes/${cotizacionData.paquete_id}`);
          setPaquete(paqueteRes.data);
        }
        
        // Si venimos del kanban con accion=cerrar, abrir modal automáticamente
        if (accion === 'cerrar' && cotizacionData.estado === 'enviada') {
          setShowVentaModal(true);
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
  }, [params.id, accion]);

  const handleConvertirAVenta = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsConverting(true);
    
    try {
      // 1. Subir comprobantes si hay
      if (comprobantes.length > 0) {
        setIsUploadingComprobantes(true);
        
        for (const file of comprobantes) {
          const formData = new FormData();
          formData.append('comprobante', file);
          formData.append('descripcion', `Comprobante de ${ventaData.tipo_pago === 'total' ? 'pago total' : 'adelanto'} - ${ventaData.medio_pago}`);
          
          await api.post(`/upload/comprobante-pago/${params.id}`, formData);
        }
        
        setIsUploadingComprobantes(false);
      }
      
      // 2. Convertir a venta con datos de pago
      await api.put(`/cotizaciones/${params.id}/convertir`, {
        pago_realizado: ventaData.pago_realizado,
        monto_pagado: ventaData.pago_realizado ? parseFloat(ventaData.monto_pagado) || 0 : 0,
        tipo_pago: ventaData.pago_realizado ? ventaData.tipo_pago : 'pendiente',
        medio_pago: ventaData.medio_pago,
        observaciones_pago: ventaData.observaciones_pago,
        datos_pasajeros: ventaData.datos_pasajeros
      });
      
      alert('✅ Cotización convertida a venta exitosamente');
      setShowVentaModal(false);
      router.push('/mis-ventas');
    } catch (err: any) {
      console.error('Error completo:', err);
      alert(err.response?.data?.error || err.response?.data?.message || 'Error al convertir cotización');
    } finally {
      setIsConverting(false);
      setIsUploadingComprobantes(false);
    }
  };
  
  // Manejar selección de archivos
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newFiles: File[] = [];
    const newPreviews: {name: string, type: string}[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validar tipo
      if (!file.type.match(/image\/(jpeg|png|webp)|application\/pdf/)) {
        alert(`El archivo ${file.name} no es válido. Solo se permiten imágenes (JPG, PNG, WebP) o PDFs.`);
        continue;
      }
      
      // Validar tamaño (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`El archivo ${file.name} excede el límite de 10MB.`);
        continue;
      }
      
      newFiles.push(file);
      newPreviews.push({
        name: file.name,
        type: file.type === 'application/pdf' ? 'pdf' : 'imagen'
      });
    }
    
    setComprobantes([...comprobantes, ...newFiles]);
    setComprobantesPreview([...comprobantesPreview, ...newPreviews]);
  };
  
  // Eliminar comprobante seleccionado
  const removeComprobante = (index: number) => {
    setComprobantes(comprobantes.filter((_, i) => i !== index));
    setComprobantesPreview(comprobantesPreview.filter((_, i) => i !== index));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/cotizaciones/${params.id}`, editData);
      setCotizacion({ ...cotizacion!, ...editData });
      setShowEditModal(false);
      alert('Cotización actualizada');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al actualizar');
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'vendida': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'nueva': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'vencida': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'cancelada': return 'bg-slate-500/10 text-[var(--muted-foreground)] border-slate-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'vendida': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'nueva': return <Clock className="w-5 h-5 text-orange-400" />;
      case 'vencida': return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'cancelada': return <XCircle className="w-5 h-5 text-[var(--muted-foreground)]" />;
      default: return <FileText className="w-5 h-5 text-blue-400" />;
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
        <Link href="/cotizaciones" className="text-blue-400 hover:text-blue-300 mt-4 inline-block">
          ← Volver a cotizaciones
        </Link>
      </div>
    );
  }

  const imagen = paquete?.imagen_url || paquete?.imagen_principal || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800';
  const puedeEditar = cotizacion.estado === 'nueva' && user?.rol === 'vendedor';
  const puedeConvertir = cotizacion.estado === 'nueva' || cotizacion.estado === 'enviada';

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/cotizaciones" className="p-2 bg-[var(--muted)] rounded-xl hover:bg-[var(--muted)] transition-all">
          <ArrowLeft className="w-5 h-5 text-[var(--muted-foreground)]" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-[var(--foreground)]">Cotización {cotizacion.codigo}</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${getStatusColor(cotizacion.estado)}`}>
              {cotizacion.estado}
            </span>
          </div>
          <p className="text-[var(--muted-foreground)] text-sm">
            Creada el {new Date(cotizacion.fecha_creacion).toLocaleDateString('es-AR')}
            {cotizacion.fecha_expiracion && ` • Vence el ${new Date(cotizacion.fecha_expiracion).toLocaleDateString('es-AR')}`}
          </p>
        </div>
        <div className="flex gap-2">
          <PDFDownloadButton 
            data={{
              id: cotizacion.id,
              codigo: cotizacion.codigo,
              fecha_creacion: cotizacion.fecha_creacion,
              fecha_expiracion: cotizacion.fecha_expiracion,
              num_pasajeros: numPasajerosReal,
              tipo_habitacion: cotizacion.tipo_habitacion,
              fecha_salida: cotizacion.fecha_salida || (cotizacion.paquete_data as any)?.fecha_salida || (paquete as any)?.fecha_salida,
              cliente_nombre: cotizacion.cliente_nombre,
              cliente_email: cotizacion.cliente_email,
              cliente_telefono: cotizacion.cliente_telefono,
              precio_total: cotizacion.precio_total,
              tipo_cotizacion: cotizacion.tipo_cotizacion,
              nombre_cotizacion: cotizacion.nombre_cotizacion,
              itinerario_manual: cotizacion.itinerario_manual,
              // Paquete: combina datos directos + parseados de notas
              paquete: {
                titulo: paquete?.titulo || paquete?.nombre || datosPaqueteDesdeNotas?.titulo || cotizacion.nombre_cotizacion || 'Cotización',
                destino: paquete?.destino || datosPaqueteDesdeNotas?.destino || cotizacion.destino_principal || cotizacion.hospedaje?.[0]?.ciudad || cotizacion.hospedajes?.[0]?.ciudad || 'Destino no especificado',
                descripcion: paquete?.descripcion || datosPaqueteDesdeNotas?.descripcion,
                duracion_dias: paquete?.duracion_dias || datosPaqueteDesdeNotas?.duracion_dias || 0,
                imagen_principal: paquete?.imagen_principal || paquete?.imagen_url || datosPaqueteDesdeNotas?.imagen_principal,
                politicas_cancelacion: paquete?.politicas_cancelacion || datosPaqueteDesdeNotas?.politicas_cancelacion,
                // Itinerario: del paquete, datos parseados, o cotización manual
                itinerario: (() => {
                  // Prioridad 1: itinerario del paquete
                  if (paquete?.itinerario) return paquete.itinerario;
                  // Prioridad 2: datos parseados de notas
                  if (datosPaqueteDesdeNotas?.itinerario) return datosPaqueteDesdeNotas.itinerario;
                  // Prioridad 3: itinerario_manual de cotización
                  if (cotizacion.itinerario_manual) return { texto: cotizacion.itinerario_manual, dias: [] };
                  // Prioridad 4: itinerario del objeto cotización (JSONB)
                  if (cotizacion.itinerario) return cotizacion.itinerario;
                  return { texto: '', dias: [] };
                })(),
                // Incluye: del paquete, de los datos parseados, o de la cotización manual
                incluye: paquete?.incluye || datosPaqueteDesdeNotas?.incluye || cotizacion.incluye || [],
                no_incluye: paquete?.no_incluye || datosPaqueteDesdeNotas?.no_incluye || cotizacion.no_incluye || []
              },
              // Pasajeros: del nuevo schema CRM (cotizacion.pasajeros) o legacy (datos_completos)
              pasajeros: (() => {
                // Nuevo schema: cotizacion.pasajeros viene del backend
                if (cotizacion.pasajeros && numPasajerosReal > 0) {
                  return cotizacion.pasajeros.map((pv: any) => ({
                    nombre: pv.nombre_snapshot || pv.pasajero?.nombre || '',
                    apellido: pv.apellido_snapshot || pv.pasajero?.apellido || '',
                    documento: pv.documento_snapshot || pv.pasajero?.documento || '',
                    fecha_nacimiento: pv.pasajero?.fecha_nacimiento || '',
                    nacionalidad: pv.pasajero?.nacionalidad || ''
                  }));
                }
                // Legacy: datos_completos (cotizaciones antiguas)
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
              // Vuelos: del nuevo schema (cotizacion.vuelos) o legacy
              vuelos: (() => {
                // Nuevo schema
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
                // Legacy: del paquete o datos parseados
                return paquete?.vuelos || datosPaqueteDesdeNotas?.vuelos || [];
              })(),
              // Hospedaje: del nuevo schema o legacy
              hospedaje: (() => {
                // Nuevo schema
                if (cotizacion.hospedajes && cotizacion.hospedajes.length > 0) {
                  return cotizacion.hospedajes;
                }
                // Legacy
                return cotizacion.hospedaje || datosPaqueteDesdeNotas?.hospedaje || [];
              })(),
              // Desglose de precios
              precios: {
                vuelos: cotizacion.precio_vuelos,
                hospedajes: cotizacion.precio_hospedajes,
                total: cotizacion.precio_total,
                moneda: cotizacion.precio_moneda || 'USD'
              },
              vendedor: user ? {
                nombre: user.nombre,
                apellido: user.apellido,
                email: user.email
              } : undefined,
              paquete_data: cotizacion.paquete_data
            }}
          />
          <button 
            onClick={() => window.print()}
            className="p-3 bg-[var(--muted)] rounded-xl hover:bg-[var(--muted)] transition-all"
            title="Imprimir"
          >
            <Printer className="w-5 h-5 text-[var(--muted-foreground)]" />
          </button>
          {puedeEditar && (
            <button 
              onClick={() => setShowEditModal(true)}
              className="p-3 bg-[var(--muted)] rounded-xl hover:bg-[var(--muted)] transition-all"
              title="Editar"
            >
              <Edit className="w-5 h-5 text-[var(--muted-foreground)]" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - Info del paquete */}
        <div className="lg:col-span-2 space-y-6">
          {/* Paquete / Nombre de Cotización */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="relative h-48">
              <img src={imagen} alt={paquete?.nombre || cotizacion.nombre_cotizacion} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-6">
                <p className="text-xs text-blue-300 uppercase font-black mb-1">
                  {cotizacion.tipo_cotizacion === 'manual' ? 'Cotización Personalizada' : 'Paquete'}
                </p>
                <h3 className="text-xl font-black text-[var(--foreground)]">
                  {cotizacion.nombre_cotizacion || paquete?.nombre || paquete?.titulo || 'Cotización no disponible'}
                </h3>
                {(paquete?.destino || cotizacion.hospedaje?.[0]?.ciudad) && (
                  <p className="text-[var(--foreground)] text-sm">
                    {paquete?.destino || cotizacion.hospedaje?.[0]?.ciudad}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Detalles de la cotización */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Detalles de la Cotización
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-[var(--muted)] rounded-xl">
                <p className="text-xs text-[var(--muted-foreground)] uppercase font-black mb-1">Pasajeros</p>
                <p className="text-xl font-black text-[var(--foreground)]">{cotizacion.pasajeros?.length || cotizacion.num_pasajeros || 1}</p>
              </div>
              <div className="p-4 bg-[var(--muted)] rounded-xl">
                <p className="text-xs text-[var(--muted-foreground)] uppercase font-black mb-1">Habitación</p>
                <p className="text-xl font-black text-[var(--foreground)] capitalize">
                  {cotizacion.tipo_habitacion || 
                   cotizacion.paquete_data?.hotel_seleccionado?.tipo_habitacion || 
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

          {/* Itinerario - Prioridad: paquete_data > paquete > notas parseadas */}
          {(() => {
            const itin = cotizacion.paquete_data?.itinerario || paquete?.itinerario || datosPaqueteDesdeNotas?.itinerario;
            if (!itin) return null;
            return (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                Itinerario
              </h3>
              {(() => {
                // Formato string (legacy)
                if (typeof itin === 'string') {
                  return <p className="text-[var(--foreground)] whitespace-pre-line break-words overflow-hidden">{itin}</p>;
                }
                // Formato {texto, dias} (nuevo formato)
                if (itin && typeof itin === 'object' && !Array.isArray(itin) && 'texto' in itin) {
                  const itinObj = itin as { texto?: string; dias?: any[] };
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
                                    <li key={actIdx} className="text-[var(--muted-foreground)] text-sm">• {act}</li>
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
                // Formato array (legacy)
                if (Array.isArray(itin) && itin.length > 0) {
                  return (
                    <div className="space-y-3">
                      {itin.map((dia: any, idx: number) => (
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
                                <li key={actIdx} className="text-[var(--muted-foreground)] text-sm">• {act}</li>
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
          )}
          )()}

          {/* Vuelos - Cotizaciones de catálogo (desde paquete) - Solo si NO es manual */}
          {cotizacion.tipo_cotizacion !== 'manual' && (paquete?.vuelos?.length || datosPaqueteDesdeNotas?.vuelos?.length) && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <Plane className="w-5 h-5 text-blue-400" />
                Vuelos
              </h3>
              <div className="space-y-3">
                {(paquete?.vuelos || datosPaqueteDesdeNotas?.vuelos || []).map((vuelo: any, idx: number) => (
                  <div key={idx} className="p-4 bg-[var(--muted)] rounded-xl border border-[var(--border)]">
                    <div className="flex items-center justify-between mb-2">
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

          {/* Incluye / No incluye - Prioridad: paquete_data > paquete > notas */}
          {(cotizacion.paquete_data?.incluye?.length || cotizacion.paquete_data?.no_incluye?.length ||
            paquete?.incluye?.length || paquete?.no_incluye?.length || 
            datosPaqueteDesdeNotas?.incluye?.length || datosPaqueteDesdeNotas?.no_incluye?.length) && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-400" />
                Detalles del Servicio
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(cotizacion.paquete_data?.incluye?.length || paquete?.incluye?.length || datosPaqueteDesdeNotas?.incluye?.length) && (
                  <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                    <p className="text-green-400 font-bold mb-2">Incluye</p>
                    <ul className="space-y-1">
                      {(cotizacion.paquete_data?.incluye || paquete?.incluye || datosPaqueteDesdeNotas?.incluye || []).map((item: string, idx: number) => (
                        <li key={idx} className="text-[var(--foreground)] text-sm">+ {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {(cotizacion.paquete_data?.no_incluye?.length || paquete?.no_incluye?.length || datosPaqueteDesdeNotas?.no_incluye?.length) && (
                  <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                    <p className="text-red-400 font-bold mb-2">No incluye</p>
                    <ul className="space-y-1">
                      {(cotizacion.paquete_data?.no_incluye || paquete?.no_incluye || datosPaqueteDesdeNotas?.no_incluye || []).map((item: string, idx: number) => (
                        <li key={idx} className="text-[var(--foreground)] text-sm">- {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Vuelos (cotización manual) - Solo mostrar si es cotización manual */}
          {cotizacion.tipo_cotizacion === 'manual' && cotizacion.vuelos && cotizacion.vuelos.length > 0 && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <Plane className="w-5 h-5 text-blue-400" />
                Vuelos ({cotizacion.vuelos.length})
              </h3>
              <div className="space-y-3">
                {cotizacion.vuelos.map((vuelo: any, idx: number) => (
                  <div key={idx} className="p-4 bg-[var(--muted)] rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[var(--foreground)] font-bold">
                        {vuelo.origen_ciudad || vuelo.origen_nombre || vuelo.origen} → 
                        {vuelo.destino_ciudad || vuelo.destino_nombre || vuelo.destino}
                      </span>
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-bold">
                        {vuelo.aerolinea_codigo || vuelo.aerolinea?.substring(0, 2)?.toUpperCase() || 'AV'} {vuelo.numero_vuelo}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-[var(--muted-foreground)] text-xs">Salida</p>
                        <p className="text-[var(--foreground)]">{vuelo.hora_salida}</p>
                        <p className="text-[var(--muted-foreground)] text-xs">{vuelo.fecha_salida}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[var(--muted-foreground)] text-xs">Clase</p>
                        <p className="text-blue-400">{vuelo.clase_codigo}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[var(--muted-foreground)] text-xs">Llegada</p>
                        <p className="text-[var(--foreground)]">{vuelo.hora_llegada}</p>
                        <p className="text-[var(--muted-foreground)] text-xs">{vuelo.fecha_llegada}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hospedaje (cotización manual) */}
          {cotizacion.hospedaje && cotizacion.hospedaje.length > 0 && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-blue-400" />
                Hospedaje
              </h3>
              <div className="space-y-3">
                {cotizacion.hospedaje.map((hotel: any, idx: number) => (
                  <div key={idx} className="p-4 bg-[var(--muted)] rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-[var(--foreground)] font-bold">{hotel.nombre_hotel}</p>
                        <p className="text-[var(--muted-foreground)] text-sm">{hotel.ciudad}</p>
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
                    <div className="grid grid-cols-3 gap-4 text-sm mt-3">
                      <div>
                        <p className="text-[var(--muted-foreground)] text-xs">Check-in</p>
                        <p className="text-[var(--foreground)]">{hotel.fecha_checkin || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[var(--muted-foreground)] text-xs">Check-out</p>
                        <p className="text-[var(--foreground)]">{hotel.fecha_checkout || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[var(--muted-foreground)] text-xs">Regimen</p>
                        <p className="text-[var(--foreground)] capitalize">{hotel.regimen?.replace('_', ' ')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Itinerario (cotización manual) */}
          {cotizacion.itinerario_manual && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                Itinerario
              </h3>
              <div className="p-4 bg-[var(--muted)] rounded-xl">
                <p className="text-[var(--foreground)] whitespace-pre-line break-words overflow-hidden">{cotizacion.itinerario_manual}</p>
              </div>
            </div>
          )}

          {/* Incluye / No incluye */}
          {(cotizacion.incluye?.length || cotizacion.no_incluye?.length) && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-400" />
                Detalles del Servicio
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cotizacion.incluye && cotizacion.incluye.length > 0 && (
                  <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                    <p className="text-green-400 font-bold mb-2">Incluye</p>
                    <ul className="space-y-1">
                      {cotizacion.incluye.map((item: string, idx: number) => (
                        <li key={idx} className="text-[var(--foreground)] text-sm">+ {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {cotizacion.no_incluye && cotizacion.no_incluye.length > 0 && (
                  <div className="p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                    <p className="text-red-400 font-bold mb-2">No incluye</p>
                    <ul className="space-y-1">
                      {cotizacion.no_incluye.map((item: string, idx: number) => (
                        <li key={idx} className="text-[var(--foreground)] text-sm">- {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Datos del Cliente - Nuevo Schema CRM */}
          {(cotizacion.cliente || cotizacion.cliente_nombre) && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-400" />
                Datos del Cliente
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nombre */}
                <div className="flex items-center gap-3 p-4 bg-[var(--muted)] rounded-xl">
                  <User className="w-5 h-5 text-[var(--muted-foreground)]" />
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)] uppercase">Nombre</p>
                    <p className="font-medium text-[var(--foreground)]">
                      {cotizacion.cliente 
                        ? `${cotizacion.cliente.nombre} ${cotizacion.cliente.apellido}`
                        : cotizacion.cliente_nombre}
                    </p>
                  </div>
                </div>
                {/* Email */}
                {(cotizacion.cliente?.email || cotizacion.cliente_email) && (
                  <div className="flex items-center gap-3 p-4 bg-[var(--muted)] rounded-xl">
                    <Mail className="w-5 h-5 text-[var(--muted-foreground)]" />
                    <div>
                      <p className="text-xs text-[var(--muted-foreground)] uppercase">Email</p>
                      <p className="font-medium text-[var(--foreground)]">
                        {cotizacion.cliente?.email || cotizacion.cliente_email}
                      </p>
                    </div>
                  </div>
                )}
                {/* Teléfono */}
                {(cotizacion.cliente?.telefono || cotizacion.cliente_telefono) && (
                  <div className="flex items-center gap-3 p-4 bg-[var(--muted)] rounded-xl">
                    <Phone className="w-5 h-5 text-[var(--muted-foreground)]" />
                    <div>
                      <p className="text-xs text-[var(--muted-foreground)] uppercase">Teléfono</p>
                      <p className="font-medium text-[var(--foreground)]">
                        {cotizacion.cliente?.telefono || cotizacion.cliente_telefono}
                      </p>
                    </div>
                  </div>
                )}
                {/* Documento - Solo nuevo formato */}
                {cotizacion.cliente?.documento && (
                  <div className="flex items-center gap-3 p-4 bg-[var(--muted)] rounded-xl">
                    <FileText className="w-5 h-5 text-[var(--muted-foreground)]" />
                    <div>
                      <p className="text-xs text-[var(--muted-foreground)] uppercase">Documento</p>
                      <p className="font-medium text-[var(--foreground)]">
                        {cotizacion.cliente.tipo_documento} {cotizacion.cliente.documento}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pasajeros - Nuevo Schema CRM */}
          {(cotizacion.pasajeros && numPasajerosReal > 0) ? (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Pasajeros ({numPasajerosReal})
              </h3>
              <div className="space-y-3">
                {cotizacion.pasajeros.map((pv: PasajeroVinculado, idx: number) => (
                  <div key={pv.id || idx} className="p-4 bg-[var(--muted)] rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </span>
                        <span className="font-medium text-[var(--foreground)]">
                          {pv.nombre_snapshot} {pv.apellido_snapshot}
                          {pv.es_titular && (
                            <span className="ml-2 text-xs text-blue-400">(Titular)</span>
                          )}
                        </span>
                      </div>
                    </div>
                    {pv.documento_snapshot && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-[var(--muted-foreground)]">Documento</p>
                          <p className="text-[var(--foreground)]">{pv.documento_snapshot}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (cotizacion.datos_completos?.cliente || (cotizacion.datos_completos?.pasajeros && cotizacion.datos_completos.pasajeros.length > 0)) ? (
            /* Formato viejo - compatibilidad */
            <div className="glass-card rounded-2xl p-6">
              {(() => {
                const titular = cotizacion.datos_completos?.cliente ? {
                  nombre: cotizacion.datos_completos.cliente.nombre,
                  apellido: cotizacion.datos_completos.cliente.apellido,
                  documento: cotizacion.datos_completos.cliente.documento,
                  es_titular: true
                } : null;
                const otros = cotizacion.datos_completos?.pasajeros || [];
                const todos = titular ? [titular, ...otros] : otros;
                
                return (
                  <>
                    <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-400" />
                      Pasajeros ({todos.length})
                    </h3>
                    <div className="space-y-3">
                      {todos.map((pasajero: any, idx: number) => (
                        <div key={idx} className="p-4 bg-[var(--muted)] rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-xs font-bold">
                                {idx + 1}
                              </span>
                              <span className="font-medium text-[var(--foreground)]">
                                {pasajero.nombre} {pasajero.apellido}
                                {pasajero.es_titular && (
                                  <span className="ml-2 text-xs text-blue-400">(Titular)</span>
                                )}
                              </span>
                            </div>
                          </div>
                          {pasajero.documento && (
                            <div className="text-sm">
                              <p className="text-xs text-[var(--muted-foreground)]">Documento</p>
                              <p className="text-[var(--foreground)]">{pasajero.documento}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>
          ) : null}

          {/* Notas - solo si no es cotización de catálogo o si hay notas reales */}
          {cotizacion.notas && !cotizacion.notas.includes('--- PAQUETE JSON ---') && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">Notas</h3>
              <p className="text-[var(--foreground)] whitespace-pre-wrap">{cotizacion.notas}</p>
            </div>
          )}
        </div>

        {/* Columna derecha - Acciones */}
        <div className="space-y-6">
          {/* Resumen */}
          <div className="glass-card rounded-2xl p-6 sticky top-6">
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">Resumen</h3>
            <div className="space-y-3 mb-6">
              {/* Hotel seleccionado */}
              {cotizacion.paquete_data?.hotel_seleccionado && (
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">Hotel</span>
                  <div className="text-right">
                    <span className="text-[var(--foreground)] font-medium">
                      {cotizacion.paquete_data.hotel_seleccionado.nombre}
                    </span>
                    {cotizacion.paquete_data.hotel_seleccionado.link && (
                      <a 
                        href={cotizacion.paquete_data.hotel_seleccionado.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-xs text-blue-400 hover:text-blue-300"
                      >
                        Ver hotel →
                      </a>
                    )}
                  </div>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">Habitación</span>
                <span className="text-[var(--foreground)] capitalize">{cotizacion.tipo_habitacion || 'Doble'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">Precio por persona</span>
                <span className="text-[var(--foreground)]">
                  ${formatCurrency(Math.round(cotizacion.precio_total / cotizacion.num_pasajeros))}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">Pasajeros</span>
                <span className="text-[var(--foreground)]">{numPasajerosReal}</span>
              </div>
              <div className="h-px bg-[var(--muted)] my-3" />
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-[var(--foreground)]">Total</span>
                <span className="text-2xl font-black text-blue-400">${formatCurrency(cotizacion.precio_total)}</span>
              </div>
              {cotizacion.comision_vendedor && (
                <div className="flex justify-between text-sm pt-2">
                  <span className="text-[var(--muted-foreground)]">Tu comisión</span>
                  <span className="text-green-400 font-medium">${formatCurrency(cotizacion.comision_vendedor)}</span>
                </div>
              )}
            </div>

            {puedeConvertir && (
              <button
                onClick={() => setShowVentaModal(true)}
                className="w-full py-4 bg-green-600 hover:bg-green-700 text-[var(--foreground)] font-black rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Convertir a Venta
              </button>
            )}

            {cotizacion.estado === 'vendida' && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-green-400 font-medium">Esta cotización ya fue convertida en venta</p>
                <Link href="/mis-ventas" className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block">
                  Ver mis ventas →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de edición */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-lg rounded-3xl p-8">
            <h3 className="text-2xl font-black text-[var(--foreground)] mb-6">Editar Cotización</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Nombre del Cliente</label>
                <input
                  type="text"
                  value={editData.cliente_nombre || ''}
                  onChange={(e) => setEditData({...editData, cliente_nombre: e.target.value})}
                  className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Email</label>
                  <input
                    type="email"
                    value={editData.cliente_email || ''}
                    onChange={(e) => setEditData({...editData, cliente_email: e.target.value})}
                    className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Teléfono</label>
                  <input
                    type="tel"
                    value={editData.cliente_telefono || ''}
                    onChange={(e) => setEditData({...editData, cliente_telefono: e.target.value})}
                    className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Pasajeros</label>
                  <input
                    type="number"
                    min={1}
                    value={editData.num_pasajeros || 1}
                    onChange={(e) => setEditData({...editData, num_pasajeros: parseInt(e.target.value)})}
                    className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Tipo Habitación</label>
                  <select
                    value={editData.tipo_habitacion || 'doble'}
                    onChange={(e) => setEditData({...editData, tipo_habitacion: e.target.value})}
                    className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
                  >
                    <option value="doble">Doble</option>
                    <option value="triple">Triple</option>
                    <option value="cuadruple">Cuádruple</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Fecha de Salida</label>
                <input
                  type="date"
                  value={editData.fecha_salida || ''}
                  onChange={(e) => setEditData({...editData, fecha_salida: e.target.value})}
                  className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Notas</label>
                <textarea
                  rows={3}
                  value={editData.notas || ''}
                  onChange={(e) => setEditData({...editData, notas: e.target.value})}
                  className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 rounded-xl bg-[var(--muted)] hover:bg-[var(--muted)] text-[var(--foreground)] font-medium transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-[var(--foreground)] font-bold transition-all"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Convertir a Venta */}
      {showVentaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-8">
            <h3 className="text-2xl font-black text-[var(--foreground)] mb-2">Cerrar Venta</h3>
            <p className="text-[var(--muted-foreground)] text-sm mb-6">
              Cotización: <span className="text-blue-400 font-mono">{cotizacion.codigo}</span>
            </p>
            
            <form onSubmit={handleConvertirAVenta} className="space-y-6">
              {/* Pregunta principal: ¿Recibió pago? */}
              <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl space-y-4">
                <h4 className="font-bold text-[var(--foreground)] flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-400" />
                  ¿El cliente ya realizó algún pago?
                </h4>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setVentaData({...ventaData, pago_realizado: true, tipo_pago: 'adelanto'})}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                      ventaData.pago_realizado 
                        ? 'bg-green-600 text-[var(--foreground)]' 
                        : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]'
                    }`}
                  >
                    ✅ Sí, recibí pago
                  </button>
                  <button
                    type="button"
                    onClick={() => setVentaData({...ventaData, pago_realizado: false, monto_pagado: '', tipo_pago: 'pendiente'})}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                      !ventaData.pago_realizado 
                        ? 'bg-orange-600 text-[var(--foreground)]' 
                        : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]'
                    }`}
                  >
                    ⏳ No, aún no
                  </button>
                </div>
              </div>
              
              {/* Si recibió pago - mostrar campos de pago */}
              {ventaData.pago_realizado && (
                <div className="p-4 bg-[var(--muted)] rounded-2xl space-y-4">
                  <h4 className="font-bold text-[var(--foreground)] flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-green-400" />
                    Detalles del Pago Recibido
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Monto Recibido *</label>
                      <input
                        type="number"
                        required={ventaData.pago_realizado}
                        min={1}
                        value={ventaData.monto_pagado}
                        onChange={(e) => setVentaData({...ventaData, monto_pagado: e.target.value})}
                        className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
                        placeholder="Ej: 6000"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Tipo de Pago *</label>
                      <select
                        value={ventaData.tipo_pago}
                        onChange={(e) => setVentaData({...ventaData, tipo_pago: e.target.value as 'total' | 'adelanto'})}
                        className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
                      >
                        <option value="adelanto">Adelanto / Seña</option>
                        <option value="total">Pago Total</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Medio de Pago *</label>
                    <select
                      value={ventaData.medio_pago}
                      onChange={(e) => setVentaData({...ventaData, medio_pago: e.target.value})}
                      className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
                    >
                      <option value="transferencia">Transferencia Bancaria</option>
                      <option value="efectivo">Efectivo</option>
                      <option value="tarjeta">Tarjeta de Crédito/Débito</option>
                      <option value="mercadopago">Mercado Pago</option>
                      <option value="paypal">PayPal</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>

                  {ventaData.tipo_pago === 'adelanto' && ventaData.monto_pagado && (
                    <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                      <p className="text-sm text-orange-400">
                        <strong>Resta cobrar:</strong> ${formatCurrency(cotizacion.precio_total - (parseFloat(ventaData.monto_pagado) || 0))}
                      </p>
                    </div>
                  )}
                  
                  {/* Upload de comprobantes */}
                  <div>
                    <label className="text-sm text-[var(--muted-foreground)] mb-2 block">
                      Comprobante de Pago (opcional)
                    </label>
                    
                    {comprobantesPreview.length === 0 ? (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-blue-500/50 hover:bg-[var(--muted)] transition-all">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg className="w-8 h-8 text-[var(--muted-foreground)] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-sm text-[var(--muted-foreground)]">Click para subir comprobante</p>
                          <p className="text-xs text-[var(--muted-foreground)]">Imagen o PDF (máx. 10MB)</p>
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/jpeg,image/png,image/webp,application/pdf"
                          onChange={handleFileSelect}
                        />
                      </label>
                    ) : (
                      <div className="space-y-2">
                        {comprobantesPreview.map((comp, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-[var(--muted)] rounded-xl">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{comp.type === 'pdf' ? '📄' : '📷'}</span>
                              <span className="text-sm text-[var(--foreground)] truncate max-w-[200px]">{comp.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeComprobante(idx)}
                              className="p-1 text-red-400 hover:text-red-300"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        <label className="flex items-center justify-center w-full py-2 border border-dashed border-white/20 rounded-xl cursor-pointer hover:border-blue-500/50 hover:bg-[var(--muted)] transition-all text-sm text-[var(--muted-foreground)]">
                          + Agregar otro comprobante
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/jpeg,image/png,image/webp,application/pdf"
                            onChange={handleFileSelect}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Si NO recibió pago */}
              {!ventaData.pago_realizado && (
                <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-2xl space-y-4">
                  <h4 className="font-bold text-[var(--foreground)] flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-400" />
                    Información de Pago Pendiente
                  </h4>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Indica cuándo o cómo planeas recibir el pago. Esta información será útil para el administrador.
                  </p>
                  <div>
                    <label className="text-sm text-[var(--muted-foreground)] mb-1 block">Detalles / Acuerdo de pago</label>
                    <textarea
                      rows={3}
                      value={ventaData.observaciones_pago}
                      onChange={(e) => setVentaData({...ventaData, observaciones_pago: e.target.value})}
                      className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500 resize-none"
                      placeholder="Ej: El cliente pagará el lunes por transferencia..."
                    />
                  </div>
                </div>
              )}

              {/* Datos de Pasajeros */}
              <div className="p-4 bg-[var(--muted)] rounded-2xl space-y-4">
                <h4 className="font-bold text-[var(--foreground)] flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Datos de Pasajeros
                </h4>
                <div>
                  <label className="text-sm text-[var(--muted-foreground)] mb-1 block">
                    Datos completos de los {numPasajerosReal} pasajero(s)
                  </label>
                  <textarea
                    rows={4}
                    value={ventaData.datos_pasajeros}
                    onChange={(e) => setVentaData({...ventaData, datos_pasajeros: e.target.value})}
                    className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500 resize-none"
                    placeholder={`Nombre completo, DNI/Pasaporte, Fecha de nacimiento de cada pasajero...\n\nEjemplo:\n1. Juan Pérez, DNI 12345678, 15/03/1985\n2. María López, DNI 87654321, 20/07/1990`}
                  />
                </div>
              </div>

              {/* Observaciones */}
              <div className="p-4 bg-[var(--muted)] rounded-2xl space-y-4">
                <h4 className="font-bold text-[var(--foreground)] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  Observaciones / Dónde cobrar
                </h4>
                <div>
                  <label className="text-sm text-[var(--muted-foreground)] mb-1 block">
                    Detalles adicionales, cuenta bancaria, dirección de cobro, etc.
                  </label>
                  <textarea
                    rows={3}
                    value={ventaData.observaciones_pago}
                    onChange={(e) => setVentaData({...ventaData, observaciones_pago: e.target.value})}
                    className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500 resize-none"
                    placeholder="CBU para transferencia, dirección si hay que ir a cobrar, notas especiales..."
                  />
                </div>
              </div>

              {/* Resumen */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[var(--foreground)]">Total del viaje:</span>
                  <span className="text-xl font-black text-[var(--foreground)]">${formatCurrency(cotizacion.precio_total)}</span>
                </div>
                {ventaData.pago_realizado && ventaData.monto_pagado && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-green-400">Recibido:</span>
                    <span className="text-green-400 font-medium">${formatCurrency(parseFloat(ventaData.monto_pagado) || 0)}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowVentaModal(false)}
                  className="flex-1 py-3 rounded-xl bg-[var(--muted)] hover:bg-[var(--muted)] text-[var(--foreground)] font-medium transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isConverting || (ventaData.pago_realizado && !ventaData.monto_pagado)}
                  className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-[var(--foreground)] font-bold transition-all flex items-center justify-center gap-2"
                >
                  {isConverting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {isUploadingComprobantes ? 'Subiendo comprobantes...' : 'Procesando...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      {ventaData.pago_realizado ? 'Confirmar Venta' : 'Enviar a Administrador'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
