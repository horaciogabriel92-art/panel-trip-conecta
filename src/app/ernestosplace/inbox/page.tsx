"use client";

import { useEffect, useState } from "react";
import { useErnesto } from "@/context/ErnestoContext";
import {
  Inbox,
  Search,
  Loader2,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  X,
} from "lucide-react";

interface Ticket {
  id: string;
  tenant_id: string;
  usuario_id: string;
  email: string;
  nombre: string;
  nombre_agencia: string;
  asunto: string;
  categoria: string;
  mensaje: string;
  adjunto_url: string | null;
  estado: "abierto" | "en_proceso" | "resuelto" | "cerrado";
  prioridad: "baja" | "media" | "alta" | "urgente";
  created_at: string;
  updated_at: string;
  tenants?: { nombre: string; slug: string };
}

interface Reply {
  id: string;
  mensaje: string;
  created_at: string;
  es_interno: boolean;
  superadmin_id?: string;
  usuario_id?: string;
  superadmins?: { nombre: string };
  users?: { nombre: string; apellido: string };
}

const estados = {
  abierto: { label: "Abierto", color: "bg-blue-500/10 text-blue-500" },
  en_proceso: { label: "En proceso", color: "bg-amber-500/10 text-amber-500" },
  resuelto: { label: "Resuelto", color: "bg-emerald-500/10 text-emerald-500" },
  cerrado: { label: "Cerrado", color: "bg-gray-500/10 text-gray-500" },
};

const prioridades = {
  baja: { label: "Baja", color: "bg-gray-500/10 text-gray-500" },
  media: { label: "Media", color: "bg-blue-500/10 text-blue-500" },
  alta: { label: "Alta", color: "bg-amber-500/10 text-amber-500" },
  urgente: { label: "Urgente", color: "bg-red-500/10 text-red-500" },
};

export default function ErnestoInboxPage() {
  const { api } = useErnesto();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [reply, setReply] = useState("");
  const [filters, setFilters] = useState({ estado: "", search: "" });
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
        ...(filters.estado && { estado: filters.estado }),
        ...(filters.search && { search: filters.search }),
      });
      const res = await api.get(`/support-tickets?${params.toString()}`);
      setTickets(res.data.tickets);
      setPagination(res.data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al cargar tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [pagination.page, filters.estado]);

  const openTicket = async (ticket: Ticket) => {
    setSelected(ticket);
    try {
      const res = await api.get(`/support-tickets/${ticket.id}`);
      setReplies(res.data.replies || []);
    } catch (err) {
      console.error("Error cargando ticket:", err);
    }
  };

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !reply.trim()) return;
    try {
      await api.post(`/support-tickets/${selected.id}/reply`, {
        mensaje: reply,
        notificar_email: true,
      });
      setReply("");
      openTicket(selected);
      fetchTickets();
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al enviar respuesta");
    }
  };

  const updateStatus = async (estado: Ticket["estado"]) => {
    if (!selected) return;
    try {
      await api.put(`/support-tickets/${selected.id}`, { estado });
      setSelected({ ...selected, estado });
      fetchTickets();
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al actualizar estado");
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-4rem)]">
      <div>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Soporte</h1>
        <p className="text-[var(--muted-foreground)]">Tickets de ayuda de los tenants</p>
      </div>

      {error && <div className="p-4 rounded-xl bg-red-500/10 text-red-500 text-sm">{error}</div>}

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted-foreground)]" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && fetchTickets()}
            placeholder="Buscar por asunto, email o agencia"
            className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl pl-12 pr-4 py-3 text-[var(--foreground)]"
          />
        </div>
        <select
          value={filters.estado}
          onChange={(e) => setFilters((f) => ({ ...f, estado: e.target.value }))}
          className="bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--foreground)]"
        >
          <option value="">Todos</option>
          <option value="abierto">Abierto</option>
          <option value="en_proceso">En proceso</option>
          <option value="resuelto">Resuelto</option>
          <option value="cerrado">Cerrado</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div className="glass-card rounded-2xl overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              {tickets.length === 0 ? (
                <div className="p-8 text-center text-[var(--muted-foreground)]">
                  No hay tickets
                </div>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {tickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      onClick={() => openTicket(ticket)}
                      className={`w-full text-left p-4 hover:bg-[var(--accent)]/5 transition-colors ${
                        selected?.id === ticket.id ? "bg-[var(--accent)]/10" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-[var(--foreground)] truncate">{ticket.asunto}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${estados[ticket.estado].color}`}>
                          {estados[ticket.estado].label}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--muted-foreground)] mt-1">{ticket.nombre_agencia}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-[var(--muted-foreground)]">
                        <span className={`px-2 py-0.5 rounded-full ${prioridades[ticket.prioridad].color}`}>
                          {prioridades[ticket.prioridad].label}
                        </span>
                        <span>{new Date(ticket.created_at).toLocaleDateString("es-AR")}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 glass-card rounded-2xl p-6 overflow-auto">
          {!selected ? (
            <div className="h-full flex flex-col items-center justify-center text-[var(--muted-foreground)]">
              <Inbox className="w-16 h-16 mb-4 opacity-20" />
              <p>Seleccioná un ticket para ver el detalle</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-start justify-between border-b border-[var(--border)] pb-4">
                <div>
                  <h2 className="text-xl font-bold text-[var(--foreground)]">{selected.asunto}</h2>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">
                    {selected.nombre} · {selected.email} · {selected.nombre_agencia}
                  </p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="p-2 rounded-lg hover:bg-[var(--accent)]/10 text-[var(--muted-foreground)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${estados[selected.estado].color}`}>
                  {estados[selected.estado].label}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${prioridades[selected.prioridad].color}`}>
                  {prioridades[selected.prioridad].label}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--accent)]/10 text-[var(--muted-foreground)]">
                  {selected.categoria}
                </span>
              </div>

              <div className="bg-[var(--background)] rounded-xl p-4">
                <p className="text-[var(--foreground)] whitespace-pre-wrap">{selected.mensaje}</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-4">
                  Recibido el {new Date(selected.created_at).toLocaleString("es-AR")}
                </p>
              </div>

              <div className="space-y-4">
                {replies.map((r) => (
                  <div
                    key={r.id}
                    className={`rounded-xl p-4 ${
                      r.superadmin_id ? "bg-[var(--primary)]/10 ml-8" : "bg-[var(--accent)]/10 mr-8"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-[var(--foreground)]">
                        {r.superadmin_id
                          ? r.superadmins?.nombre || "Equipo"
                          : `${r.users?.nombre || ""} ${r.users?.apellido || ""}`.trim() || "Usuario"}
                      </span>
                      {r.es_interno && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-500">
                          Interno
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap">{r.mensaje}</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-2">
                      {new Date(r.created_at).toLocaleString("es-AR")}
                    </p>
                  </div>
                ))}
              </div>

              <form onSubmit={sendReply} className="space-y-3 pt-4 border-t border-[var(--border)]">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Escribí una respuesta..."
                  rows={4}
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl p-4 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                />
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {(["abierto", "en_proceso", "resuelto", "cerrado"] as const).map((estado) => (
                      <button
                        key={estado}
                        type="button"
                        onClick={() => updateStatus(estado)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                          selected.estado === estado
                            ? "bg-[var(--primary)] text-white border-[var(--primary)]"
                            : "border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]/10"
                        }`}
                      >
                        {estados[estado].label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="submit"
                    disabled={!reply.trim()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    Responder
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
