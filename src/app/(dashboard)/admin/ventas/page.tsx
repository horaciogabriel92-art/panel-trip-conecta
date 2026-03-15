"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { ShoppingCart, Search, Filter, Calendar, User, DollarSign, CheckCircle, Clock, XCircle, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Venta {
  id: string;
  codigo: string;
  cliente_nombre: string;
  cliente_email: string;
  paquete_nombre: string;
  fecha_salida: string;
  num_pasajeros: number;
  precio_total: number;
  comision_monto: number;
  comision_estado: 'pendiente' | 'pagada';
  estado: 'confirmada' | 'en_proceso' | 'emitida' | 'cancelada';
  fecha_creacion: string;
  vendedor?: {
    nombre: string;
    apellido: string;
  };
}

const statusColors: Record<string, string> = {
  confirmada: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  en_proceso: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  emitida: 'bg-green-500/10 text-green-400 border-green-500/20',
  cancelada: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const statusLabels: Record<string, string> = {
  confirmada: 'Confirmada',
  en_proceso: 'En Proceso',
  emitida: 'Emitida',
  cancelada: 'Cancelada',
};

export default function VentasAdmin() {
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
      console.error('Error fetching ventas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const ventasFiltradas = filtroEstado === 'todos' 
    ? ventas 
    : ventas.filter(v => v.estado === filtroEstado);

  const totalVentas = ventas.reduce((sum, v) => sum + v.precio_total, 0);
  const totalComisiones = ventas.reduce((sum, v) => sum + v.comision_monto, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-3xl">
          <p className="text-sm text-slate-400 font-medium mb-1">Total Ventas</p>
          <p className="text-3xl font-black text-white">{ventas.length}</p>
        </div>
        <div className="glass-card p-6 rounded-3xl">
          <p className="text-sm text-slate-400 font-medium mb-1">Monto Total</p>
          <p className="text-3xl font-black text-blue-400">${totalVentas.toLocaleString()}</p>
        </div>
        <div className="glass-card p-6 rounded-3xl">
          <p className="text-sm text-slate-400 font-medium mb-1">Comisiones</p>
          <p className="text-3xl font-black text-purple-400">${totalComisiones.toLocaleString()}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white">Todas las Ventas</h2>
          <p className="text-slate-400">Historial completo de ventas del sistema</p>
        </div>
        <button className="bg-white/5 hover:bg-white/10 text-white font-medium px-6 py-3 rounded-2xl transition-all flex items-center gap-2">
          <Download className="w-5 h-5" />
          Exportar
        </button>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2 max-w-md">
            <Search className="w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Buscar venta..." 
              className="bg-transparent border-none outline-none text-sm w-full text-slate-300" 
            />
          </div>
          <div className="flex gap-2">
            {['todos', 'confirmada', 'en_proceso', 'emitida'].map((estado) => (
              <button
                key={estado}
                onClick={() => setFiltroEstado(estado)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize",
                  filtroEstado === estado 
                    ? "bg-blue-600 text-white" 
                    : "bg-white/5 text-slate-400 hover:bg-white/10"
                )}
              >
                {estado === 'todos' ? 'Todos' : statusLabels[estado]}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/2 text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-black">Código</th>
                <th className="px-6 py-4 font-black">Cliente</th>
                <th className="px-6 py-4 font-black">Paquete</th>
                <th className="px-6 py-4 font-black">Vendedor</th>
                <th className="px-6 py-4 font-black">Monto</th>
                <th className="px-6 py-4 font-black">Comisión</th>
                <th className="px-6 py-4 font-black">Estado</th>
                <th className="px-6 py-4 font-black">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {ventasFiltradas.map((v) => (
                <tr key={v.id} className="hover:bg-white/2 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-slate-300">{v.codigo}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-white">{v.cliente_nombre}</p>
                    <p className="text-xs text-slate-500">{v.cliente_email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-300">{v.paquete_nombre}</p>
                    <p className="text-xs text-slate-500">{v.num_pasajeros} pasajeros</p>
                  </td>
                  <td className="px-6 py-4">
                    {v.vendedor ? (
                      <p className="text-sm text-slate-300">
                        {v.vendedor.nombre} {v.vendedor.apellido}
                      </p>
                    ) : (
                      <span className="text-xs text-slate-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-white">${v.precio_total.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-purple-400">${v.comision_monto.toLocaleString()}</span>
                      {v.comision_estado === 'pagada' ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Clock className="w-4 h-4 text-yellow-400" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border",
                      statusColors[v.estado]
                    )}>
                      {statusLabels[v.estado]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">
                    {new Date(v.fecha_creacion).toLocaleDateString('es-UY')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isLoading && (
            <div className="p-20 flex justify-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
