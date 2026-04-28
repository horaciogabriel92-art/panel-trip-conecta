'use client';

import { useEffect, useState } from 'react';
import { Trophy, TrendingUp, DollarSign, Users, FileText } from 'lucide-react';
import { reportesAPI, VendedoresReport as VendedoresReportType, FiltrosReporte } from '@/lib/api-reportes';
import { formatCurrency } from '@/lib/utils';
import ExportCSVButton from './ExportCSVButton';

interface Props {
  filtros: FiltrosReporte;
}

export default function VendedoresReport({ filtros }: Props) {
  const [data, setData] = useState<VendedoresReportType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await reportesAPI.getVendedores(filtros);
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

  const { vendedores, totales } = data;
  const maxVendido = vendedores.length > 0 ? Math.max(...vendedores.map((v) => v.total_vendido)) : 1;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Totales */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-[var(--muted-foreground)] uppercase font-bold">Cotizaciones</span>
          </div>
          <p className="text-xl font-black text-[var(--foreground)]">{totales.total_cotizaciones}</p>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-xs text-[var(--muted-foreground)] uppercase font-bold">Ventas</span>
          </div>
          <p className="text-xl font-black text-[var(--foreground)]">{totales.total_ventas}</p>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-[var(--muted-foreground)] uppercase font-bold">Total Vendido</span>
          </div>
          <p className="text-xl font-black text-[var(--foreground)]">${formatCurrency(totales.total_vendido)}</p>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-[var(--muted-foreground)] uppercase font-bold">Com. Generadas</span>
          </div>
          <p className="text-xl font-black text-[var(--foreground)]">${formatCurrency(totales.total_comisiones_generadas)}</p>
        </div>
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-[var(--muted-foreground)] uppercase font-bold">Com. Pagadas</span>
          </div>
          <p className="text-xl font-black text-[var(--foreground)]">${formatCurrency(totales.total_comisiones_pagadas)}</p>
        </div>
      </div>

      {/* Ranking */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h3 className="font-bold text-[var(--foreground)]">Ranking de Vendedores</h3>
          <ExportCSVButton data={vendedores} filename="vendedores_ranking.csv" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">#</th>
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Vendedor</th>
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Cotizaciones</th>
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Ventas</th>
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Conversión</th>
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Total Vendido</th>
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Com. Generada</th>
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Com. Pagada</th>
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Com. Pendiente</th>
              </tr>
            </thead>
            <tbody>
              {vendedores.map((v, idx) => (
                <tr key={v.vendedor_id} className="border-b border-[var(--border)] hover:bg-[var(--muted)] transition-all">
                  <td className="p-4">
                    {idx < 3 ? (
                      <Trophy className={`w-5 h-5 ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-300' : 'text-amber-600'}`} />
                    ) : (
                      <span className="text-[var(--muted-foreground)] text-sm">{idx + 1}</span>
                    )}
                  </td>
                  <td className="p-4 text-[var(--foreground)] font-medium">{v.vendedor_nombre}</td>
                  <td className="p-4 text-[var(--foreground)]">{v.cotizaciones}</td>
                  <td className="p-4 text-[var(--foreground)]">{v.ventas}</td>
                  <td className="p-4">
                    <span className={`font-bold ${v.conversion_pct >= 30 ? 'text-green-400' : v.conversion_pct >= 15 ? 'text-orange-400' : 'text-red-400'}`}>
                      {v.conversion_pct}%
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-[var(--muted)] rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400 rounded-full" style={{ width: `${(v.total_vendido / maxVendido) * 100}%` }} />
                      </div>
                      <span className="text-[var(--foreground)] font-bold">${formatCurrency(v.total_vendido)}</span>
                    </div>
                  </td>
                  <td className="p-4 text-[var(--foreground)]">${formatCurrency(v.comisiones_generadas)}</td>
                  <td className="p-4 text-green-400">${formatCurrency(v.comisiones_pagadas)}</td>
                  <td className="p-4 text-orange-400">${formatCurrency(v.comisiones_pendientes)}</td>
                </tr>
              ))}
              {vendedores.length === 0 && (
                <tr><td colSpan={9} className="p-8 text-center text-[var(--muted-foreground)]">Sin datos para el período</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
