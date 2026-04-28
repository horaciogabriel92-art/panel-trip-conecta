'use client';

import { useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Users, Package, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReportesFiltros from '@/components/reportes/ReportesFiltros';
import PipelineReport from '@/components/reportes/PipelineReport';
import CobranzaReport from '@/components/reportes/CobranzaReport';
import VendedoresReport from '@/components/reportes/VendedoresReport';
import ProductosReport from '@/components/reportes/ProductosReport';
import CRMReport from '@/components/reportes/CRMReport';
import { FiltrosReporte } from '@/lib/api-reportes';

const tabs = [
  { id: 'pipeline', label: 'Pipeline', icon: TrendingUp },
  { id: 'cobranza', label: 'Cobranza', icon: DollarSign },
  { id: 'vendedores', label: 'Vendedores', icon: Users },
  { id: 'productos', label: 'Productos', icon: Package },
  { id: 'crm', label: 'CRM', icon: Activity },
];

export default function ReportesPage() {
  const [activeTab, setActiveTab] = useState('pipeline');
  const hoy = new Date().toISOString().split('T')[0];
  const inicioMes = new Date();
  inicioMes.setDate(1);
  const inicioMesStr = inicioMes.toISOString().split('T')[0];
  const [filtros, setFiltros] = useState<FiltrosReporte>({
    fechaDesde: inicioMesStr,
    fechaHasta: hoy,
    vendedorId: '',
  });

  const handleFiltrosChange = (nuevos: { fechaDesde: string; fechaHasta: string; vendedorId: string }) => {
    setFiltros({
      fechaDesde: nuevos.fechaDesde,
      fechaHasta: nuevos.fechaHasta,
      vendedorId: nuevos.vendedorId,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-emerald-400" />
            <h2 className="text-3xl font-black text-[var(--foreground)]">Reportes</h2>
          </div>
          <p className="text-[var(--muted-foreground)] mt-1">Análisis y métricas del negocio</p>
        </div>
      </div>

      {/* Filtros */}
      <ReportesFiltros
        fechaDesde={filtros.fechaDesde}
        fechaHasta={filtros.fechaHasta}
        vendedorId={filtros.vendedorId}
        onChange={handleFiltrosChange}
      />

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--border)]'
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Contenido */}
      <div className="min-h-[400px]">
        {activeTab === 'pipeline' && <PipelineReport filtros={filtros} />}
        {activeTab === 'cobranza' && <CobranzaReport filtros={filtros} />}
        {activeTab === 'vendedores' && <VendedoresReport filtros={filtros} />}
        {activeTab === 'productos' && <ProductosReport filtros={filtros} />}
        {activeTab === 'crm' && <CRMReport filtros={filtros} />}
      </div>
    </div>
  );
}
