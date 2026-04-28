'use client';

import { useEffect, useState } from 'react';
import { MapPin, Package, Plane, Hotel } from 'lucide-react';
import { reportesAPI, ProductosReport as ProductosReportType, FiltrosReporte } from '@/lib/api-reportes';
import { formatCurrency } from '@/lib/utils';
import AirlineLogo from '@/components/flights/AirlineLogo';
import ExportCSVButton from './ExportCSVButton';

interface Props {
  filtros: FiltrosReporte;
}

export default function ProductosReport({ filtros }: Props) {
  const [data, setData] = useState<ProductosReportType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await reportesAPI.getProductos(filtros);
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

  const { destinos, paquetes, aerolineas, hospedajes_ciudad } = data;
  const maxDestino = destinos.length > 0 ? Math.max(...destinos.map((d) => d.cantidad)) : 1;
  const maxPaquete = paquetes.length > 0 ? Math.max(...paquetes.map((p) => p.monto)) : 1;
  const maxHospedaje = hospedajes_ciudad.length > 0 ? Math.max(...hospedajes_ciudad.map((h) => h.noches)) : 1;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Destinos */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-[var(--foreground)]">Top Destinos</h3>
          </div>
          <ExportCSVButton data={destinos} filename="productos_destinos.csv" />
        </div>
        <div className="p-4 space-y-3">
          {destinos.map((d) => (
            <div key={d.destino} className="flex items-center gap-3">
              <span className="text-sm text-[var(--foreground)] w-40 truncate">{d.destino}</span>
              <div className="flex-1 h-3 bg-[var(--muted)] rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 rounded-full" style={{ width: `${(d.cantidad / maxDestino) * 100}%` }} />
              </div>
              <span className="text-xs text-[var(--muted-foreground)] w-12 text-right">{d.cantidad}</span>
              <span className="text-sm font-bold text-[var(--foreground)] w-24 text-right">${formatCurrency(d.monto)}</span>
            </div>
          ))}
          {destinos.length === 0 && <p className="text-center text-[var(--muted-foreground)] py-4">Sin datos</p>}
        </div>
      </div>

      {/* Paquetes */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-[var(--foreground)]">Top Paquetes</h3>
          </div>
          <ExportCSVButton data={paquetes} filename="productos_paquetes.csv" />
        </div>
        <div className="p-4 space-y-3">
          {paquetes.map((p) => (
            <div key={p.paquete} className="flex items-center gap-3">
              <span className="text-sm text-[var(--foreground)] w-48 truncate">{p.paquete}</span>
              <div className="flex-1 h-3 bg-[var(--muted)] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(p.monto / maxPaquete) * 100}%` }} />
              </div>
              <span className="text-xs text-[var(--muted-foreground)] w-12 text-right">{p.cantidad}</span>
              <span className="text-sm font-bold text-[var(--foreground)] w-24 text-right">${formatCurrency(p.monto)}</span>
            </div>
          ))}
          {paquetes.length === 0 && <p className="text-center text-[var(--muted-foreground)] py-4">Sin datos</p>}
        </div>
      </div>

      {/* Aerolíneas */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Plane className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-[var(--foreground)]">Top Aerolíneas</h3>
          </div>
          <ExportCSVButton data={aerolineas} filename="productos_aerolineas.csv" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Logo</th>
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Aerolínea</th>
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Vuelos</th>
                <th className="text-left p-4 text-xs font-black text-[var(--muted-foreground)] uppercase">Monto Vendido</th>
              </tr>
            </thead>
            <tbody>
              {aerolineas.map((a) => (
                <tr key={a.codigo} className="border-b border-[var(--border)] hover:bg-[var(--muted)] transition-all">
                  <td className="p-4">
                    <AirlineLogo iataCode={a.codigo} size={32} />
                  </td>
                  <td className="p-4 text-[var(--foreground)] font-medium">{a.nombre}</td>
                  <td className="p-4 text-[var(--foreground)]">{a.cantidad}</td>
                  <td className="p-4 text-[var(--foreground)] font-bold">${formatCurrency(a.monto)}</td>
                </tr>
              ))}
              {aerolineas.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-[var(--muted-foreground)]">Sin datos</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hospedajes por ciudad */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Hotel className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-[var(--foreground)]">Hospedajes por Ciudad</h3>
          </div>
          <ExportCSVButton data={hospedajes_ciudad} filename="productos_hospedajes.csv" />
        </div>
        <div className="p-4 space-y-3">
          {hospedajes_ciudad.map((h) => (
            <div key={h.ciudad} className="flex items-center gap-3">
              <span className="text-sm text-[var(--foreground)] w-32 truncate">{h.ciudad}</span>
              <div className="flex-1 h-3 bg-[var(--muted)] rounded-full overflow-hidden">
                <div className="h-full bg-purple-400 rounded-full" style={{ width: `${(h.noches / maxHospedaje) * 100}%` }} />
              </div>
              <span className="text-xs text-[var(--muted-foreground)] w-16 text-right">{h.noches} noches</span>
              <span className="text-sm font-bold text-[var(--foreground)] w-24 text-right">${formatCurrency(h.monto)}</span>
            </div>
          ))}
          {hospedajes_ciudad.length === 0 && <p className="text-center text-[var(--muted-foreground)] py-4">Sin datos</p>}
        </div>
      </div>
    </div>
  );
}
