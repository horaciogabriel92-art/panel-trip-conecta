"use client";

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { cn, formatCurrency } from '@/lib/utils';
import {
  FileText,
  ShoppingCart,
  Wallet,
  Target,
  Users,
  Clock,
  Bell,
  CreditCard,
  TrendingUp,
  Calendar,
  AlertTriangle,
  Package,
  UserPlus,
  Plus,
  RefreshCw,
  ArrowUpRight,
  type LucideIcon,
} from 'lucide-react';

// ============================================
// Tipos (contrato GET /api/dashboard/summary)
// ============================================

interface DashboardKpis {
  cotizaciones_activas: number;
  ventas_mes_count: number;
  ventas_mes_monto: number;
  por_cobrar: number;
  conversion_pct: number;
  vendedores_activos: number | null;
  pendientes_aprobacion: number | null;
  comision_acumulada: number | null;
}

interface CotizacionPorVencer {
  id: string;
  codigo: string;
  nombre_cotizacion: string;
  fecha_expiracion: string;
}

interface RecordatorioPendiente {
  id: string;
  titulo: string;
  fecha_recordatorio: string;
  cliente_id: string;
  vencido: boolean;
}

interface PagoPendiente {
  id: string;
  codigo: string;
  monto_restante: number;
  fecha_pago_resto: string | null;
}

interface FunnelCounts {
  nueva: number;
  enviada: number;
  aprobada: number;
  vendida: number;
  perdida: number;
}

interface VentaReciente {
  id: string;
  codigo: string;
  cliente_nombre: string;
  precio_total: number;
  fecha_creacion: string;
}

interface DashboardSummaryData {
  rol: 'admin' | 'vendedor';
  kpis: DashboardKpis;
  atencion: {
    por_vencer: CotizacionPorVencer[];
    recordatorios: RecordatorioPendiente[];
    pagos_pendientes: PagoPendiente[];
  };
  funnel: FunnelCounts;
  ventas_recientes: VentaReciente[];
}

// ============================================
// Helpers
// ============================================

function formatDate(value?: string | null): string {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (isNaN(date.getTime())) return 'Sin fecha';
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ============================================
// Componente
// ============================================

export default function DashboardSummary() {
  const [data, setData] = useState<DashboardSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get('/dashboard/summary');
      setData(res.data);
    } catch (err: any) {
      console.error('[DashboardSummary] Error fetching summary:', err);
      setError('No pudimos cargar el resumen de tu panel.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // ---------- Loading ----------
  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-700">
        <div className="space-y-2">
          <div className="h-8 w-64 rounded-xl bg-[var(--muted)] animate-pulse" />
          <div className="h-4 w-48 rounded-lg bg-[var(--muted)] animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-6 rounded-3xl h-32 animate-pulse bg-[var(--muted)]" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-6 rounded-3xl h-48 animate-pulse bg-[var(--muted)]" />
          ))}
        </div>
      </div>
    );
  }

  // ---------- Error ----------
  if (error || !data) {
    return (
      <div className="space-y-8 animate-in fade-in duration-700">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-[var(--foreground)]">Mi Panel</h2>
          <p className="text-[var(--muted-foreground)]">Resumen de tu negocio</p>
        </div>
        <div className="glass-card p-8 rounded-3xl flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>
          <p className="text-[var(--muted-foreground)]">{error || 'No pudimos cargar el resumen de tu panel.'}</p>
          <button
            onClick={fetchSummary}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = data.rol === 'admin';
  const prefix = isAdmin ? '/admin' : '';
  const { kpis, atencion, funnel, ventas_recientes } = data;

  // ---------- KPIs ----------
  const kpiCards: { title: string; value: string; subtext?: string; icon: LucideIcon; color: string; bg: string }[] = [
    {
      title: 'Cotizaciones activas',
      value: String(kpis.cotizaciones_activas ?? 0),
      icon: FileText,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      title: 'Ventas del mes',
      value: `$${formatCurrency(kpis.ventas_mes_monto)}`,
      subtext: `${kpis.ventas_mes_count ?? 0} venta${kpis.ventas_mes_count === 1 ? '' : 's'} este mes`,
      icon: ShoppingCart,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
    {
      title: 'Por cobrar',
      value: `$${formatCurrency(kpis.por_cobrar)}`,
      icon: Wallet,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
    },
    {
      title: 'Conversión',
      value: `${kpis.conversion_pct ?? 0}%`,
      subtext: 'de cotizaciones a ventas',
      icon: Target,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
    ...(kpis.vendedores_activos !== null && kpis.vendedores_activos !== undefined
      ? [{
          title: 'Vendedores activos',
          value: String(kpis.vendedores_activos),
          icon: Users,
          color: 'text-indigo-400',
          bg: 'bg-indigo-500/10',
        }]
      : []),
    ...(kpis.pendientes_aprobacion !== null && kpis.pendientes_aprobacion !== undefined
      ? [{
          title: 'Pendientes de aprobación',
          value: String(kpis.pendientes_aprobacion),
          icon: Clock,
          color: 'text-yellow-400',
          bg: 'bg-yellow-500/10',
        }]
      : []),
    ...(kpis.comision_acumulada !== null && kpis.comision_acumulada !== undefined
      ? [{
          title: 'Comisión acumulada',
          value: `$${formatCurrency(kpis.comision_acumulada)}`,
          icon: CreditCard,
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
        }]
      : []),
  ];

  // ---------- Funnel ----------
  const funnelStages = [
    { label: 'Nuevas', count: funnel.nueva ?? 0, bar: 'bg-blue-500', text: 'text-blue-400' },
    { label: 'Enviadas', count: funnel.enviada ?? 0, bar: 'bg-purple-500', text: 'text-purple-400' },
    ...(funnel.aprobada > 0
      ? [{ label: 'Aprobadas', count: funnel.aprobada, bar: 'bg-yellow-500', text: 'text-yellow-400' }]
      : []),
    { label: 'Vendidas', count: funnel.vendida ?? 0, bar: 'bg-green-500', text: 'text-green-400' },
    { label: 'Perdidas', count: funnel.perdida ?? 0, bar: 'bg-red-500', text: 'text-red-400' },
  ];
  const funnelMax = Math.max(...funnelStages.map((s) => s.count), 1);

  // ---------- Acciones rápidas ----------
  const quickActions: { href: string; label: string; icon: LucideIcon; color: string }[] = isAdmin
    ? [
        { href: '/admin/cotizacion/nueva', label: 'Nueva cotización', icon: Plus, color: 'text-blue-400' },
        { href: '/admin/clientes/nuevo', label: 'Nuevo cliente', icon: UserPlus, color: 'text-purple-400' },
        { href: '/admin/paquetes', label: 'Nuevo paquete', icon: Package, color: 'text-green-400' },
      ]
    : [
        { href: '/cotizacion/nueva', label: 'Nueva cotización', icon: Plus, color: 'text-blue-400' },
        { href: '/admin/clientes/nuevo', label: 'Nuevo cliente', icon: UserPlus, color: 'text-purple-400' },
        { href: '/mis-ventas', label: 'Mis ventas', icon: ShoppingCart, color: 'text-green-400' },
      ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-black text-[var(--foreground)]">
          {isAdmin ? 'Panel de Administración' : 'Mi Panel'}
        </h2>
        <p className="text-[var(--muted-foreground)]">Resumen de tu negocio</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card) => (
          <div key={card.title} className="glass-card p-6 rounded-3xl space-y-4">
            <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center', card.bg)}>
              <card.icon className={cn('w-6 h-6', card.color)} />
            </div>
            <div>
              <p className="text-sm text-[var(--muted-foreground)] font-medium">{card.title}</p>
              <h3 className="text-2xl font-bold text-[var(--foreground)]">{card.value}</h3>
              {card.subtext && <p className="text-xs text-[var(--muted-foreground)]">{card.subtext}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Requiere tu atención */}
      <div>
        <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-orange-400" />
          Requiere tu atención
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cotizaciones por vencer */}
          <div className="glass-card p-6 rounded-3xl">
            <h4 className="font-bold flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-yellow-400" />
              Cotizaciones por vencer
            </h4>
            {atencion.por_vencer.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)] text-center py-6">Nada pendiente por aquí</p>
            ) : (
              <div className="space-y-3">
                {atencion.por_vencer.map((c) => (
                  <Link
                    key={c.id}
                    href={`${prefix}/cotizaciones/${c.id}`}
                    className="block p-3 rounded-xl bg-[var(--muted)] hover:bg-[var(--border)] transition-all"
                  >
                    <p className="text-sm font-semibold truncate">{c.nombre_cotizacion || c.codigo}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {c.codigo} · vence {formatDate(c.fecha_expiracion)}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recordatorios */}
          <div className="glass-card p-6 rounded-3xl">
            <h4 className="font-bold flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4 text-blue-400" />
              Recordatorios
            </h4>
            {atencion.recordatorios.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)] text-center py-6">Nada pendiente por aquí</p>
            ) : (
              <div className="space-y-3">
                {atencion.recordatorios.map((r) => (
                  <Link
                    key={r.id}
                    href={`/admin/clientes/${r.cliente_id}`}
                    className={cn(
                      'block p-3 rounded-xl transition-all',
                      r.vencido
                        ? 'bg-red-500/5 border border-red-500/20 hover:bg-red-500/10'
                        : 'bg-[var(--muted)] hover:bg-[var(--border)]'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold truncate flex-1 min-w-0">{r.titulo}</p>
                      {r.vencido && (
                        <span className="shrink-0 text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">
                          Vencido
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)]">{formatDate(r.fecha_recordatorio)}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Pagos pendientes */}
          <div className="glass-card p-6 rounded-3xl">
            <h4 className="font-bold flex items-center gap-2 mb-4">
              <CreditCard className="w-4 h-4 text-green-400" />
              Pagos pendientes
            </h4>
            {atencion.pagos_pendientes.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)] text-center py-6">Nada pendiente por aquí</p>
            ) : (
              <div className="space-y-3">
                {atencion.pagos_pendientes.map((p) => (
                  <Link
                    key={p.id}
                    href={`${prefix}/cotizaciones/${p.id}`}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[var(--muted)] hover:bg-[var(--border)] transition-all"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{p.codigo}</p>
                      {p.fecha_pago_resto && (
                        <p className="text-xs text-[var(--muted-foreground)]">vence {formatDate(p.fecha_pago_resto)}</p>
                      )}
                    </div>
                    <p className="text-sm font-bold text-orange-400 shrink-0">${formatCurrency(p.monto_restante)}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Funnel */}
      <div className="glass-card p-6 md:p-8 rounded-3xl">
        <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          Embudo de cotizaciones
        </h3>
        <div className={cn('grid grid-cols-2 gap-4', funnelStages.length === 5 ? 'md:grid-cols-5' : 'md:grid-cols-4')}>
          {funnelStages.map((stage) => (
            <div key={stage.label} className="space-y-2">
              <p className={cn('text-2xl font-black', stage.text)}>{stage.count}</p>
              <p className="text-xs text-[var(--muted-foreground)] font-medium">{stage.label}</p>
              <div className="h-2 rounded-full bg-[var(--muted)] overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all', stage.bar)}
                  style={{ width: `${Math.max((stage.count / funnelMax) * 100, stage.count > 0 ? 6 : 0)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Acciones rápidas + Ventas recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-6 md:p-8 rounded-3xl">
          <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Acciones rápidas
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.href + action.label}
                href={action.href}
                className="p-4 rounded-xl bg-[var(--muted)] hover:bg-[var(--border)] transition-all text-center"
              >
                <action.icon className={cn('w-8 h-8 mx-auto mb-2', action.color)} />
                <p className="font-bold">{action.label}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 md:p-8 rounded-3xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              Ventas recientes
            </h3>
            <Link
              href={isAdmin ? '/admin/ventas' : '/mis-ventas'}
              className="text-blue-400 text-sm font-bold hover:underline flex items-center gap-1"
            >
              Ver todas <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          {ventas_recientes.length === 0 ? (
            <p className="text-[var(--muted-foreground)] text-center py-8">No hay ventas registradas</p>
          ) : (
            <div className="space-y-4">
              {ventas_recientes.slice(0, 5).map((venta) => (
                <Link
                  key={venta.id}
                  href={isAdmin ? `/admin/ventas/${venta.id}` : `/mis-ventas/${venta.id}`}
                  className="flex flex-wrap items-center gap-3 p-2 -m-2 rounded-xl hover:bg-[var(--muted)] transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-[var(--muted)] flex items-center justify-center shrink-0">
                    <ShoppingCart className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{venta.codigo}</p>
                    <p className="text-xs text-[var(--muted-foreground)] truncate">
                      {venta.cliente_nombre || 'Cliente'} · {formatDate(venta.fecha_creacion)}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-green-400">+${formatCurrency(venta.precio_total)}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
