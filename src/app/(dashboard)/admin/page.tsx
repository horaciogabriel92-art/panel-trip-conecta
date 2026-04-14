"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { ShoppingCart, Users, Package, Wallet, TrendingUp, Calendar, Loader2 } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    ventasTotales: 0,
    vendedoresActivos: 0,
    paquetesActivos: 0,
    comisionesPendientes: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [ventasRecientes, setVentasRecientes] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      
      console.log('[Admin Dashboard] Fetching stats...');
      
      // Fetch ventas
      console.log('[Admin Dashboard] Fetching /ventas...');
      const ventasRes = await api.get('/ventas');
      console.log('[Admin Dashboard] Ventas response:', ventasRes.data);
      const ventas = ventasRes.data || [];
      
      // Fetch vendedores (desde auth/users)
      console.log('[Admin Dashboard] Fetching /auth/users...');
      const vendedoresRes = await api.get('/auth/users');
      console.log('[Admin Dashboard] Vendedores response:', vendedoresRes.data);
      const vendedores = vendedoresRes.data || [];
      
      // Fetch paquetes
      console.log('[Admin Dashboard] Fetching /paquetes...');
      const paquetesRes = await api.get('/paquetes');
      console.log('[Admin Dashboard] Paquetes response:', paquetesRes.data);
      const paquetes = paquetesRes.data || [];
      
      // Fetch comisiones pendientes
      console.log('[Admin Dashboard] Fetching /comisiones/pendientes...');
      const comisionesRes = await api.get('/comisiones/pendientes');
      console.log('[Admin Dashboard] Comisiones response:', comisionesRes.data);
      
      // Para admin: { ventas: [...], agrupadas_por_vendedor: {...} }
      // Para vendedor: [...]
      const comisionesData = comisionesRes.data || {};
      let comisionesPendientes = 0;
      
      if (Array.isArray(comisionesData)) {
        // Si es array (vendedor), sumar directamente
        comisionesPendientes = comisionesData.reduce((sum: number, c: any) => sum + (c.comision_monto || 0), 0);
      } else if (comisionesData.agrupadas_por_vendedor) {
        // Si es objeto con agrupadas_por_vendedor (admin), sumar los totales
        Object.values(comisionesData.agrupadas_por_vendedor).forEach((grupo: any) => {
          comisionesPendientes += grupo.total_comision || 0;
        });
      } else {
        // Fallback: usar ventas directamente
        const ventas = comisionesData.ventas || [];
        comisionesPendientes = ventas.reduce((sum: number, v: any) => sum + (v.comision_monto || 0), 0);
      }
      
      console.log('[Admin Dashboard] Setting stats:', {
        ventasTotales: ventas.length,
        vendedoresActivos: vendedores.length,
        paquetesActivos: paquetes.length,
        comisionesPendientes
      });
      
      setStats({
        ventasTotales: ventas.length,
        vendedoresActivos: vendedores.length,
        paquetesActivos: paquetes.length,
        comisionesPendientes
      });
      
      // Últimas 5 ventas
      setVentasRecientes(ventas.slice(0, 5));
    } catch (err: any) {
      console.error('[Admin Dashboard] Error fetching stats:', err);
      console.error('[Admin Dashboard] Error details:', err.response?.data || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const cards = [
    { title: 'Ventas Totales', value: stats.ventasTotales, icon: ShoppingCart, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'Vendedores', value: stats.vendedoresActivos, icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { title: 'Paquetes', value: stats.paquetesActivos, icon: Package, color: 'text-green-400', bg: 'bg-green-500/10' },
    { title: 'Comisiones Pend.', value: `$${formatCurrency(stats.comisionesPendientes)}`, icon: Wallet, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h2 className="text-2xl md:text-3xl font-black text-[var(--foreground)]">Panel de Administración</h2>
        <p className="text-[var(--muted-foreground)]">Resumen general del sistema Trip Conecta</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
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
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-6 md:p-8 rounded-3xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Acciones Rápidas
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/admin/vendedores" className="p-4 rounded-xl bg-[var(--muted)] hover:bg-[var(--border)] transition-all text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-purple-400" />
              <p className="font-bold">Vendedores</p>
            </Link>
            <Link href="/admin/paquetes" className="p-4 rounded-xl bg-[var(--muted)] hover:bg-[var(--border)] transition-all text-center">
              <Package className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <p className="font-bold">Paquetes</p>
            </Link>
            <Link href="/admin/ventas" className="p-4 rounded-xl bg-[var(--muted)] hover:bg-[var(--border)] transition-all text-center">
              <ShoppingCart className="w-8 h-8 mx-auto mb-2 text-blue-400" />
              <p className="font-bold">Ventas</p>
            </Link>
            <Link href="/admin/comisiones" className="p-4 rounded-xl bg-[var(--muted)] hover:bg-[var(--border)] transition-all text-center">
              <Wallet className="w-8 h-8 mx-auto mb-2 text-orange-400" />
              <p className="font-bold">Comisiones</p>
            </Link>
          </div>
        </div>

        <div className="glass-card p-6 md:p-8 rounded-3xl">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            Ventas Recientes
          </h3>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : ventasRecientes.length === 0 ? (
            <p className="text-[var(--muted-foreground)] text-center py-8">No hay ventas registradas</p>
          ) : (
            <div className="space-y-6">
              {ventasRecientes.map((venta: any, i: number) => (
                <div key={venta.id || i} className="flex flex-wrap items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--muted)] flex items-center justify-center font-bold text-xs">
                    #{i+1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{venta.paquete_nombre || 'Paquete'}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {venta.fecha_creacion ? new Date(venta.fecha_creacion).toLocaleDateString() : 'Fecha no disponible'}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-green-400">+${formatCurrency(venta.total || 0)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
