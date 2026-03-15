"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import { ShoppingCart, FileText, Package, Wallet, Star, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function VendedorDashboard() {
  const [stats, setStats] = useState({
    misVentas: 0,
    cotizacionesAbiertas: 0,
    comisionesGanadas: 0,
    proximaMeta: 0
  });

  useEffect(() => {
    // Fetch real stats later
    setStats({
      misVentas: 28,
      cotizacionesAbiertas: 15,
      comisionesGanadas: 3450.75,
      proximaMeta: 75
    });
  }, []);

  const cards = [
    { title: 'Mis Ventas', value: stats.misVentas, icon: ShoppingCart, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'Cotizaciones', value: stats.cotizacionesAbiertas, icon: FileText, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { title: 'Comisiones', value: `$${stats.comisionesGanadas.toLocaleString()}`, icon: Wallet, color: 'text-green-400', bg: 'bg-green-500/10' },
    { title: 'Cumplimiento', value: `${stats.proximaMeta}%`, icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white">Hola, Carlos 👋</h2>
          <p className="text-slate-400">¡Tienes 15 cotizaciones pendientes hoy!</p>
        </div>
        <Link href="/paquetes" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 w-fit">
          <Package className="w-5 h-5" />
          Ver Catálogo
        </Link>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8 rounded-3xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold">Resumen de Comisiones</h3>
            <button className="text-blue-400 text-sm font-bold hover:underline flex items-center gap-1">
              Ver detalle <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-6">
            {[
              { label: 'Enero 2024', amount: '$1,200', status: 'Pagado', color: 'text-green-400' },
              { label: 'Febrero 2024', amount: '$950', status: 'Pendiente', color: 'text-orange-400' },
              { label: 'Marzo 2024', amount: '$1,300', status: 'Procesando', color: 'text-blue-400' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-slate-300 font-medium">{item.label}</span>
                <div className="flex items-center gap-4">
                  <span className="font-bold">{item.amount}</span>
                  <span className={cn("text-xs font-black uppercase tracking-tighter", item.color)}>{item.status}</span>
                </div>
              </div>
            ))}
          </div>
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
           <button className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-slate-100 transition-all">
             Obtener Material de Venta
           </button>
        </div>
      </div>
    </div>
  );
}
