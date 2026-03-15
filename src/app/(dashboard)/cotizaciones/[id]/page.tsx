"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
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
  Printer
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

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
  estado: 'pendiente' | 'convertida' | 'vencida' | 'cancelada';
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
  const { user } = useAuth();
  const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null);
  const [paquete, setPaquete] = useState<Paquete | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConverting, setIsConverting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<Partial<Cotizacion>>({});

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

  const handleConvertirAVenta = async () => {
    if (!confirm('¿Estás seguro de convertir esta cotización en venta?')) return;
    
    setIsConverting(true);
    try {
      await api.post(`/cotizaciones/${params.id}/convertir`);
      alert('Cotización convertida a venta exitosamente');
      router.push('/mis-ventas');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al convertir cotización');
    } finally {
      setIsConverting(false);
    }
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
  const puedeConvertir = cotizacion.estado === 'pendiente';

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
                <p className="text-xl font-black text-blue-400">${cotizacion.precio_total.toLocaleString()}</p>
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
                  ${Math.round(cotizacion.precio_total / cotizacion.num_pasajeros).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Pasajeros</span>
                <span className="text-white">{cotizacion.num_pasajeros}</span>
              </div>
              <div className="h-px bg-white/10 my-3" />
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-white">Total</span>
                <span className="text-2xl font-black text-blue-400">${cotizacion.precio_total.toLocaleString()}</span>
              </div>
              {cotizacion.comision_vendedor && (
                <div className="flex justify-between text-sm pt-2">
                  <span className="text-slate-400">Tu comisión</span>
                  <span className="text-green-400 font-medium">${cotizacion.comision_vendedor.toLocaleString()}</span>
                </div>
              )}
            </div>

            {puedeConvertir && (
              <button
                onClick={handleConvertirAVenta}
                disabled={isConverting}
                className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                {isConverting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Convertir a Venta
                  </>
                )}
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
    </div>
  );
}
