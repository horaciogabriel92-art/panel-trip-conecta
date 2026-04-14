"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { 
  FileText, 
  Search, 
  Eye, 
  Trash2,
  Plus
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { AdminNuevaCotizacionModal } from '@/components/cotizaciones/AdminNuevaCotizacionModal';

interface Cotizacion {
  id: string;
  codigo: string;
  cliente_nombre: string;
  cliente_email: string;
  vendedor_nombre?: string;
  paquete_nombre?: string;
  precio_total: number;
  comision_vendedor?: number;
  estado: 'pendiente' | 'convertida' | 'vencida' | 'cancelada';
  fecha_creacion: string;
  num_pasajeros: number;
}

export default function AdminCotizaciones() {
  const { error: toastError } = useToast();
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cotizacionToDelete, setCotizacionToDelete] = useState<Cotizacion | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showNuevaModal, setShowNuevaModal] = useState(false);

  useEffect(() => {
    fetchCotizaciones();
  }, []);

  const fetchCotizaciones = async () => {
    try {
      const res = await api.get('/cotizaciones');
      setCotizaciones(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'convertida': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20';
      case 'pendiente': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20';
      case 'vencida': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20';
      case 'cancelada': return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20';
      default: return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
    }
  };

  const filteredCotizaciones = cotizaciones.filter(c => {
    const matchesEstado = filtroEstado === 'todos' || c.estado === filtroEstado;
    const matchesSearch = 
      c.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.vendedor_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.paquete_nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesEstado && matchesSearch;
  });

  const stats = {
    total: cotizaciones.length,
    pendientes: cotizaciones.filter(c => c.estado === 'pendiente').length,
    convertidas: cotizaciones.filter(c => c.estado === 'convertida').length,
    montoTotal: cotizaciones.reduce((sum, c) => sum + (c.precio_total || 0), 0)
  };

  const abrirModalEliminar = (c: Cotizacion) => {
    setCotizacionToDelete(c);
    setShowDeleteModal(true);
  };

  const eliminarCotizacion = async () => {
    if (!cotizacionToDelete) return;
    
    setIsDeleting(true);
    try {
      await api.delete(`/cotizaciones/${cotizacionToDelete.id}`);
      setShowDeleteModal(false);
      setCotizacionToDelete(null);
      fetchCotizaciones();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Error al eliminar la cotización';
      toastError(errorMsg, 'Error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-[var(--foreground)]">Gestión de Cotizaciones</h2>
          <p className="text-[var(--muted-foreground)]">Revisa y administra todas las cotizaciones del sistema</p>
        </div>
        <button
          onClick={() => setShowNuevaModal(true)}
          className="btn-primary px-6 py-3"
        >
          <Plus className="w-5 h-5" />
          Nueva Cotización
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-sm text-[var(--muted-foreground)] mb-1">Total Cotizaciones</p>
          <p className="text-3xl font-black text-[var(--foreground)]">{stats.total}</p>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-sm text-[var(--muted-foreground)] mb-1">Pendientes</p>
          <p className="text-3xl font-black text-orange-500">{stats.pendientes}</p>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-sm text-[var(--muted-foreground)] mb-1">Convertidas</p>
          <p className="text-3xl font-black text-green-500">{stats.convertidas}</p>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-sm text-[var(--muted-foreground)] mb-1">Monto Total</p>
          <p className="text-3xl font-black text-blue-500">${formatCurrency(stats.montoTotal)}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex items-center gap-3 bg-[var(--card)] border border-[var(--border)] rounded-2xl px-4 py-3 flex-1">
          <Search className="w-5 h-5 text-[var(--muted-foreground)]" />
          <input 
            type="text" 
            placeholder="Buscar por código, cliente, vendedor..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]" 
          />
        </div>
        <div className="flex gap-2">
          {['todos', 'pendiente', 'convertida', 'vencida', 'cancelada'].map((estado) => (
            <button
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize",
                filtroEstado === estado 
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' 
                  : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--border)]'
              )}
            >
              {estado}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Código</th>
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Cliente</th>
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Paquete</th>
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Vendedor</th>
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Pasajeros</th>
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Total</th>
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Estado</th>
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Fecha</th>
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCotizaciones.map((c) => (
                <tr key={c.id} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/50 transition-all">
                  <td className="p-4">
                    <span className="text-blue-500 font-mono text-sm font-bold">{c.codigo}</span>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-[var(--foreground)]">{c.cliente_nombre}</p>
                      {c.cliente_email && (
                        <p className="text-xs text-[var(--muted-foreground)]">{c.cliente_email}</p>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-[var(--foreground)]">{c.paquete_nombre || '-'}</td>
                  <td className="p-4 text-[var(--foreground)]">{c.vendedor_nombre || '-'}</td>
                  <td className="p-4">
                    <span className="text-[var(--foreground)] font-medium">{c.num_pasajeros}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-blue-500 font-bold">${formatCurrency(c.precio_total)}</span>
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-black uppercase border",
                      getStatusColor(c.estado)
                    )}>
                      {c.estado}
                    </span>
                  </td>
                  <td className="p-4 text-[var(--muted-foreground)] text-sm">
                    {new Date(c.fecha_creacion).toLocaleDateString('es-AR')}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Link 
                        href={`/admin/cotizaciones/${c.id}`}
                        className="p-2 bg-[var(--muted)] rounded-lg hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] transition-all inline-flex"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      {c.estado !== 'convertida' && (
                        <button
                          onClick={() => abrirModalEliminar(c)}
                          className="p-2 bg-[var(--muted)] rounded-lg hover:bg-red-500 hover:text-white transition-all inline-flex"
                          title="Eliminar cotización"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCotizaciones.length === 0 && !isLoading && (
          <div className="py-20 text-center text-[var(--muted-foreground)]">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No se encontraron cotizaciones</p>
          </div>
        )}
      </div>

      {/* Modal Eliminar Cotización */}
      {showDeleteModal && cotizacionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-md rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-xl font-black text-[var(--foreground)]">¿Eliminar Cotización?</h3>
                <p className="text-sm text-[var(--muted-foreground)]">{cotizacionToDelete.codigo}</p>
              </div>
            </div>

            <div className="mb-4 p-3 bg-[var(--muted)] rounded-lg">
              <p className="text-sm text-[var(--foreground)]">
                <strong>Cliente:</strong> {cotizacionToDelete.cliente_nombre}
              </p>
              <p className="text-sm text-[var(--foreground)]">
                <strong>Vendedor:</strong> {cotizacionToDelete.vendedor_nombre || '-'}
              </p>
              <p className="text-sm text-[var(--foreground)]">
                <strong>Total:</strong> ${formatCurrency(cotizacionToDelete.precio_total)}
              </p>
              <p className="text-sm text-[var(--foreground)]">
                <strong>Estado:</strong> {cotizacionToDelete.estado}
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-4 bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
                <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-2">
                  ⚠️ Advertencia de eliminación permanente
                </p>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  Si eliminas esta cotización, <strong>todos los datos serán permanentemente eliminados</strong> de la base de datos. 
                  Esta acción <strong>no se puede deshacer</strong>.
                </p>
              </div>
              
              <p className="text-xs text-[var(--muted-foreground)] text-center">
                ¿Estás seguro de que deseas continuar?
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setCotizacionToDelete(null);
                }}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl bg-[var(--muted)] hover:bg-[var(--border)] disabled:opacity-50 text-[var(--foreground)] font-medium transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={eliminarCotizacion}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold transition-all flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Sí, Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nueva Cotización */}
      <AdminNuevaCotizacionModal 
        isOpen={showNuevaModal} 
        onClose={() => setShowNuevaModal(false)} 
      />
    </div>
  );
}
