"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle,
  Clock,
  ArrowRight,
  User,
  DollarSign,
  Calendar
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import Link from 'next/link';

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
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');

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
      case 'convertida': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'pendiente': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'vencida': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'cancelada': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
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

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white">Gestión de Cotizaciones</h2>
          <p className="text-slate-400">Revisa y administra todas las cotizaciones del sistema</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-sm text-slate-400 mb-1">Total Cotizaciones</p>
          <p className="text-3xl font-black text-white">{stats.total}</p>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-sm text-slate-400 mb-1">Pendientes</p>
          <p className="text-3xl font-black text-orange-400">{stats.pendientes}</p>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-sm text-slate-400 mb-1">Convertidas</p>
          <p className="text-3xl font-black text-green-400">{stats.convertidas}</p>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-sm text-slate-400 mb-1">Monto Total</p>
          <p className="text-3xl font-black text-blue-400">${formatCurrency(stats.montoTotal)}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex-1">
          <Search className="w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Buscar por código, cliente, vendedor..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-sm w-full text-slate-300" 
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
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white/5 text-slate-400 hover:bg-white/10'
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
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-xs font-black text-slate-400 uppercase">Código</th>
                <th className="text-left p-4 text-xs font-black text-slate-400 uppercase">Cliente</th>
                <th className="text-left p-4 text-xs font-black text-slate-400 uppercase">Paquete</th>
                <th className="text-left p-4 text-xs font-black text-slate-400 uppercase">Vendedor</th>
                <th className="text-left p-4 text-xs font-black text-slate-400 uppercase">Pasajeros</th>
                <th className="text-left p-4 text-xs font-black text-slate-400 uppercase">Total</th>
                <th className="text-left p-4 text-xs font-black text-slate-400 uppercase">Estado</th>
                <th className="text-left p-4 text-xs font-black text-slate-400 uppercase">Fecha</th>
                <th className="text-left p-4 text-xs font-black text-slate-400 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCotizaciones.map((c) => (
                <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                  <td className="p-4">
                    <span className="text-blue-400 font-mono text-sm">{c.codigo}</span>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-white">{c.cliente_nombre}</p>
                      {c.cliente_email && (
                        <p className="text-xs text-slate-400">{c.cliente_email}</p>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-slate-300">{c.paquete_nombre || '-'}</td>
                  <td className="p-4 text-slate-300">{c.vendedor_nombre || '-'}</td>
                  <td className="p-4">
                    <span className="text-white font-medium">{c.num_pasajeros}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-blue-400 font-bold">${formatCurrency(c.precio_total)}</span>
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-black uppercase border",
                      getStatusColor(c.estado)
                    )}>
                      {c.estado}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 text-sm">
                    {new Date(c.fecha_creacion).toLocaleDateString('es-AR')}
                  </td>
                  <td className="p-4">
                    <Link 
                      href={`/admin/cotizaciones/${c.id}`}
                      className="p-2 bg-white/5 rounded-lg hover:bg-blue-600 transition-all inline-flex"
                    >
                      <Eye className="w-4 h-4 text-slate-300" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCotizaciones.length === 0 && !isLoading && (
          <div className="py-20 text-center text-slate-500">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No se encontraron cotizaciones</p>
          </div>
        )}
      </div>
    </div>
  );
}
