"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { 
  ShoppingCart, 
  Search, 
  Eye, 
  FileText,
  DollarSign,
  Calendar,
  User,
  Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Venta {
  id: string;
  codigo: string;
  cliente_nombre: string;
  vendedor_nombre?: string;
  paquete_nombre: string;
  precio_total: number;
  comision_monto: number;
  comision_estado: 'pendiente' | 'pagada';
  estado: string;
  fecha_creacion: string;
  num_pasajeros: number;
  tiene_documentos?: boolean;
}

export default function AdminVentas() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const filteredVentas = ventas.filter(v => 
    v.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.vendedor_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.paquete_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: ventas.length,
    montoTotal: ventas.reduce((sum, v) => sum + v.precio_total, 0),
    comisionesPendientes: ventas
      .filter(v => v.comision_estado === 'pendiente')
      .reduce((sum, v) => sum + v.comision_monto, 0),
    comisionesPagadas: ventas
      .filter(v => v.comision_estado === 'pagada')
      .reduce((sum, v) => sum + v.comision_monto, 0)
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white">Gestión de Ventas</h2>
          <p className="text-slate-400">Administra todas las ventas y emite documentos</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-sm text-slate-400 mb-1">Total Ventas</p>
          <p className="text-3xl font-black text-white">{stats.total}</p>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-sm text-slate-400 mb-1">Monto Total</p>
          <p className="text-3xl font-black text-blue-400">${stats.montoTotal.toLocaleString()}</p>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-sm text-slate-400 mb-1">Comisiones Pendientes</p>
          <p className="text-3xl font-black text-orange-400">${stats.comisionesPendientes.toLocaleString()}</p>
        </div>
        <div className="glass-card p-6 rounded-2xl">
          <p className="text-sm text-slate-400 mb-1">Comisiones Pagadas</p>
          <p className="text-3xl font-black text-green-400">${stats.comisionesPagadas.toLocaleString()}</p>
        </div>
      </div>

      {/* Buscador */}
      <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
        <Search className="w-5 h-5 text-slate-500" />
        <input 
          type="text" 
          placeholder="Buscar por código, cliente, vendedor..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none outline-none text-sm w-full text-slate-300" 
        />
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
                <th className="text-left p-4 text-xs font-black text-slate-400 uppercase">Total</th>
                <th className="text-left p-4 text-xs font-black text-slate-400 uppercase">Comisión</th>
                <th className="text-left p-4 text-xs font-black text-slate-400 uppercase">Estado</th>
                <th className="text-left p-4 text-xs font-black text-slate-400 uppercase">Docs</th>
                <th className="text-left p-4 text-xs font-black text-slate-400 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredVentas.map((v) => (
                <tr key={v.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                  <td className="p-4">
                    <span className="text-blue-400 font-mono text-sm">{v.codigo}</span>
                  </td>
                  <td className="p-4 text-white">{v.cliente_nombre}</td>
                  <td className="p-4 text-slate-300">{v.paquete_nombre || '-'}</td>
                  <td className="p-4 text-slate-300">{v.vendedor_nombre || '-'}</td>
                  <td className="p-4">
                    <span className="text-white font-bold">${v.precio_total.toLocaleString()}</span>
                  </td>
                  <td className="p-4">
                    <div>
                      <span className="text-green-400">${v.comision_monto.toLocaleString()}</span>
                      <span className={cn(
                        "ml-2 text-xs uppercase",
                        v.comision_estado === 'pagada' ? 'text-green-400' : 'text-orange-400'
                      )}>
                        ({v.comision_estado})
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-black uppercase border",
                      getStatusColor(v.estado)
                    )}>
                      {v.estado.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    {v.tiene_documentos ? (
                      <span className="text-green-400 text-sm">✓</span>
                    ) : (
                      <span className="text-slate-500 text-sm">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    <Link 
                      href={`/admin/ventas/${v.id}`}
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

        {filteredVentas.length === 0 && !isLoading && (
          <div className="py-20 text-center text-slate-500">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No se encontraron ventas</p>
          </div>
        )}
      </div>
    </div>
  );
}
