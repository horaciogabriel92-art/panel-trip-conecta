"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { 
  FileText, 
  Plus, 
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  DollarSign
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import Link from 'next/link';

interface Cotizacion {
  id: string;
  codigo: string;
  cliente_nombre: string;
  paquete_nombre: string;
  precio_total: number;
  estado: 'pendiente' | 'respondida' | 'convertida' | 'vencida' | 'cancelada';
  fecha_creacion: string;
  num_pasajeros: number;
}

// Estados simplificados: Pidió cotización, Respondió cotización, Cierre
const COLUMNAS = [
  { 
    id: 'pendiente', 
    label: 'Pidió Cotización', 
    color: 'bg-orange-500/10 border-orange-500/20',
    icon: Clock
  },
  { 
    id: 'respondida', 
    label: 'Respondió Cotización', 
    color: 'bg-blue-500/10 border-blue-500/20',
    icon: CheckCircle
  },
  { 
    id: 'cerrada', 
    label: 'Cierre', 
    color: 'bg-green-500/10 border-green-500/20',
    icon: DollarSign
  }
];

export default function CotizacionesCRM() {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const getColumnaCotizacion = (c: Cotizacion) => {
    if (c.estado === 'convertida') return 'cerrada';
    if (c.estado === 'cancelada') return 'cerrada';
    if (c.estado === 'respondida') return 'respondida';
    return 'pendiente';
  };

  const moverCotizacion = async (id: string, nuevoEstado: string) => {
    try {
      const estadoBD = nuevoEstado === 'cerrada' ? 'convertida' : nuevoEstado;
      await api.put(`/cotizaciones/${id}`, { estado: estadoBD });
      fetchCotizaciones();
    } catch (err) {
      alert('Error al mover cotización');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-black text-white">Mis Cotizaciones</h2>
          <p className="text-slate-400">Gestiona tus cotizaciones y seguimiento de clientes</p>
        </div>
        <Link 
          href="/paquetes"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nueva Cotización
        </Link>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {COLUMNAS.map((columna) => {
          const cotizacionesColumna = cotizaciones.filter(
            c => getColumnaCotizacion(c) === columna.id
          );
          const Icon = columna.icon;

          return (
            <div 
              key={columna.id} 
              className={cn(
                "glass-card rounded-3xl flex flex-col overflow-hidden",
                columna.color
              )}
            >
              {/* Column Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-white" />
                  <h3 className="font-bold text-white">{columna.label}</h3>
                </div>
                <span className="px-2 py-1 bg-white/10 rounded-lg text-sm font-bold text-white">
                  {cotizacionesColumna.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                {cotizacionesColumna.map((c) => (
                  <div 
                    key={c.id} 
                    className="bg-black/40 rounded-2xl p-4 space-y-3 hover:bg-black/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">
                        {c.codigo}
                      </span>
                      <span className="text-lg font-black text-white">
                        ${formatCurrency(c.precio_total)}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-white">{c.cliente_nombre}</h4>
                      <p className="text-sm text-slate-400">{c.paquete_nombre}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{c.num_pasajeros} pasajeros</span>
                      <span>{new Date(c.fecha_creacion).toLocaleDateString()}</span>
                    </div>

                    {/* Acciones */}
                    <div className="pt-3 border-t border-white/10 flex gap-2">
                      {columna.id === 'pendiente' && (
                        <button
                          onClick={() => moverCotizacion(c.id, 'respondida')}
                          className="flex-1 py-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          RESPONDÍ
                        </button>
                      )}
                      
                      {columna.id === 'respondida' && (
                        <>
                          <button
                            onClick={() => moverCotizacion(c.id, 'pendiente')}
                            className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl text-xs font-bold transition-all"
                          >
                            VOLVER
                          </button>
                          <Link
                            href={`/cotizaciones/${c.id}`}
                            className="flex-1 py-2 bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded-xl text-xs font-bold transition-all text-center"
                          >
                            CERRAR VENTA
                          </Link>
                        </>
                      )}

                      {columna.id === 'cerrada' && (
                        <Link
                          href={c.estado === 'convertida' ? `/mis-ventas` : `/cotizaciones/${c.id}`}
                          className="w-full py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold transition-all text-center"
                        >
                          {c.estado === 'convertida' ? 'VER VENTA' : 'VER DETALLE'}
                        </Link>
                      )}

                      <Link
                        href={`/cotizaciones/${c.id}`}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                      >
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </Link>
                    </div>
                  </div>
                ))}

                {cotizacionesColumna.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Sin cotizaciones</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
