'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Send, CheckCircle, XCircle, FileText, DollarSign } from 'lucide-react';
import { reportesAPI, PipelineReport as PipelineReportType, FiltrosReporte } from '@/lib/api-reportes';
import { formatCurrency } from '@/lib/utils';
import ExportCSVButton from './ExportCSVButton';

interface Props {
  filtros: FiltrosReporte;
}

export default function PipelineReport({ filtros }: Props) {
  const [data, setData] = useState<PipelineReportType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await reportesAPI.getPipeline(filtros);
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

  const { resumen, por_mes, por_vendedor } = data;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Cards resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-[var(--muted-foreground)] uppercase font-bold">Total Cotizaciones</span>
          </div>
          <p className="text-2xl font-black text-[var(--foreground)]">{resumen.total_cotizaciones}</p>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Send className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-[var(--muted-foreground)] uppercase font-bold">Enviadas</span>
          </div>
          <p className="text-2xl font-black text-[var(--foreground)]">{resumen.enviadas}</p>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-xs text-[var(--muted-foreground)] uppercase font-bold">Vendidas</span>
          </div>
          <p className="text-2xl font-black text-[var(--foreground)]">{resumen.vendidas}</p>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-4 h-4 text-red-400" />
            <span className="text-xs text-[var(--muted-foreground)] uppercase font-bold">Perdidas</span>
          </div>
          <p className="text-2xl font-black text-[var(--foreground)]">{resumen.perdidas}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-[var(--muted-foreground)] uppercase font-bold">Tasa de Conversión</span>
          </div>
          <p className="text-2xl font-black text-emerald-400">{resumen.tasa_conversion}%</p>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-[var(--muted-foreground)] uppercase font-bold">Ticket Promedio Cotizado</span>
          </div>
          <p className="text-2xl font-black text-[var(--foreground)]">${formatCurrency(resumen.ticket_promedio_cotizado)}</p>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-xs text-[var(--muted-foreground)] uppercase font-bold">Ticket Promedio Vendido</span>
          </div>
          <p className="text-2xl font-black text-[var(--foreground)]">${formatCurrency(resumen.ticket_promedio_vendido)}</p>
        </div>
      </div>

      {/* Por mes */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h3 className="font-bold text-[var(--foreground)]">Evolución por Mes</h3>
          <ExportCSVButton data={por_mes} filename="pipeline_por_mes.csv" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Mes</th>
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Total</th>
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Nuevas</th>
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Enviadas</th>
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Vendidas</th>
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Perdidas</th>
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Monto</th>
              </tr>
            </thead>
            <tbody>
              {por_mes.map((m) => (
                <tr key={m.mes} className="border-b border-[var(--border)] hover:bg-[var(--muted)] transition-all">
                  <td className="p-4 text-[var(--foreground)] font-medium">{m.mes}</td>
                  <td className="p-4 text-[var(--foreground)]">{m.total}</td>
                  <td className="p-4 text-[var(--foreground)]">{m.nuevas}</td>
                  <td className="p-4 text-orange-400">{m.enviadas}</td>
                  <td className="p-4 text-green-400">{m.vendidas}</td>
                  <td className="p-4 text-red-400">{m.perdidas}</td>
                  <td className="p-4 text-[var(--foreground)] font-bold">${formatCurrency(m.monto)}</td>
                </tr>
              ))}
              {por_mes.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-[var(--muted-foreground)]">Sin datos para el período</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Por vendedor */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h3 className="font-bold text-[var(--foreground)]">Comparativa por Vendedor</h3>
          <ExportCSVButton data={por_vendedor} filename="pipeline_por_vendedor.csv" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Vendedor</th>
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Total</th>
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Enviadas</th>
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Vendidas</th>
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Perdidas</th>
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Monto Total</th>
              </tr>
            </thead>
            <tbody>
              {por_vendedor.map((v) => (
                <tr key={v.vendedor_id} className="border-b border-[var(--border)] hover:bg-[var(--muted)] transition-all">
                  <td className="p-4 text-[var(--foreground)] font-medium">{v.vendedor_nombre}</td>
                  <td className="p-4 text-[var(--foreground)]">{v.total}</td>
                  <td className="p-4 text-orange-400">{v.enviadas}</td>
                  <td className="p-4 text-green-400">{v.vendidas}</td>
                  <td className="p-4 text-red-400">{v.perdidas}</td>
                  <td className="p-4 text-[var(--foreground)] font-bold">${formatCurrency(v.monto)}</td>
                </tr>
              ))}
              {por_vendedor.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-[var(--muted-foreground)]">Sin datos para el período</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
