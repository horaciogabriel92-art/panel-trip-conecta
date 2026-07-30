"use client";

import { useEffect, useState } from "react";
import { useErnesto } from "@/context/ErnestoContext";
import {
  Building2,
  Users,
  FileText,
  UserCircle,
  Package,
  TrendingUp,
  Loader2,
} from "lucide-react";

interface Stats {
  tenants: { total: number; activos: number; inactivos: number; trial: number; pagando: number };
  users: { total: number; activos: number };
  cotizaciones: number;
  clientes: number;
  paquetes: number;
  finances: { mrr: number; arr: number };
}

export default function ErnestoDashboardPage() {
  const { api } = useErnesto();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/stats")
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.response?.data?.error || "Error al cargar estadísticas"))
      .finally(() => setLoading(false));
  }, [api]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8 rounded-2xl bg-red-500/10 text-red-500">
        {error || "No se pudieron cargar las estadísticas"}
      </div>
    );
  }

  const statCards = [
    { label: "Tenants totales", value: stats.tenants.total, icon: Building2 },
    { label: "Tenants activos", value: stats.tenants.activos, icon: Building2 },
    { label: "Usuarios", value: stats.users.total, icon: Users },
    { label: "Cotizaciones", value: stats.cotizaciones, icon: FileText },
    { label: "Clientes", value: stats.clientes, icon: UserCircle },
    { label: "Paquetes", value: stats.paquetes, icon: Package },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Dashboard</h1>
        <p className="text-[var(--muted-foreground)]">Vista global del SaaS</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="glass-card rounded-2xl p-6 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
                <Icon className="w-6 h-6 text-[var(--primary)]" />
              </div>
              <div>
                <p className="text-sm text-[var(--muted-foreground)]">{card.label}</p>
                <p className="text-2xl font-bold text-[var(--foreground)]">{card.value}</p>
              </div>
            </div>
          );
        })}

        <div className="glass-card rounded-2xl p-6 flex items-center gap-4 border-emerald-500/20">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm text-[var(--muted-foreground)]">MRR estimado</p>
            <p className="text-2xl font-bold text-emerald-500">US$ {stats.finances.mrr.toFixed(2)}</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 flex items-center gap-4 border-cyan-500/20">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-cyan-500" />
          </div>
          <div>
            <p className="text-sm text-[var(--muted-foreground)]">ARR estimado</p>
            <p className="text-2xl font-bold text-cyan-500">US$ {stats.finances.arr.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "En trial", value: stats.tenants.trial },
          { label: "Pagando", value: stats.tenants.pagando },
          { label: "Inactivos", value: stats.tenants.inactivos },
          { label: "Usuarios activos", value: stats.users.activos },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-[var(--border)] p-4 text-center">
            <p className="text-2xl font-bold text-[var(--foreground)]">{item.value}</p>
            <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
