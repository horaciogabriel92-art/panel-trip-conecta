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
  DollarSign,
  Send,
  RotateCcw,
  AlertTriangle
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
  fecha_envio?: string;
  fecha_vencimiento?: string;
  num_pasajeros: number;
  notas?: string;
}

// Pipeline correcto: Nueva → Enviada → Vendida/Perdida
const COLUMNAS = [
  { 
    id: 'pendiente', 
    label: 'Nueva', 
    description: 'Creada, pendiente de enviar',
    color: 'bg-slate-500/10 border-slate-500/20',
    icon: FileText
  },
  { 
    id: 'respondida', 
    label: 'Enviada', 
    description: 'Enviada al cliente',
    color: 'bg-blue-500/10 border-blue-500/20',
    icon: Send
  },
  { 
    id: 'vendida', 
    label: 'Vendida', 
    description: 'Convertida en venta',
    color: 'bg-green-500/10 border-green-500/20',
    icon: DollarSign
  },
  { 
    id: 'perdida', 
    label: 'Perdida', 
    description: 'No se concretó',
    color: 'bg-red-500/10 border-red-500/20',
    icon: XCircle
  }
];

export default function CotizacionesCRM() {
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPerdidaModal, setShowPerdidaModal] = useState(false);
  const [cotizacionPerdida, setCotizacionPerdida] = useState<Cotizacion | null>(null);
  const [motivoPerdida, setMotivoPerdida] = useState('');

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
    if (c.estado === 'convertida') return 'vendida';
    if (c.estado === 'cancelada') return 'perdida';
    return c.estado;
  };

  const marcarComoEnviada = async (id: string) => {
    try {
      await api.put(`/cotizaciones/${id}`, { 
        estado: 'respondida',
        fecha_envio: new Date().toISOString()
      });
      fetchCotizaciones();
    } catch (err) {
      alert('Error al marcar como enviada');
    }
  };

  const abrirModalPerdida = (c: Cotizacion) => {
    setCotizacionPerdida(c);
    setMotivoPerdida('');
    setShowPerdidaModal(true);
  };

  const marcarComoPerdida = async () => {
    if (!cotizacionPerdida) return;
    
    try {
      await api.put(`/cotizaciones/${cotizacionPerdida.id}`, { 
        estado: 'cancelada',
        notas: `VENTA PERDIDA - Motivo: ${motivoPerdida}\n\nNotas anteriores:\n${cotizacionPerdida.notas || ''}`
      });
      setShowPerdidaModal(false);
      setCotizacionPerdida(null);
      setMotivoPerdida('');
      fetchCotizaciones();
    } catch (err) {
      alert('Error al marcar como perdida');
    }
  };

  const getDiasRestantes = (fechaVencimiento?: string) => {
    if (!fechaVencimiento) return null;
    const dias = Math.ceil((new Date(fechaVencimiento).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return dias;
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
          <p className="text-slate-400">Pipeline de ventas: Nueva → Enviada → Vendida/Perdida</p>
        </div>
        <Link 
          href="/paquetes"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nueva Cotización
        </Link>
      </div>

      {/* Kanban Board - 4 columnas */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        {COLUMNAS.map((columna) => {
          const cotizacionesColumna = cotizaciones.filter(
            c => getColumnaCotizacion(c) === columna.id
          );
          const Icon = columna.icon;

          return (
            <div 
              key={columna.id} 
              className={cn(
                "glass-card rounded-2xl flex flex-col overflow-hidden",
                columna.color
              )}
            >
              {/* Column Header */}
              <div className="p-3 border-b border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4 text-white" />
                  <h3 className="font-bold text-white text-sm">{columna.label}</h3>
                  <span className="ml-auto px-2 py-0.5 bg-white/10 rounded text-xs font-bold text-white">
                    {cotizacionesColumna.length}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">{columna.description}</p>
              </div>

              {/* Cards */}
              <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                {cotizacionesColumna.map((c) => {
                  const diasRestantes = getDiasRestantes(c.fecha_vencimiento);
                  
                  return (
                    <div 
                      key={c.id} 
                      className="bg-black/40 rounded-xl p-3 space-y-2 hover:bg-black/50 transition-all cursor-pointer group"
                    >
                      {/* Header de la card */}
                      <div className="flex items-start justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">
                          {c.codigo}
                        </span>
                        <span className="text-base font-black text-white">
                          ${formatCurrency(c.precio_total)}
                        </span>
                      </div>

                      {/* Info del cliente */}
                      <div>
                        <h4 className="font-bold text-white text-sm truncate">{c.cliente_nombre}</h4>
                        <p className="text-xs text-slate-400 truncate">{c.paquete_nombre}</p>
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span>{c.num_pasajeros} pasajeros</span>
                        {diasRestantes !== null && (
                          <span className={diasRestantes < 0 ? 'text-red-400' : diasRestantes <= 2 ? 'text-orange-400' : 'text-green-400'}>
                            {diasRestantes < 0 ? 'Vencida' : `${diasRestantes}d rest.`}
                          </span>
                        )}
                      </div>

                      {/* Fechas */}
                      <div className="text-[10px] text-slate-500 space-y-0.5">
                        <div>Creada: {new Date(c.fecha_creacion).toLocaleDateString()}</div>
                        {c.fecha_envio && (
                          <div>Enviada: {new Date(c.fecha_envio).toLocaleDateString()}</div>
                        )}
                      </div>

                      {/* Acciones según columna */}
                      <div className="pt-2 border-t border-white/10 space-y-2">
                        {/* COLUMNA NUEVA: Botón Enviar */}
                        {columna.id === 'pendiente' && (
                          <button
                            onClick={() => marcarComoEnviada(c.id)}
                            className="w-full py-2 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
                          >
                            <Send className="w-3.5 h-3.5" />
                            MARCAR COMO ENVIADA
                          </button>
                        )}
                        
                        {/* COLUMNA ENVIADA: Botones Cerrar Venta y Venta Perdida */}
                        {columna.id === 'respondida' && (
                          <>
                            <Link
                              href={`/cotizaciones/${c.id}?accion=cerrar`}
                              className="w-full py-2 bg-green-600/30 hover:bg-green-600/50 text-green-300 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                              CERRAR VENTA
                            </Link>
                            <button
                              onClick={() => abrirModalPerdida(c)}
                              className="w-full py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              VENTA PERDIDA
                            </button>
                          </>
                        )}

                        {/* COLUMNA VENDIDA: Link a venta */}
                        {columna.id === 'vendida' && (
                          <Link
                            href="/mis-ventas"
                            className="w-full py-2 bg-green-600/30 hover:bg-green-600/50 text-green-300 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            VER EN MIS VENTAS
                          </Link>
                        )}

                        {/* COLUMNA PERDIDA: Info */}
                        {columna.id === 'perdida' && (
                          <div className="w-full py-2 bg-red-600/10 text-red-400 rounded-lg text-xs font-bold text-center">
                            VENTA NO CONCRETADA
                          </div>
                        )}

                        {/* Ver detalle siempre disponible */}
                        <Link
                          href={`/cotizaciones/${c.id}`}
                          className="w-full py-1.5 bg-white/5 hover:bg-white/10 text-slate-400 rounded-lg text-xs transition-all flex items-center justify-center gap-1"
                        >
                          <ArrowRight className="w-3 h-3" />
                          Ver detalle
                        </Link>
                      </div>
                    </div>
                  );
                })}

                {cotizacionesColumna.length === 0 && (
                  <div className="text-center py-6 text-slate-500">
                    <Icon className="w-6 h-6 mx-auto mb-1 opacity-20" />
                    <p className="text-xs">Sin cotizaciones</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Venta Perdida */}
      {showPerdidaModal && cotizacionPerdida && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-md rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Venta Perdida</h3>
                <p className="text-sm text-slate-400">{cotizacionPerdida.codigo}</p>
              </div>
            </div>

            <div className="mb-4 p-3 bg-white/5 rounded-lg">
              <p className="text-sm text-slate-300">
                <strong>Cliente:</strong> {cotizacionPerdida.cliente_nombre}
              </p>
              <p className="text-sm text-slate-300">
                <strong>Total:</strong> ${formatCurrency(cotizacionPerdida.precio_total)}
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-sm text-slate-400 block">
                ¿Por qué se perdió esta venta?
              </label>
              <textarea
                rows={3}
                value={motivoPerdida}
                onChange={(e) => setMotivoPerdida(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-red-500 resize-none"
                placeholder="Ej: El cliente encontró precio más barato, no puede viajar en esas fechas, etc."
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPerdidaModal(false)}
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={marcarComoPerdida}
                disabled={!motivoPerdida.trim()}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-white font-bold transition-all"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
