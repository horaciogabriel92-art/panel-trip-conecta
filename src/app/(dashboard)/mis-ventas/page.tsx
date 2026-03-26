"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  Clock,
  DollarSign,
  Calendar,
  FileText,
  Download
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import Link from 'next/link';

interface Venta {
  id: string;
  codigo: string;
  cliente_nombre: string;
  paquete_nombre: string;
  precio_total: number;
  comision_monto: number;
  comision_estado: 'pendiente' | 'pagada';
  estado: 'confirmada' | 'en_proceso' | 'emitida' | 'cancelada' | 'reembolsada';
  fecha_creacion: string;
  fecha_salida?: string;
  num_pasajeros: number;
  tiene_documentos?: boolean;
}

export default function MisVentas() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  useEffect(() => {
    fetchVentas();
  }, []);

  const fetchVentas = async () => {
    try {
      const res = await api.get('/ventas');
      setVentas(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'emitida': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'confirmada': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'en_proceso': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'cancelada': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'reembolsada': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default: return 'bg-slate-500/10 text-[var(--muted-foreground)] border-slate-500/20';
    }
  };

  const filteredVentas = filtroEstado === 'todos' 
    ? ventas 
    : ventas.filter(v => v.estado === filtroEstado);

  const stats = {
    total: ventas.length,
    confirmadas: ventas.filter(v => v.estado === 'confirmada').length,
    emitidas: ventas.filter(v => v.estado === 'emitida').length,
    comisionPendiente: ventas
      .filter(v => v.comision_estado === 'pendiente')
      .reduce((sum, v) => sum + (v.comision_monto || 0), 0),
    comisionPagada: ventas
      .filter(v => v.comision_estado === 'pagada')
      .reduce((sum, v) => sum + (v.comision_monto || 0), 0)
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-[var(--foreground)]">Mis Ventas</h2>
          <p className="text-[var(--muted-foreground)]">Historial de ventas confirmadas y comisiones</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-sm text-[var(--muted-foreground)] mb-1">Total Ventas</p>
          <p className="text-3xl font-black text-[var(--foreground)]">{stats.total}</p>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-sm text-[var(--muted-foreground)] mb-1">Confirmadas</p>
          <p className="text-3xl font-black text-blue-400">{stats.confirmadas}</p>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-sm text-[var(--muted-foreground)] mb-1">Emitidas</p>
          <p className="text-3xl font-black text-green-400">{stats.emitidas}</p>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-sm text-[var(--muted-foreground)] mb-1">Comisión Pendiente</p>
          <p className="text-3xl font-black text-orange-400">${formatCurrency(stats.comisionPendiente)}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {['todos', 'confirmada', 'en_proceso', 'emitida'].map((estado) => (
          <button
            key={estado}
            onClick={() => setFiltroEstado(estado)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize",
              filtroEstado === estado 
                ? 'bg-blue-600 text-[var(--foreground)]' 
                : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]'
            )}
          >
            {estado === 'todos' ? 'Todas' : estado.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Lista de ventas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVentas.map((venta) => (
          <div key={venta.id} className="glass-card rounded-[2.5rem] p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
                  {venta.codigo}
                </span>
                <h3 className="text-lg font-black text-[var(--foreground)] leading-tight">
                  {venta.paquete_nombre || 'Paquete'}
                </h3>
              </div>
              <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-black uppercase border",
                getStatusColor(venta.estado)
              )}>
                {venta.estado.replace('_', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] text-[var(--muted-foreground)] uppercase font-black">Cliente</p>
                <p className="text-sm font-bold text-[var(--muted-foreground)]">{venta.cliente_nombre}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-[var(--muted-foreground)] uppercase font-black">Pasajeros</p>
                <p className="text-sm font-black text-blue-400">{venta.num_pasajeros}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-[var(--muted-foreground)] uppercase font-black">Total Venta</p>
                <p className="text-lg font-black text-[var(--foreground)]">${formatCurrency(venta.precio_total)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-[var(--muted-foreground)] uppercase font-black">Tu Comisión</p>
                <p className="text-lg font-black text-green-400">${formatCurrency(venta.comision_monto)}</p>
                <span className={cn(
                  "text-[10px] uppercase font-bold",
                  venta.comision_estado === 'pagada' ? 'text-green-400' : 'text-orange-400'
                )}>
                  {venta.comision_estado}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(venta.fecha_creacion).toLocaleDateString()}</span>
              </div>
              <Link 
                href={`/mis-ventas/${venta.id}`}
                className="text-xs font-black text-[var(--foreground)] hover:text-blue-400 border border-[var(--border)] hover:border-blue-500/50 px-4 py-2 rounded-xl transition-all flex items-center gap-2"
              >
                {venta.tiene_documentos && <FileText className="w-3.5 h-3.5" />}
                VER DETALLE
              </Link>
            </div>
          </div>
        ))}

        {filteredVentas.length === 0 && !isLoading && (
          <div className="col-span-full py-20 bg-[var(--muted)] rounded-3xl border border-dashed border-[var(--border)] flex flex-col items-center justify-center text-[var(--muted-foreground)] space-y-4">
            <ShoppingCart className="w-12 h-12 opacity-20" />
            <p className="font-medium italic">Aún no tienes ventas registradas.</p>
            <Link href="/paquetes" className="text-blue-400 hover:underline">
              Ir al catálogo para cotizar
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
