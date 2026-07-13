"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useFeature } from '@/hooks/useFeature';
import {
  ShoppingCart,
  Search,
  Eye,
  DollarSign,
  Users,
  Calendar,
  FileText,
  Package,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import Link from 'next/link';

interface Venta {
  id: string;
  codigo: string;
  cotizacion_id?: string;
  cotizacion_codigo?: string;
  cotizacion_estado?: string;
  cliente_nombre: string;
  cliente_email?: string;
  vendedor_id?: string;
  vendedor_nombre?: string;
  paquete_nombre?: string;
  num_pasajeros: number;
  precio_total: number;
  monto_pagado?: number;
  monto_restante?: number;
  tipo_pago?: 'total' | 'parcial' | 'pendiente';
  estado: 'confirmada' | 'en_proceso' | 'emitida' | 'cancelada' | 'reembolsada';
  comision_estado: 'pendiente' | 'pagada';
  comision_monto: number;
  fecha_creacion: string;
}

const estadosVenta: { key: Venta['estado']; label: string; color: string; icon: any }[] = [
  { key: 'confirmada', label: 'Confirmada', color: 'bg-green-500/10 text-green-400 border-green-500/20', icon: CheckCircle },
  { key: 'en_proceso', label: 'En proceso', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Clock },
  { key: 'emitida', label: 'Emitida', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: FileText },
  { key: 'cancelada', label: 'Cancelada', color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: XCircle },
  { key: 'reembolsada', label: 'Reembolsada', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20', icon: AlertCircle },
];

export default function AdminVentas() {
  const { error: toastError } = useToast();
  const { enabled: comisionesEnabled } = useFeature('comisiones');
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVentas();
  }, []);

  const fetchVentas = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/ventas');
      setVentas(res.data || []);
    } catch (err) {
      console.error(err);
      toastError('Error al cargar las ventas', 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const config = estadosVenta.find(e => e.key === estado);
    if (!config) return <span className="px-2 py-1 rounded-full text-xs font-bold border bg-slate-500/10 text-slate-400 border-slate-500/20">{estado}</span>;
    const Icon = config.icon;
    return (
      <span className={cn("px-2 py-1 rounded-full text-xs font-bold border flex items-center gap-1 w-fit", config.color)}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const getPagoBadge = (tipo?: string) => {
    if (tipo === 'total') return <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-bold">Pago total</span>;
    if (tipo === 'parcial') return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full font-bold">Pago parcial</span>;
    return <span className="px-2 py-1 bg-slate-500/20 text-slate-400 text-xs rounded-full font-bold">Pendiente</span>;
  };

  const filteredVentas = ventas.filter(v => {
    const matchesEstado = filtroEstado === 'todos' || v.estado === filtroEstado;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      v.codigo.toLowerCase().includes(term) ||
      (v.cotizacion_codigo || '').toLowerCase().includes(term) ||
      v.cliente_nombre.toLowerCase().includes(term) ||
      (v.cliente_email || '').toLowerCase().includes(term) ||
      (v.vendedor_nombre || '').toLowerCase().includes(term) ||
      (v.paquete_nombre || '').toLowerCase().includes(term);
    return matchesEstado && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-700 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/admin" className="p-2 bg-[var(--muted)] rounded-xl hover:bg-[var(--muted)] transition-all">
          <ArrowLeft className="w-5 h-5 text-[var(--muted-foreground)]" />
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-black text-[var(--foreground)] flex items-center gap-3">
            <ShoppingCart className="w-7 h-7 text-blue-400" />
            Ventas
          </h2>
          <p className="text-[var(--muted-foreground)] text-sm">
            {ventas.length} ventas registradas
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
            <input
              type="text"
              placeholder="Buscar por código, cliente, vendedor o paquete..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="bg-[var(--muted)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)] outline-none focus:border-blue-500"
          >
            <option value="todos">Todos los estados</option>
            {estadosVenta.map(e => (
              <option key={e.key} value={e.key}>{e.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredVentas.length === 0 ? (
        <div className="glass-card rounded-2xl py-20 text-center text-[var(--muted-foreground)]">
          <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>No se encontraron ventas</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs uppercase text-[var(--muted-foreground)]">
                  <th className="px-4 py-3 font-bold">Venta / Cotización</th>
                  <th className="px-4 py-3 font-bold">Cliente</th>
                  <th className="px-4 py-3 font-bold">Vendedor</th>
                  <th className="px-4 py-3 font-bold">Paquete</th>
                  <th className="px-4 py-3 font-bold">Monto / Pago</th>
                  {comisionesEnabled && <th className="px-4 py-3 font-bold">Comisión</th>}
                  <th className="px-4 py-3 font-bold">Estado</th>
                  <th className="px-4 py-3 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredVentas.map((venta) => (
                  <tr key={venta.id} className="hover:bg-[var(--muted)]/50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <p className="font-bold text-[var(--foreground)]">{venta.codigo}</p>
                        {venta.cotizacion_codigo && (
                          <p className="text-xs text-[var(--muted-foreground)]">COT: {venta.cotizacion_codigo}</p>
                        )}
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {new Date(venta.fecha_creacion).toLocaleDateString('es-AR')}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-[var(--foreground)] font-medium">{venta.cliente_nombre}</p>
                      {venta.cliente_email && (
                        <p className="text-xs text-[var(--muted-foreground)]">{venta.cliente_email}</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                        <Users className="w-4 h-4 text-[var(--muted-foreground)]" />
                        {venta.vendedor_nombre || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-start gap-2 text-sm text-[var(--foreground)]">
                        <Package className="w-4 h-4 text-[var(--muted-foreground)] mt-0.5" />
                        <div>
                          <p>{venta.paquete_nombre || 'N/A'}</p>
                          <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {venta.num_pasajeros} pasajeros
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        <p className="font-bold text-blue-400">${formatCurrency(venta.precio_total)}</p>
                        {getPagoBadge(venta.tipo_pago)}
                      </div>
                    </td>
                    {comisionesEnabled && (
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <p className="text-sm text-[var(--foreground)]">${formatCurrency(venta.comision_monto)}</p>
                          {venta.comision_estado === 'pagada' ? (
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full font-bold">Pagada</span>
                          ) : (
                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full font-bold">Pendiente</span>
                          )}
                        </div>
                      </td>
                    )}
                    <td className="px-4 py-4">
                      {getEstadoBadge(venta.estado)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        href={`/admin/ventas/${venta.id}`}
                        className="inline-flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-all"
                      >
                        <Eye className="w-4 h-4" />
                        Ver
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
