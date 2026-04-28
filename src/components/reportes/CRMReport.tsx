'use client';

import { useEffect, useState } from 'react';
import { Users, UserX, Target, Activity } from 'lucide-react';
import { reportesAPI, CRMReport as CRMReportType, FiltrosReporte } from '@/lib/api-reportes';
import ExportCSVButton from './ExportCSVButton';

interface Props {
  filtros: FiltrosReporte;
}

export default function CRMReport({ filtros }: Props) {
  const [data, setData] = useState<CRMReportType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await reportesAPI.getCRM(filtros);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [filtros]);

  if (loading) return <div className="py-20 text-center text-[var(--muted-foreground)]">Cargando...</div>;
  if (!data) return <div className="py-20 text-center text-[var(--muted-foreground)]">Sin datos</div>;

  const { nuevos_clientes_mes, fuentes_lead, clientes_dormidos, distribucion_estados, resumen } = data;
  const maxClientesMes = nuevos_clientes_mes.length > 0 ? Math.max(...nuevos_clientes_mes.map((m) => m.cantidad)) : 1;
  const maxFuentes = fuentes_lead.length > 0 ? Math.max(...fuentes_lead.map((f) => f.total)) : 1;
  const totalEstados = distribucion_estados.reduce((sum, e) => sum + e.cantidad, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Cards resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-[var(--muted-foreground)] uppercase font-bold">Nuevos Clientes</span>
          </div>
          <p className="text-2xl font-black text-[var(--foreground)]">{resumen.nuevos_clientes_periodo}</p>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-[var(--muted-foreground)] uppercase font-bold">Total Clientes</span>
          </div>
          <p className="text-2xl font-black text-[var(--foreground)]">{resumen.total_clientes}</p>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <UserX className="w-4 h-4 text-red-400" />
            <span className="text-xs text-[var(--muted-foreground)] uppercase font-bold">Clientes Dormidos</span>
          </div>
          <p className="text-2xl font-black text-red-400">{resumen.clientes_dormidos_count}</p>
        </div>
      </div>

      {/* Nuevos clientes por mes */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-[var(--foreground)]">Nuevos Clientes por Mes</h3>
          </div>
          <ExportCSVButton data={nuevos_clientes_mes} filename="crm_nuevos_clientes.csv" />
        </div>
        <div className="p-4 space-y-3">
          {nuevos_clientes_mes.map((m) => (
            <div key={m.mes} className="flex items-center gap-3">
              <span className="text-sm text-[var(--foreground)] w-24">{m.mes}</span>
              <div className="flex-1 h-3 bg-[var(--muted)] rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 rounded-full" style={{ width: `${(m.cantidad / maxClientesMes) * 100}%` }} />
              </div>
              <span className="text-sm font-bold text-[var(--foreground)] w-10 text-right">{m.cantidad}</span>
            </div>
          ))}
          {nuevos_clientes_mes.length === 0 && <p className="text-center text-[var(--muted-foreground)] py-4">Sin datos</p>}
        </div>
      </div>

      {/* Fuentes de lead */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-[var(--foreground)]">Fuentes de Lead</h3>
          </div>
          <ExportCSVButton data={fuentes_lead} filename="crm_fuentes_lead.csv" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Fuente</th>
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Total Clientes</th>
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Con Venta</th>
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Conversión %</th>
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Distribución</th>
              </tr>
            </thead>
            <tbody>
              {fuentes_lead.map((f) => (
                <tr key={f.fuente} className="border-b border-[var(--border)] hover:bg-[var(--muted)] transition-all">
                  <td className="p-4 text-[var(--foreground)] font-medium">{f.fuente}</td>
                  <td className="p-4 text-[var(--foreground)]">{f.total}</td>
                  <td className="p-4 text-green-400">{f.con_venta}</td>
                  <td className="p-4">
                    <span className={`font-bold ${f.conversion_pct >= 30 ? 'text-green-400' : f.conversion_pct >= 15 ? 'text-orange-400' : 'text-red-400'}`}>
                      {f.conversion_pct}%
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="w-24 h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(f.total / maxFuentes) * 100}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
              {fuentes_lead.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-[var(--muted-foreground)]">Sin datos</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Distribución de estados */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-[var(--foreground)]">Distribución de Estados</h3>
          </div>
          <ExportCSVButton data={distribucion_estados} filename="crm_estados.csv" />
        </div>
        <div className="p-4 space-y-3">
          {distribucion_estados.map((e) => (
            <div key={e.estado} className="flex items-center gap-3">
              <span className="text-sm text-[var(--foreground)] w-24 capitalize">{e.estado}</span>
              <div className="flex-1 h-3 bg-[var(--muted)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${totalEstados > 0 ? (e.cantidad / totalEstados) * 100 : 0}%`,
                    backgroundColor: e.estado === 'activo' ? '#34d399' : e.estado === 'frecuente' ? '#60a5fa' : e.estado === 'prospecto' ? '#fbbf24' : '#f87171'
                  }}
                />
              </div>
              <span className="text-sm font-bold text-[var(--foreground)] w-12 text-right">{e.cantidad}</span>
              <span className="text-xs text-[var(--muted-foreground)] w-14 text-right">
                {totalEstados > 0 ? ((e.cantidad / totalEstados) * 100).toFixed(1) : 0}%
              </span>
            </div>
          ))}
          {distribucion_estados.length === 0 && <p className="text-center text-[var(--muted-foreground)] py-4">Sin datos</p>}
        </div>
      </div>

      {/* Clientes dormidos */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <UserX className="w-5 h-5 text-red-400" />
            <h3 className="font-bold text-[var(--foreground)]">Clientes Dormidos (&gt;60 días)</h3>
          </div>
          <ExportCSVButton data={clientes_dormidos} filename="crm_clientes_dormidos.csv" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Cliente</th>
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Última Interacción</th>
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Días Inactivo</th>
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Última Cotización</th>
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Estado</th>
              </tr>
            </thead>
            <tbody>
              {clientes_dormidos.map((c) => (
                <tr key={c.id} className="border-b border-[var(--border)] hover:bg-[var(--muted)] transition-all">
                  <td className="p-4 text-[var(--foreground)] font-medium">{c.nombre}</td>
                  <td className="p-4 text-[var(--foreground)]">{c.fecha_ultima_interaccion ? new Date(c.fecha_ultima_interaccion).toLocaleDateString() : 'Nunca'}</td>
                  <td className="p-4">
                    <span className={`font-bold ${c.dias_inactivo > 90 ? 'text-red-400' : 'text-orange-400'}`}>
                      {c.dias_inactivo} días
                    </span>
                  </td>
                  <td className="p-4 text-[var(--foreground)]">{c.ultima_cotizacion ? new Date(c.ultima_cotizacion).toLocaleDateString() : '-'}</td>
                  <td className="p-4 capitalize text-[var(--foreground)]">{c.estado || '-'}</td>
                </tr>
              ))}
              {clientes_dormidos.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-[var(--muted-foreground)]">No hay clientes dormidos</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
