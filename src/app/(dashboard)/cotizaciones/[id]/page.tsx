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
  Edit,
  Printer,
  CreditCard
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { formatCurrency } from '@/lib/utils';

interface Cotizacion {
  id: string;
  codigo: string;
  cliente_nombre: string;
  cliente_email: string;
  cliente_telefono: string;
  paquete_id: string;
  paquete_nombre?: string;
  num_pasajeros: number;
  tipo_habitacion: string;
  fecha_salida?: string;
  precio_total: number;
  comision_vendedor?: number;
  estado: 'pendiente' | 'respondida' | 'convertida' | 'vencida' | 'cancelada';
  notas?: string;
  fecha_creacion: string;
  fecha_expiracion?: string;
}

interface Paquete {
  id: string;
  nombre: string;
  titulo: string;
  destino: string;
  imagen_url?: string;
  imagen_principal?: string;
}

export default function CotizacionDetalle() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  // Detectar si venimos del kanban con accion=cerrar
  const accion = searchParams.get('accion');
  const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null);
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

  useEffect(() => {
    const fetchCotizacion = async () => {
      try {
        const res = await api.get(`/cotizaciones/${params.id}`);
        setCotizacion(res.data);
        setEditData(res.data);
        
        // Cargar datos del paquete
        if (res.data.paquete_id) {
          const paqueteRes = await api.get(`/paquetes/${res.data.paquete_id}`);
          setPaquete(paqueteRes.data);
        }
        
        // Si venimos del kanban con accion=cerrar, abrir modal automáticamente
        if (accion === 'cerrar' && res.data.estado === 'respondida') {
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
      case 'convertida': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'pendiente': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'vencida': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'cancelada': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'convertida': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'pendiente': return <Clock className="w-5 h-5 text-orange-400" />;
      case 'vencida': return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'cancelada': return <XCircle className="w-5 h-5 text-slate-400" />;
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
        <h2 className="text-2xl font-bold text-white">Cotización no encontrada</h2>
        <Link href="/cotizaciones" className="text-blue-400 hover:text-blue-300 mt-4 inline-block">
          ← Volver a cotizaciones
        </Link>
      </div>
    );
  }

  const imagen = paquete?.imagen_url || paquete?.imagen_principal || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800';
  const puedeEditar = cotizacion.estado === 'pendiente' && user?.rol === 'vendedor';
  const puedeConvertir = cotizacion.estado === 'pendiente' || cotizacion.estado === 'respondida';

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/cotizaciones" className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-white">Cotización {cotizacion.codigo}</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${getStatusColor(cotizacion.estado)}`}>
              {cotizacion.estado}
            </span>
          </div>
          <p className="text-slate-400 text-sm">
            Creada el {new Date(cotizacion.fecha_creacion).toLocaleDateString('es-AR')}
            {cotizacion.fecha_expiracion && ` • Vence el ${new Date(cotizacion.fecha_expiracion).toLocaleDateString('es-AR')}`}
          </p>
        </div>
        <div className="flex gap-2">
          <PDFDownloadButton 
            data={{
              ...cotizacion,
              paquete: paquete ? {
                titulo: paquete.titulo || paquete.nombre,
                destino: paquete.destino,
                imagen_principal: paquete.imagen_principal || paquete.imagen_url
              } : undefined,
              vendedor: user ? {
                nombre: user.nombre,
                apellido: user.apellido,
                email: user.email
              } : undefined
            }}
          />
          <button 
            onClick={() => window.print()}
            className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
            title="Imprimir"
          >
            <Printer className="w-5 h-5 text-slate-400" />
          </button>
          {puedeEditar && (
            <button 
              onClick={() => setShowEditModal(true)}
              className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
              title="Editar"
            >
              <Edit className="w-5 h-5 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - Info del paquete */}
        <div className="lg:col-span-2 space-y-6">
          {/* Paquete */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="relative h-48">
              <img src={imagen} alt={paquete?.nombre} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-6">
                <p className="text-xs text-blue-300 uppercase font-black mb-1">Paquete</p>
                <h3 className="text-xl font-black text-white">{paquete?.nombre || paquete?.titulo || 'Paquete no disponible'}</h3>
                {paquete?.destino && (
                  <p className="text-slate-300 text-sm">{paquete.destino}</p>
                )}
              </div>
            </div>
          </div>

          {/* Detalles de la cotización */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Detalles de la Cotización
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white/5 rounded-xl">
                <p className="text-xs text-slate-500 uppercase font-black mb-1">Pasajeros</p>
                <p className="text-xl font-black text-white">{cotizacion.num_pasajeros}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl">
                <p className="text-xs text-slate-500 uppercase font-black mb-1">Habitación</p>
                <p className="text-xl font-black text-white capitalize">{cotizacion.tipo_habitacion}</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl">
                <p className="text-xs text-slate-500 uppercase font-black mb-1">Fecha Salida</p>
                <p className="text-lg font-black text-white">
                  {cotizacion.fecha_salida 
                    ? new Date(cotizacion.fecha_salida).toLocaleDateString('es-AR')
                    : 'A definir'
                  }
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl">
                <p className="text-xs text-slate-500 uppercase font-black mb-1">Total</p>
                <p className="text-xl font-black text-blue-400">${formatCurrency(cotizacion.precio_total)}</p>
              </div>
            </div>
          </div>

          {/* Datos del cliente */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              Datos del Cliente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
                <User className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-xs text-slate-500 uppercase">Nombre</p>
                  <p className="font-medium text-white">{cotizacion.cliente_nombre}</p>
                </div>
              </div>
              {cotizacion.cliente_email && (
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Email</p>
                    <p className="font-medium text-white">{cotizacion.cliente_email}</p>
                  </div>
                </div>
              )}
              {cotizacion.cliente_telefono && (
                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
                  <Phone className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500 uppercase">Teléfono</p>
                    <p className="font-medium text-white">{cotizacion.cliente_telefono}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notas */}
          {cotizacion.notas && (
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Notas</h3>
              <p className="text-slate-300 whitespace-pre-wrap">{cotizacion.notas}</p>
            </div>
          )}
        </div>

        {/* Columna derecha - Acciones */}
        <div className="space-y-6">
          {/* Resumen */}
          <div className="glass-card rounded-2xl p-6 sticky top-6">
            <h3 className="text-lg font-bold text-white mb-4">Resumen</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Precio por persona</span>
                <span className="text-white">
                  ${formatCurrency(Math.round(cotizacion.precio_total / cotizacion.num_pasajeros))}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Pasajeros</span>
                <span className="text-white">{cotizacion.num_pasajeros}</span>
              </div>
              <div className="h-px bg-white/10 my-3" />
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-white">Total</span>
                <span className="text-2xl font-black text-blue-400">${formatCurrency(cotizacion.precio_total)}</span>
              </div>
              {cotizacion.comision_vendedor && (
                <div className="flex justify-between text-sm pt-2">
                  <span className="text-slate-400">Tu comisión</span>
                  <span className="text-green-400 font-medium">${formatCurrency(cotizacion.comision_vendedor)}</span>
                </div>
              )}
            </div>

            {puedeConvertir && (
              <button
                onClick={() => setShowVentaModal(true)}
                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Convertir a Venta
              </button>
            )}

            {cotizacion.estado === 'convertida' && (
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
            <h3 className="text-2xl font-black text-white mb-6">Editar Cotización</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Nombre del Cliente</label>
                <input
                  type="text"
                  value={editData.cliente_nombre || ''}
                  onChange={(e) => setEditData({...editData, cliente_nombre: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Email</label>
                  <input
                    type="email"
                    value={editData.cliente_email || ''}
                    onChange={(e) => setEditData({...editData, cliente_email: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Teléfono</label>
                  <input
                    type="tel"
                    value={editData.cliente_telefono || ''}
                    onChange={(e) => setEditData({...editData, cliente_telefono: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Pasajeros</label>
                  <input
                    type="number"
                    min={1}
                    value={editData.num_pasajeros || 1}
                    onChange={(e) => setEditData({...editData, num_pasajeros: parseInt(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Tipo Habitación</label>
                  <select
                    value={editData.tipo_habitacion || 'doble'}
                    onChange={(e) => setEditData({...editData, tipo_habitacion: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                  >
                    <option value="doble">Doble</option>
                    <option value="triple">Triple</option>
                    <option value="cuadruple">Cuádruple</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Fecha de Salida</label>
                <input
                  type="date"
                  value={editData.fecha_salida || ''}
                  onChange={(e) => setEditData({...editData, fecha_salida: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Notas</label>
                <textarea
                  rows={3}
                  value={editData.notas || ''}
                  onChange={(e) => setEditData({...editData, notas: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all"
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
            <h3 className="text-2xl font-black text-white mb-2">Cerrar Venta</h3>
            <p className="text-slate-400 text-sm mb-6">
              Cotización: <span className="text-blue-400 font-mono">{cotizacion.codigo}</span>
            </p>
            
            <form onSubmit={handleConvertirAVenta} className="space-y-6">
              {/* Pregunta principal: ¿Recibió pago? */}
              <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl space-y-4">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-blue-400" />
                  ¿El cliente ya realizó algún pago?
                </h4>
                
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setVentaData({...ventaData, pago_realizado: true, tipo_pago: 'adelanto'})}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                      ventaData.pago_realizado 
                        ? 'bg-green-600 text-white' 
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    ✅ Sí, recibí pago
                  </button>
                  <button
                    type="button"
                    onClick={() => setVentaData({...ventaData, pago_realizado: false, monto_pagado: '', tipo_pago: 'pendiente'})}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                      !ventaData.pago_realizado 
                        ? 'bg-orange-600 text-white' 
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    ⏳ No, aún no
                  </button>
                </div>
              </div>
              
              {/* Si recibió pago - mostrar campos de pago */}
              {ventaData.pago_realizado && (
                <div className="p-4 bg-white/5 rounded-2xl space-y-4">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-green-400" />
                    Detalles del Pago Recibido
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-slate-400 mb-1 block">Monto Recibido *</label>
                      <input
                        type="number"
                        required={ventaData.pago_realizado}
                        min={1}
                        value={ventaData.monto_pagado}
                        onChange={(e) => setVentaData({...ventaData, monto_pagado: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                        placeholder="Ej: 6000"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-400 mb-1 block">Tipo de Pago *</label>
                      <select
                        value={ventaData.tipo_pago}
                        onChange={(e) => setVentaData({...ventaData, tipo_pago: e.target.value as 'total' | 'adelanto'})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                      >
                        <option value="adelanto">Adelanto / Seña</option>
                        <option value="total">Pago Total</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Medio de Pago *</label>
                    <select
                      value={ventaData.medio_pago}
                      onChange={(e) => setVentaData({...ventaData, medio_pago: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
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
                    <label className="text-sm text-slate-400 mb-2 block">
                      Comprobante de Pago (opcional)
                    </label>
                    
                    {comprobantesPreview.length === 0 ? (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-blue-500/50 hover:bg-white/5 transition-all">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-sm text-slate-400">Click para subir comprobante</p>
                          <p className="text-xs text-slate-500">Imagen o PDF (máx. 10MB)</p>
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
                          <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{comp.type === 'pdf' ? '📄' : '📷'}</span>
                              <span className="text-sm text-white truncate max-w-[200px]">{comp.name}</span>
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
                        <label className="flex items-center justify-center w-full py-2 border border-dashed border-white/20 rounded-xl cursor-pointer hover:border-blue-500/50 hover:bg-white/5 transition-all text-sm text-slate-400">
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
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-400" />
                    Información de Pago Pendiente
                  </h4>
                  <p className="text-sm text-slate-400">
                    Indica cuándo o cómo planeas recibir el pago. Esta información será útil para el administrador.
                  </p>
                  <div>
                    <label className="text-sm text-slate-400 mb-1 block">Detalles / Acuerdo de pago</label>
                    <textarea
                      rows={3}
                      value={ventaData.observaciones_pago}
                      onChange={(e) => setVentaData({...ventaData, observaciones_pago: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 resize-none"
                      placeholder="Ej: El cliente pagará el lunes por transferencia..."
                    />
                  </div>
                </div>
              )}

              {/* Datos de Pasajeros */}
              <div className="p-4 bg-white/5 rounded-2xl space-y-4">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Datos de Pasajeros
                </h4>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">
                    Datos completos de los {cotizacion.num_pasajeros} pasajero(s)
                  </label>
                  <textarea
                    rows={4}
                    value={ventaData.datos_pasajeros}
                    onChange={(e) => setVentaData({...ventaData, datos_pasajeros: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 resize-none"
                    placeholder={`Nombre completo, DNI/Pasaporte, Fecha de nacimiento de cada pasajero...\n\nEjemplo:\n1. Juan Pérez, DNI 12345678, 15/03/1985\n2. María López, DNI 87654321, 20/07/1990`}
                  />
                </div>
              </div>

              {/* Observaciones */}
              <div className="p-4 bg-white/5 rounded-2xl space-y-4">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  Observaciones / Dónde cobrar
                </h4>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">
                    Detalles adicionales, cuenta bancaria, dirección de cobro, etc.
                  </label>
                  <textarea
                    rows={3}
                    value={ventaData.observaciones_pago}
                    onChange={(e) => setVentaData({...ventaData, observaciones_pago: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 resize-none"
                    placeholder="CBU para transferencia, dirección si hay que ir a cobrar, notas especiales..."
                  />
                </div>
              </div>

              {/* Resumen */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-300">Total del viaje:</span>
                  <span className="text-xl font-black text-white">${formatCurrency(cotizacion.precio_total)}</span>
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
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isConverting || (ventaData.pago_realizado && !ventaData.monto_pagado)}
                  className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white font-bold transition-all flex items-center justify-center gap-2"
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
