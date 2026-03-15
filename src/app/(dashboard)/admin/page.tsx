"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { ShoppingCart, Users, Package, Wallet, TrendingUp, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    ventasTotales: 0,
    vendedoresActivos: 0,
    paquetesActivos: 0,
    comisionesPendientes: 0
  });

  useEffect(() => {
    // Fetch real stats later
    setStats({
      ventasTotales: 154,
      vendedoresActivos: 12,
      paquetesActivos: 45,
      comisionesPendientes: 12500.50
    });
  }, []);

  const cards = [
    { title: 'Ventas Totales', value: stats.ventasTotales, icon: ShoppingCart, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'Vendedores', value: stats.vendedoresActivos, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { title: 'Paquetes', value: stats.paquetesActivos, icon: Package, color: 'text-green-400', bg: 'bg-green-500/10' },
    { title: 'Comisiones Pend.', value: `$${stats.comisionesPendientes.toLocaleString()}`, icon: Wallet, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h2 className="text-3xl font-black text-white">Panel de Administración</h2>
        <p className="text-slate-400">Resumen general del sistema Trip Conecta</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className="glass-card p-6 rounded-3xl space-y-4">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", card.bg)}>
              <card.icon className={cn("w-6 h-6", card.color)} />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">{card.title}</p>
              <h3 className="text-2xl font-bold text-white">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-8 rounded-3xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Rendimiento de Ventas
            </h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10 transition-colors">7d</button>
              <button className="px-3 py-1 text-xs rounded-lg bg-blue-600 text-white">30d</button>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
             {[40, 60, 45, 90, 65, 80, 50, 70, 85, 95, 60, 75].map((h, i) => (
               <div key={i} className="flex-1 bg-gradient-to-t from-blue-600/40 to-blue-400/80 rounded-t-lg transition-all hover:scale-x-110 cursor-pointer" style={{ height: `${h}%` }} />
             ))}
          </div>
        </div>

        <div className="glass-card p-8 rounded-3xl">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            Ventas Recientes
          </h3>
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold text-xs">
                  #0{i+1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">Europa Express</p>
                  <p className="text-xs text-slate-500">hace 2 horas</p>
                </div>
                <p className="text-sm font-bold text-green-400">+$1.2k</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
