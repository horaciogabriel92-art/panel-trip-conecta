"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { ShoppingCart, FileText, Package, Wallet, Star, ArrowUpRight, TrendingUp, Calendar } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import Link from 'next/link';

interface DashboardStats {
  cantidad_ventas: number;
  total_ventas: number;
  total_comisiones: number;
  comisiones_pendientes: number;
  comisiones_pagadas: number;
}

interface ComisionMensual {
  mes: string;
  monto: number;
  estado: 'pagado' | 'pendiente';
}

export default function VendedorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [cotizacionesCount, setCotizacionesCount] = useState(0);
  const [comisionesMensual, setComisionesMensual] = useState<ComisionMensual[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats de ventas
      const statsRes = await api.get('/ventas/stats');
      setStats(statsRes.data);

      // Fetch cotizaciones pendientes
      const cotizacionesRes = await api.get('/cotizaciones');
      const pendientes = cotizacionesRes.data.filter((c: any) => c.estado === 'pendiente');
      setCotizacionesCount(pendientes.length);

      // Fetch comisiones para el historial mensual
      try {
        const comisionesRes = await api.get('/comisiones/pagadas');
        const pagos = comisionesRes.data || [];
        
        // Agrupar por mes (simulado por ahora)
        const mensual: ComisionMensual[] = [
          { mes: 'Enero 2024', monto: 1200, estado: 'pagado' },
          { mes: 'Febrero 2024', monto: 950, estado: 'pendiente' },
          { mes: 'Marzo 2024', monto: statsRes.data?.comisiones_pagadas || 1300, estado: 'pagado' },
        ];
        setComisionesMensual(mensual);
      } catch (err) {
        // Si falla el endpoint de comisiones, usar datos mock
        setComisionesMensual([
          { mes: 'Enero 2024', monto: 1200, estado: 'pagado' },
          { mes: 'Febrero 2024', monto: 950, estado: 'pendiente' },
          { mes: 'Marzo 2024', monto: statsRes.data?.comisiones_pagadas || 1300, estado: 'pagado' },
        ]);
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const nombre = user?.nombre || 'Vendedor';
  const metaProgreso = stats ? Math.min((stats.total_ventas / 10000) * 100, 100) : 0;

  const cards = [
    { 
      title: 'Mis Ventas', 
      value: stats?.cantidad_ventas || 0, 
      subtext: stats ? `$${formatCurrency(stats.total_ventas)}` : '$0',
      icon: ShoppingCart, 
      color: 'text-blue-400', 
      bg: 'bg-blue-500/10' 
    },
    { 
      title: 'Cotizaciones', 
      value: cotizacionesCount, 
      subtext: 'Pendientes',
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
      title: 'Meta Anual', 
      value: `${Math.round(metaProgreso)}%`, 
      subtext: 'del objetivo',
      icon: TrendingUp, 
      color: 'text-yellow-400', 
      bg: 'bg-yellow-500/10' 
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white">Hola, {nombre} 👋</h2>
          <p className="text-slate-400">
            {cotizacionesCount > 0 
              ? `¡Tienes ${cotizacionesCount} cotizaciones pendientes!` 
              : 'No tienes cotizaciones pendientes'}
          </p>
        </div>
        <Link href="/paquetes" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 w-fit">
          <Package className="w-5 h-5" />
          Ver Catálogo
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-6 rounded-3xl h-32 animate-pulse bg-white/5" />
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
                <p className="text-sm text-slate-400 font-medium">{card.title}</p>
                <h3 className="text-2xl font-bold text-white">{card.value}</h3>
                <p className="text-xs text-slate-500">{card.subtext}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8 rounded-3xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Resumen de Comisiones</h3>
            <Link href="/ventas" className="text-blue-400 text-sm font-bold hover:underline flex items-center gap-1">
              Ver detalle <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {comisionesMensual.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      item.estado === 'pagado' ? "bg-green-500/10" : "bg-orange-500/10"
                    )}>
                      <Calendar className={cn(
                        "w-5 h-5",
                        item.estado === 'pagado' ? "text-green-400" : "text-orange-400"
                      )} />
                    </div>
                    <span className="text-slate-300 font-medium">{item.mes}</span>
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
            </div>
          )}
        </div>

        <div className="glass-card p-8 rounded-3xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-500/20">
           <h3 className="text-xl font-bold mb-4">Pack Destacado</h3>
           <div className="relative rounded-2xl overflow-hidden h-40 mb-4">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=400')] bg-cover bg-center" />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute bottom-4 left-4">
                <p className="text-white font-black text-xl">Cancún All Inclusive</p>
                <p className="text-blue-300 text-sm font-bold">Desde $899 USD</p>
              </div>
           </div>
           <p className="text-slate-400 text-sm mb-6">Increíble oportunidad para este verano. Revisa los detalles y comparte con tus clientes.</p>
           <Link 
             href="/paquetes"
             className="w-full block text-center bg-white text-black font-black py-4 rounded-2xl hover:bg-slate-100 transition-all"
           >
             Ver Detalles del Pack
           </Link>
        </div>
      </div>
    </div>
  );
}
