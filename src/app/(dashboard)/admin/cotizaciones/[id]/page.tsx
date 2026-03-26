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
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Printer,
  ArrowRight,
  UserCircle
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

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
  estado: 'pendiente' | 'convertida' | 'vencida' | 'cancelada';
  notas?: string;
  fecha_creacion: string;
  fecha_expiracion?: string;
  fecha_conversion?: string;
}

export default function AdminCotizacionDetalle() {
  const params = useParams();
  const router = useRouter();
  const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAprobarModal, setShowAprobarModal] = useState(false);
  const [showRechazarModal, setShowRechazarModal] = useState(false);
  const [notasAdmin, setNotasAdmin] = useState('');

  useEffect(() => {
    const fetchCotizacion = async () => {
      try {
        const res = await api.get(`/cotizaciones/${params.id}`);
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
      alert('Cotización aprobada');
      setShowAprobarModal(false);
      router.refresh();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al aprobar');
    }
  };

  const handleRechazar = async () => {
    try {
      await api.put(`/cotizaciones/${params.id}/rechazar`, { notas_admin: notasAdmin });
      alert('Cotización rechazada');
      setShowRechazarModal(false);
      router.push('/admin/cotizaciones');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al rechazar');
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'convertida': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'pendiente': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'vencida': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'cancelada': return 'bg-slate-500/10 text-[var(--muted-foreground)] border-slate-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
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

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/cotizaciones" className="p-2 bg-[var(--muted)] rounded-xl hover:bg-[var(--muted)] transition-all">
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
              <p className="text-sm text-[var(--muted-foreground)]">ID: {cotizacion.vendedor_id}</p>
            </div>
          </div>

          {/* Datos del cliente */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              Datos del Cliente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-[var(--muted)] rounded-xl">
                <User className="w-5 h-5 text-[var(--muted-foreground)]" />
                <div>
                  <p className="text-xs text-[var(--muted-foreground)] uppercase">Nombre</p>
                  <p className="font-medium text-[var(--foreground)]">{cotizacion.cliente_nombre}</p>
                </div>
              </div>
              {cotizacion.cliente_email && (
                <div className="flex items-center gap-3 p-4 bg-[var(--muted)] rounded-xl">
                  <Mail className="w-5 h-5 text-[var(--muted-foreground)]" />
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)] uppercase">Email</p>
                    <p className="font-medium text-[var(--foreground)]">{cotizacion.cliente_email}</p>
                  </div>
                </div>
              )}
              {cotizacion.cliente_telefono && (
                <div className="flex items-center gap-3 p-4 bg-[var(--muted)] rounded-xl">
                  <Phone className="w-5 h-5 text-[var(--muted-foreground)]" />
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)] uppercase">Teléfono</p>
                    <p className="font-medium text-[var(--foreground)]">{cotizacion.cliente_telefono}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Detalles */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Detalles de la Cotización
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-[var(--muted)] rounded-xl">
                <p className="text-xs text-[var(--muted-foreground)] uppercase font-black mb-1">Pasajeros</p>
                <p className="text-xl font-black text-[var(--foreground)]">{cotizacion.num_pasajeros}</p>
              </div>
              <div className="p-4 bg-[var(--muted)] rounded-xl">
                <p className="text-xs text-[var(--muted-foreground)] uppercase font-black mb-1">Habitación</p>
                <p className="text-xl font-black text-[var(--foreground)] capitalize">{cotizacion.tipo_habitacion}</p>
              </div>
              <div className="p-4 bg-[var(--muted)] rounded-xl">
                <p className="text-xs text-[var(--muted-foreground)] uppercase font-black mb-1">Paquete</p>
                <p className="text-sm font-black text-[var(--foreground)]">{cotizacion.paquete_nombre || 'N/A'}</p>
              </div>
              <div className="p-4 bg-[var(--muted)] rounded-xl">
                <p className="text-xs text-[var(--muted-foreground)] uppercase font-black mb-1">Fecha Salida</p>
                <p className="text-sm font-black text-[var(--foreground)]">
                  {cotizacion.fecha_salida 
                    ? new Date(cotizacion.fecha_salida).toLocaleDateString('es-AR')
                    : 'A definir'
                  }
                </p>
              </div>
            </div>
          </div>

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

            {cotizacion.estado === 'pendiente' && (
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

            {cotizacion.estado === 'convertida' && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-green-400 font-medium">Cotización convertida a venta</p>
                <p className="text-[var(--muted-foreground)] text-sm mt-1">
                  {cotizacion.fecha_conversion && 
                    `El ${new Date(cotizacion.fecha_conversion).toLocaleDateString('es-AR')}`
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Aprobar */}
      {showAprobarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-md rounded-3xl p-8">
            <h3 className="text-2xl font-black text-[var(--foreground)] mb-4">Aprobar Cotización</h3>
            <p className="text-[var(--muted-foreground)] mb-6">
              ¿Estás seguro de aprobar esta cotización? El vendedor podrá convertirla en venta.
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
          <div className="glass-card w-full max-w-md rounded-3xl p-8">
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
    </div>
  );
}
