'use client';

import { useEffect, useState } from 'react';
import { DollarSign, CreditCard, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { reportesAPI, CobranzaReport as CobranzaReportType, FiltrosReporte } from '@/lib/api-reportes';
import { formatCurrency } from '@/lib/utils';
import ExportCSVButton from './ExportCSVButton';

interface Props {
  filtros: FiltrosReporte;
}

export default function CobranzaReport({ filtros }: Props) {
  const [data, setData] = useState<CobranzaReportType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await reportesAPI.getCobranza(filtros);
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

  const { resumen, medios_pago, ventas_pendientes, evolucion_mensual } = data;
  const maxMedio = medios_pago.length > 0 ? Math.max(...medios_pago.map((m) => m.monto)) : 1;
  const maxEvo = evolucion_mensual.length > 0 ? Math.max(...evolucion_mensual.map((e) => Math.max(e.vendido, e.cobrado))) : 1;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-[var(--muted-foreground)] uppercase font-bold">Total Vendido</span>
          </div>
          <p className="text-2xl font-black text-[var(--foreground)]">${formatCurrency(resumen.total_vendido)}</p>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-xs text-[var(--muted-foreground)] uppercase font-bold">Total Cobrado</span>
          </div>
          <p className="text-2xl font-black text-[var(--foreground)]">${formatCurrency(resumen.total_cobrado)}</p>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-[var(--muted-foreground)] uppercase font-bold">Saldo Pendiente</span>
          </div>
          <p className="text-2xl font-black text-orange-400">${formatCurrency(resumen.saldo_pendiente)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-[var(--muted-foreground)] uppercase font-bold">Pagos Iniciales</span>
          </div>
          <p className="text-2xl font-black text-[var(--foreground)]">${formatCurrency(resumen.pagos_iniciales)}</p>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-[var(--muted-foreground)] uppercase font-bold">Pagos Adicionales</span>
          </div>
          <p className="text-2xl font-black text-[var(--foreground)]">${formatCurrency(resumen.pagos_adicionales)}</p>
        </div>
      </div>

      {/* Medios de pago */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h3 className="font-bold text-[var(--foreground)]">Medios de Pago</h3>
          <ExportCSVButton data={medios_pago} filename="cobranza_medios_pago.csv" />
        </div>
        <div className="p-4 space-y-3">
          {medios_pago.map((m) => (
            <div key={m.medio} className="flex items-center gap-3">
              <span className="text-sm text-[var(--foreground)] w-32 truncate">{m.medio}</span>
              <div className="flex-1 h-3 bg-[var(--muted)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                  style={{ width: `${(m.monto / maxMedio) * 100}%` }}
                />
              </div>
              <span className="text-sm font-bold text-[var(--foreground)] w-24 text-right">${formatCurrency(m.monto)}</span>
            </div>
          ))}
          {medios_pago.length === 0 && (
            <p className="text-center text-[var(--muted-foreground)] py-4">Sin pagos registrados</p>
          )}
        </div>
      </div>

      {/* Evolución mensual */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h3 className="font-bold text-[var(--foreground)]">Evolución Mensual</h3>
          <ExportCSVButton data={evolucion_mensual} filename="cobranza_evolucion.csv" />
        </div>
        <div className="p-4 space-y-4">
          {evolucion_mensual.map((e) => (
            <div key={e.mes} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--foreground)]">{e.mes}</span>
                <div className="flex gap-4 text-xs">
                  <span className="text-blue-400">Vendido: ${formatCurrency(e.vendido)}</span>
                  <span className="text-green-400">Cobrado: ${formatCurrency(e.cobrado)}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-full" style={{ width: `${(e.vendido / maxEvo) * 100}%` }} />
                </div>
                <div className="flex-1 h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                  <div className="h-full bg-green-400 rounded-full" style={{ width: `${(e.cobrado / maxEvo) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
          {evolucion_mensual.length === 0 && (
            <p className="text-center text-[var(--muted-foreground)] py-4">Sin datos para el período</p>
          )}
        </div>
      </div>

      {/* Ventas pendientes */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h3 className="font-bold text-[var(--foreground)]">Ventas con Saldo Pendiente</h3>
          <ExportCSVButton data={ventas_pendientes} filename="cobranza_pendientes.csv" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Código</th>
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Cliente</th>
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Total</th>
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Pagado</th>
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Pendiente</th>
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Días</th>
              </tr>
            </thead>
            <tbody>
              {ventas_pendientes.map((v) => (
                <tr key={v.id} className="border-b border-[var(--border)] hover:bg-[var(--muted)] transition-all">
                  <td className="p-4 text-blue-400 font-mono text-sm">{v.codigo}</td>
                  <td className="p-4 text-[var(--foreground)]">{v.cliente_nombre}</td>
                  <td className="p-4 text-[var(--foreground)] font-bold">${formatCurrency(v.precio_total)}</td>
                  <td className="p-4 text-green-400">${formatCurrency(v.pagado)}</td>
                  <td className="p-4 text-orange-400 font-bold">${formatCurrency(v.pendiente)}</td>
                  <td className="p-4 text-[var(--foreground)]">{v.dias_atraso}</td>
                </tr>
              ))}
              {ventas_pendientes.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-[var(--muted-foreground)]">No hay ventas con saldo pendiente</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
