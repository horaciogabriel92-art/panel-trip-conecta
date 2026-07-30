"use client";

import { useEffect, useState } from "react";
import { useErnesto } from "@/context/ErnestoContext";
import {
  Search,
  Filter,
  Building2,
  MoreHorizontal,
  Loader2,
  CheckCircle2,
  XCircle,
  Edit2,
  Users,
  Mail,
  Phone,
  Globe,
} from "lucide-react";

interface Plan {
  id: string;
  slug: string;
  nombre: string;
  max_users: number | null;
  max_cotizaciones_por_mes: number | null;
  max_paquetes: number | null;
  precio_mensual_usd: number;
}

interface Tenant {
  id: string;
  nombre: string;
  slug: string;
  dominio: string | null;
  email_contacto: string | null;
  telefono: string | null;
  activo: boolean;
  estado_suscripcion: string;
  trial_ends_at: string | null;
  plan_started_at: string | null;
  created_at: string;
  plan: Plan;
  limites_override: {
    max_users?: number | null;
    max_cotizaciones_por_mes?: number | null;
    max_paquetes?: number | null;
  };
}

export default function ErnestoClientsPage() {
  const { api } = useErnesto();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ activo: "", estado_suscripcion: "", plan_slug: "" });
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });
  const [editing, setEditing] = useState<Tenant | null>(null);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
        ...(search && { search }),
        ...(filters.activo && { activo: filters.activo }),
        ...(filters.estado_suscripcion && { estado_suscripcion: filters.estado_suscripcion }),
        ...(filters.plan_slug && { plan_slug: filters.plan_slug }),
      });
      const res = await api.get(`/tenants?${params.toString()}`);
      setTenants(res.data.tenants);
      setPagination(res.data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al cargar tenants");
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/config/plans`);
      const data = await res.json();
      setPlans(Array.isArray(data) ? data : data.plans || []);
    } catch (err) {
      console.error("Error cargando planes:", err);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    fetchTenants();
  }, [pagination.page, filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((p) => ({ ...p, page: 1 }));
    fetchTenants();
  };

  const toggleTenant = async (id: string) => {
    try {
      await api.post(`/tenants/${id}/toggle`);
      fetchTenants();
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al cambiar estado");
    }
  };

  const saveTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      await api.put(`/tenants/${editing.id}`, {
        plan_id: editing.plan.id,
        activo: editing.activo,
        estado_suscripcion: editing.estado_suscripcion,
        limites_override: editing.limites_override,
      });
      setEditing(null);
      fetchTenants();
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al guardar cambios");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Clientes</h1>
          <p className="text-[var(--muted-foreground)]">Gestión de tenants, planes y límites</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 text-red-500 text-sm">{error}</div>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, slug, email o dominio"
            className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl pl-12 pr-4 py-3 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
          />
        </form>

        <div className="flex gap-3">
          <select
            value={filters.activo}
            onChange={(e) => setFilters((f) => ({ ...f, activo: e.target.value }))}
            className="bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)]"
          >
            <option value="">Todos los estados</option>
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>

          <select
            value={filters.estado_suscripcion}
            onChange={(e) => setFilters((f) => ({ ...f, estado_suscripcion: e.target.value }))}
            className="bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)]"
          >
            <option value="">Todas las suscripciones</option>
            <option value="trial">Trial</option>
            <option value="activo">Activo</option>
            <option value="suspendido">Suspendido</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[var(--accent)]/5 text-[var(--muted-foreground)] text-xs uppercase">
                <tr>
                  <th className="px-6 py-4">Tenant</th>
                  <th className="px-6 py-4">Plan</th>
                  <th className="px-6 py-4">Límites</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Creado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-[var(--accent)]/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-[var(--primary)]" />
                        </div>
                        <div>
                          <p className="font-medium text-[var(--foreground)]">{tenant.nombre}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">{tenant.slug}</p>
                          {tenant.dominio && (
                            <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1 mt-1">
                              <Globe className="w-3 h-3" /> {tenant.dominio}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--primary)]/10 text-[var(--primary)]">
                        {tenant.plan.nombre}
                      </span>
                      <p className="text-xs text-[var(--muted-foreground)] mt-1">
                        US$ {tenant.plan.precio_mensual_usd}/mes
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" /> {tenant.plan.max_users ?? "∞"} usuarios
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="w-4 h-4" /> {tenant.plan.max_cotizaciones_por_mes ?? "∞"} cotiz/mes
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="w-4 h-4" /> {tenant.plan.max_paquetes ?? "∞"} paquetes
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium w-fit ${
                            tenant.activo
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-red-500/10 text-red-500"
                          }`}
                        >
                          {tenant.activo ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {tenant.activo ? "Activo" : "Inactivo"}
                        </span>
                        <span className="text-xs text-[var(--muted-foreground)] capitalize">
                          {tenant.estado_suscripcion}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">
                      {new Date(tenant.created_at).toLocaleDateString("es-AR")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditing(tenant)}
                          className="p-2 rounded-lg hover:bg-[var(--accent)]/10 text-[var(--muted-foreground)]"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleTenant(tenant.id)}
                          className={`p-2 rounded-lg ${
                            tenant.activo
                              ? "hover:bg-red-500/10 text-red-500"
                              : "hover:bg-emerald-500/10 text-emerald-500"
                          }`}
                          title={tenant.activo ? "Desactivar" : "Activar"}
                        >
                          {tenant.activo ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[var(--muted-foreground)]">
            Página {pagination.page} de {pagination.totalPages} ({pagination.total} resultados)
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
              disabled={pagination.page === 1}
              className="px-4 py-2 rounded-xl border border-[var(--border)] disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setPagination((p) => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 rounded-xl border border-[var(--border)] disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card)] rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-auto">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">
              Editar {editing.nombre}
            </h2>
            <form onSubmit={saveTenant} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[var(--foreground)]">Plan</label>
                <select
                  value={editing.plan.id}
                  onChange={(e) => {
                    const plan = plans.find((p) => p.id === e.target.value);
                    if (plan) setEditing({ ...editing, plan });
                  }}
                  className="w-full mt-1 bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2 text-[var(--foreground)]"
                >
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.nombre} (US$ {plan.precio_mensual_usd}/mes)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[var(--foreground)]">Estado suscripción</label>
                  <select
                    value={editing.estado_suscripcion}
                    onChange={(e) =>
                      setEditing({ ...editing, estado_suscripcion: e.target.value as any })
                    }
                    className="w-full mt-1 bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2 text-[var(--foreground)]"
                  >
                    <option value="trial">Trial</option>
                    <option value="activo">Activo</option>
                    <option value="suspendido">Suspendido</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--foreground)]">Activo</label>
                  <select
                    value={String(editing.activo)}
                    onChange={(e) => setEditing({ ...editing, activo: e.target.value === "true" })}
                    className="w-full mt-1 bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2 text-[var(--foreground)]"
                  >
                    <option value="true">Sí</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>

              <div className="border-t border-[var(--border)] pt-4">
                <p className="text-sm font-medium text-[var(--foreground)] mb-2">Límites personalizados (opcional)</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-[var(--muted-foreground)]">Usuarios</label>
                    <input
                      type="number"
                      value={editing.limites_override?.max_users ?? ""}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          limites_override: {
                            ...editing.limites_override,
                            max_users: e.target.value ? Number(e.target.value) : null,
                          },
                        })
                      }
                      placeholder="∞"
                      className="w-full mt-1 bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--foreground)]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--muted-foreground)]">Cotiz/mes</label>
                    <input
                      type="number"
                      value={editing.limites_override?.max_cotizaciones_por_mes ?? ""}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          limites_override: {
                            ...editing.limites_override,
                            max_cotizaciones_por_mes: e.target.value ? Number(e.target.value) : null,
                          },
                        })
                      }
                      placeholder="∞"
                      className="w-full mt-1 bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--foreground)]"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--muted-foreground)]">Paquetes</label>
                    <input
                      type="number"
                      value={editing.limites_override?.max_paquetes ?? ""}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          limites_override: {
                            ...editing.limites_override,
                            max_paquetes: e.target.value ? Number(e.target.value) : null,
                          },
                        })
                      }
                      placeholder="∞"
                      className="w-full mt-1 bg-[var(--background)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--foreground)]"
                    />
                  </div>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-2">
                  Dejá vacío para usar el límite del plan.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 rounded-xl border border-[var(--border)] text-[var(--foreground)]"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white">
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
