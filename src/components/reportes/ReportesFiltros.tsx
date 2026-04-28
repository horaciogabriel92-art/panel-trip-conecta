'use client';

import { useEffect, useState } from 'react';
import { Calendar, User, Filter } from 'lucide-react';
import api from '@/lib/api';

interface VendedorOption {
  id: string;
  nombre: string;
  apellido: string;
}

interface ReportesFiltrosProps {
  fechaDesde: string;
  fechaHasta: string;
  vendedorId: string;
  onChange: (filtros: { fechaDesde: string; fechaHasta: string; vendedorId: string }) => void;
}

export default function ReportesFiltros({ fechaDesde, fechaHasta, vendedorId, onChange }: ReportesFiltrosProps) {
  const [vendedores, setVendedores] = useState<VendedorOption[]>([]);

  useEffect(() => {
    const fetchVendedores = async () => {
      try {
        const res = await api.get('/auth/users');
        const lista = (res.data || []).filter((u: any) => u.rol === 'vendedor');
        setVendedores(lista);
      } catch (err) {
        console.error(err);
      }
    };
    fetchVendedores();
  }, []);

  const hoy = new Date().toISOString().split('T')[0];
  const inicioMes = new Date();
  inicioMes.setDate(1);
  const inicioMesStr = inicioMes.toISOString().split('T')[0];

  return (
    <div className="glass-card rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Filter className="w-5 h-5 text-[var(--muted-foreground)]" />
        <h3 className="font-bold text-[var(--foreground)]">Filtros</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase">Desde</label>
          <div className="flex items-center gap-2 bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2">
            <Calendar className="w-4 h-4 text-[var(--muted-foreground)]" />
            <input
              type="date"
              value={fechaDesde || inicioMesStr}
              onChange={(e) => onChange({ fechaDesde: e.target.value, fechaHasta, vendedorId })}
              className="bg-transparent border-none outline-none text-sm w-full text-[var(--foreground)]"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase">Hasta</label>
          <div className="flex items-center gap-2 bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2">
            <Calendar className="w-4 h-4 text-[var(--muted-foreground)]" />
            <input
              type="date"
              value={fechaHasta || hoy}
              onChange={(e) => onChange({ fechaDesde, fechaHasta: e.target.value, vendedorId })}
              className="bg-transparent border-none outline-none text-sm w-full text-[var(--foreground)]"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-[var(--muted-foreground)] uppercase">Vendedor</label>
          <div className="flex items-center gap-2 bg-[var(--muted)] border border-[var(--border)] rounded-xl px-3 py-2">
            <User className="w-4 h-4 text-[var(--muted-foreground)]" />
            <select
              value={vendedorId}
              onChange={(e) => onChange({ fechaDesde, fechaHasta, vendedorId: e.target.value })}
              className="bg-transparent border-none outline-none text-sm w-full text-[var(--foreground)]"
            >
              <option value="">Todos los vendedores</option>
              {vendedores.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nombre} {v.apellido}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
