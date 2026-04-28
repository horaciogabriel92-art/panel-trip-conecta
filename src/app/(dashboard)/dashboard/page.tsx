"use client";

import { useEffect, useState } from 'react';
import api, { recordatoriosAPI, Recordatorio } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { ShoppingCart, FileText, Package, Wallet, ArrowUpRight, TrendingUp, Calendar, Target, Bell, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import Link from 'next/link';

interface DashboardStats {
  cantidad_ventas: number;
  total_ventas: number;
  total_comisiones: number;
  comisiones_pendientes: number;
  comisiones_pagadas: number;
  ticket_promedio: number;
  cotizaciones_mes: number;
  cotizaciones_enviadas: number;
  tasa_conversion: number;
}

interface ComisionMensual {
  mes: string;
  monto: number;
  estado: 'pagado' | 'pendiente';
}

export default function VendedorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [comisionesMensual, setComisionesMensual] = useState<ComisionMensual[]>([]);
  const [recordatorios, setRecordatorios] = useState<Recordatorio[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats de ventas + cotizaciones (un solo endpoint)
      const statsRes = await api.get('/ventas/stats');
      setStats(statsRes.data);

      // Fetch comisiones para el historial mensual
      try {
        const comisionesRes = await api.get('/comisiones/pagadas');
        const pagos = comisionesRes.data || [];
        
        // Transformar pagos reales al formato necesario
        const mensual: ComisionMensual[] = pagos.slice(0, 5).map((pago: any) => ({
          mes: new Date(pago.fecha_pago).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
          monto: pago.monto,
          estado: pago.estado || 'pagado'
        }));
        
        setComisionesMensual(mensual);
      } catch (err) {
        // Si falla, mostrar array vacío
        setComisionesMensual([]);
      }

      // Fetch recordatorios pendientes
      try {
        const recs = await recordatoriosAPI.listar({ estado: 'pendiente' });
        setRecordatorios(recs.slice(0, 5));
      } catch (err) {
        setRecordatorios([]);
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const nombre = user?.nombre || 'Vendedor';

  const cards = [
    { 
      title: 'Mis Ventas', 
      value: stats?.cantidad_ventas || 0, 
      subtext: stats ? `$${formatCurrency(stats.total_ventas)} total · $${formatCurrency(stats.ticket_promedio || 0)} promedio` : '$0',
      icon: ShoppingCart, 
      color: 'text-blue-400', 
      bg: 'bg-blue-500/10' 
    },
    { 
      title: 'Cotizaciones', 
      value: stats?.cotizaciones_mes || 0, 
      subtext: `${stats?.cotizaciones_enviadas || 0} seguimientos pendientes`,
      icon: FileText, 
      color: 'text-purple-400', 
      bg: 'bg-purple-500/10' 
    },
    { 
      title: 'Comisiones', 
      value: stats ? `$${formatCurrency(stats.total_comisiones)}` : '$0', 
      subtext: `${stats?.comisiones_pendientes ? '$' + formatCurrency(stats.comisiones_pendientes) : '$0'} pendientes`,
      icon: Wallet, 
      color: 'text-green-400', 
      bg: 'bg-green-500/10' 
    },
    { 
      title: 'Tasa de Conversión', 
      value: `${stats?.tasa_conversion || 0}%`, 
      subtext: 'de cotizaciones a ventas',
      icon: Target, 
      color: 'text-yellow-400', 
      bg: 'bg-yellow-500/10' 
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-[var(--foreground)]">Hola, {nombre} 👋</h2>
          <p className="text-[var(--muted-foreground)]">
            {stats && stats.cotizaciones_enviadas > 0 
              ? `¡Tienes ${stats.cotizaciones_enviadas} cotización${stats.cotizaciones_enviadas === 1 ? '' : 'es'} esperando seguimiento!` 
              : 'No tienes cotizaciones pendientes de seguimiento'}
          </p>
        </div>
        <Link href="/paquetes" className="bg-blue-600 hover:bg-blue-700 text-[var(--foreground)] font-bold px-6 py-3 rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 w-fit">
          <Package className="w-5 h-5" />
          Ver Catálogo
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-6 rounded-3xl h-32 animate-pulse bg-[var(--muted)]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, idx) => (
            <div key={idx} className="glass-card p-6 rounded-3xl space-y-4">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", card.bg)}>
                <card.icon className={cn("w-6 h-6", card.color)} />
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)] font-medium">{card.title}</p>
                <h3 className="text-2xl font-bold text-[var(--foreground)]">{card.value}</h3>
                <p className="text-xs text-slate-500">{card.subtext}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-6 md:p-8 rounded-3xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Resumen de Comisiones</h3>
            <Link href="/mis-ventas" className="text-blue-400 text-sm font-bold hover:underline flex items-center gap-1">
              Ver detalle <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-[var(--muted)] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {comisionesMensual.map((item, i) => (
                <div key={i} className="flex flex-wrap items-center justify-between py-2 border-b border-[var(--border)] last:border-0 gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      item.estado === 'pagado' ? "bg-green-500/10" : "bg-orange-500/10"
                    )}>
                      <Calendar className={cn(
                        "w-5 h-5",
                        item.estado === 'pagado' ? "text-green-400" : "text-orange-400"
                      )} />
                    </div>
                    <span className="text-[var(--foreground)] font-medium truncate">{item.mes}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold">${formatCurrency(item.monto)}</span>
                    <span className={cn(
                      "text-xs font-black uppercase tracking-tighter px-2 py-1 rounded-full",
                      item.estado === 'pagado' 
                        ? "bg-green-500/10 text-green-400" 
                        : "bg-orange-500/10 text-orange-400"
                    )}>
                      {item.estado}
                    </span>
                  </div>
                </div>
              ))}
              {comisionesMensual.length === 0 && (
                <p className="text-sm text-[var(--muted-foreground)] text-center py-4">
                  No hay pagos de comisiones registrados aún.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="glass-card p-6 md:p-8 rounded-3xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-500/20">
           <div className="flex items-center justify-between mb-4">
             <h3 className="text-xl font-bold flex items-center gap-2">
               <Bell className="w-5 h-5 text-blue-400" />
               Mis Recordatorios
             </h3>
             {recordatorios.length > 0 && (
               <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 rounded-full text-xs font-bold">
                 {recordatorios.length} pendiente{recordatorios.length === 1 ? '' : 's'}
               </span>
             )}
           </div>
           {isLoading ? (
             <div className="space-y-3">
               {[1, 2].map((i) => (
                 <div key={i} className="h-12 bg-[var(--muted)] rounded-xl animate-pulse" />
               ))}
             </div>
           ) : recordatorios.length === 0 ? (
             <div className="text-center py-6">
               <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
               <p className="text-sm text-[var(--muted-foreground)]">No tienes recordatorios pendientes</p>
             </div>
           ) : (
             <div className="space-y-3">
               {recordatorios.map((rec) => (
                 <div key={rec.id} className={`p-3 rounded-xl ${new Date(rec.fecha_recordatorio) < new Date() ? 'bg-red-500/5 border border-red-500/20' : 'bg-[var(--muted)]'}`}>
                   <div className="flex items-start justify-between gap-2">
                     <div className="flex-1 min-w-0">
                       <p className="text-sm font-medium text-[var(--foreground)] truncate">{rec.titulo}</p>
                       <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1 mt-0.5">
                         <Clock className="w-3 h-3" />
                         {new Date(rec.fecha_recordatorio).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                       </p>
                       {rec.cliente && (
                         <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                           {rec.cliente.nombre} {rec.cliente.apellido}
                         </p>
                       )}
                     </div>
                     <div className="flex items-center gap-1">
                       <button
                         onClick={async () => {
                           try {
                             await recordatoriosAPI.completar(rec.id);
                             setRecordatorios((prev) => prev.filter((r) => r.id !== rec.id));
                           } catch (e) {
                             console.error(e);
                           }
                         }}
                         className="p-1.5 text-green-400 hover:bg-green-500/10 rounded-lg transition-colors"
                         title="Completar"
                       >
                         <CheckCircle2 className="w-4 h-4" />
                       </button>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
