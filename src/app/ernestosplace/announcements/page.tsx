"use client";

import { useEffect, useState } from "react";
import { useErnesto } from "@/context/ErnestoContext";
import {
  Megaphone,
  Plus,
  Loader2,
  Trash2,
  Edit2,
  Mail,
  Send,
  X,
  Check,
  AlertTriangle,
  Info,
} from "lucide-react";

interface Announcement {
  id: string;
  titulo: string;
  mensaje: string;
  tipo: "info" | "warning" | "success";
  activo: boolean;
  created_at: string;
  expires_at: string | null;
}

const tipoConfig = {
  info: { label: "Info", icon: Info, color: "bg-blue-500/10 text-blue-500" },
  warning: { label: "Aviso", icon: AlertTriangle, color: "bg-amber-500/10 text-amber-500" },
  success: { label: "Éxito", icon: Check, color: "bg-emerald-500/10 text-emerald-500" },
};

export default function ErnestoAnnouncementsPage() {
  const { api } = useErnesto();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [form, setForm] = useState({
    titulo: "",
    mensaje: "",
    tipo: "info" as Announcement["tipo"],
    activo: true,
    expires_at: "",
  });

  const [emailForm, setEmailForm] = useState({
    asunto: "",
    mensaje: "",
    solo_activos: true,
    plan_slug: "",
  });
  const [emailSending, setEmailSending] = useState(false);
  const [emailResult, setEmailResult] = useState<{ sent: number; failed: number; total: number } | null>(null);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await api.get("/announcements");
      setAnnouncements(res.data.announcements);
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al cargar anuncios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [api]);

  const resetForm = () => {
    setForm({ titulo: "", mensaje: "", tipo: "info", activo: true, expires_at: "" });
    setEditing(null);
  };

  const openEdit = (a: Announcement) => {
    setEditing(a);
    setForm({
      titulo: a.titulo,
      mensaje: a.mensaje,
      tipo: a.tipo,
      activo: a.activo,
      expires_at: a.expires_at ? a.expires_at.slice(0, 16) : "",
    });
    setShowForm(true);
  };

  const saveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      };

      if (editing) {
        await api.put(`/announcements/${editing.id}`, payload);
      } else {
        await api.post("/announcements", payload);
      }
      setShowForm(false);
      resetForm();
      fetchAnnouncements();
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al guardar anuncio");
    }
  };

  const deleteAnnouncement = async (id: string) => {
    if (!confirm("¿Eliminar este anuncio?")) return;
    try {
      await api.delete(`/announcements/${id}`);
      fetchAnnouncements();
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al eliminar anuncio");
    }
  };

  const sendMassEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailSending(true);
    setEmailResult(null);
    try {
      const res = await api.post("/email-campaigns", {
        asunto: emailForm.asunto,
        mensaje: emailForm.mensaje,
        filtros: {
          solo_activos: emailForm.solo_activos,
          ...(emailForm.plan_slug && { plan_slug: emailForm.plan_slug }),
        },
      });
      setEmailResult(res.data);
      setEmailForm({ asunto: "", mensaje: "", solo_activos: true, plan_slug: "" });
    } catch (err: any) {
      setError(err.response?.data?.error || "Error al enviar email masivo");
    } finally {
      setEmailSending(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--foreground)]">Comunicaciones</h1>
        <p className="text-[var(--muted-foreground)]">Anuncios in-app y email masivo</p>
      </div>

      {error && <div className="p-4 rounded-xl bg-red-500/10 text-red-500 text-sm">{error}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
              <Megaphone className="w-5 h-5" />
              Anuncios in-app
            </h2>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--primary)] text-white text-sm"
            >
              <Plus className="w-4 h-4" />
              Nuevo
            </button>
          </div>

          <div className="glass-card rounded-2xl overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
              </div>
            ) : announcements.length === 0 ? (
              <div className="p-8 text-center text-[var(--muted-foreground)]">No hay anuncios</div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {announcements.map((a) => {
                  const config = tipoConfig[a.tipo];
                  const Icon = config.icon;
                  return (
                    <div key={a.id} className="p-4 flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                            <Icon className="w-3 h-3 inline mr-1" />
                            {config.label}
                          </span>
                          {!a.activo && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/10 text-gray-500">
                              Inactivo
                            </span>
                          )}
                        </div>
                        <h3 className="font-medium text-[var(--foreground)]">{a.titulo}</h3>
                        <p className="text-sm text-[var(--muted-foreground)] mt-1">{a.mensaje}</p>
                        <p className="text-xs text-[var(--muted-foreground)] mt-2">
                          Creado {new Date(a.created_at).toLocaleDateString("es-AR")}
                          {a.expires_at && ` · Vence ${new Date(a.expires_at).toLocaleDateString("es-AR")}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(a)}
                          className="p-2 rounded-lg hover:bg-[var(--accent)]/10 text-[var(--muted-foreground)]"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteAnnouncement(a.id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email masivo
          </h2>

          <div className="glass-card rounded-2xl p-6">
            <form onSubmit={sendMassEmail} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[var(--foreground)]">Asunto</label>
                <input
                  type="text"
                  value={emailForm.asunto}
                  onChange={(e) => setEmailForm({ ...emailForm, asunto: e.target.value })}
                  required
                  className="w-full mt-1 bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2 text-[var(--foreground)]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--foreground)]">Mensaje</label>
                <textarea
                  value={emailForm.mensaje}
                  onChange={(e) => setEmailForm({ ...emailForm, mensaje: e.target.value })}
                  required
                  rows={8}
                  className="w-full mt-1 bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2 text-[var(--foreground)]"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                  <input
                    type="checkbox"
                    checked={emailForm.solo_activos}
                    onChange={(e) => setEmailForm({ ...emailForm, solo_activos: e.target.checked })}
                    className="rounded"
                  />
                  Solo tenants activos
                </label>
              </div>
              <button
                type="submit"
                disabled={emailSending}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[var(--primary)] text-white disabled:opacity-50"
              >
                {emailSending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Enviar a todos
                  </>
                )}
              </button>
            </form>

            {emailResult && (
              <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 text-emerald-500 text-sm">
                Enviados: {emailResult.sent} · Fallidos: {emailResult.failed} · Total: {emailResult.total}
              </div>
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card)] rounded-2xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">
              {editing ? "Editar anuncio" : "Nuevo anuncio"}
            </h2>
            <form onSubmit={saveAnnouncement} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[var(--foreground)]">Título</label>
                <input
                  type="text"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  required
                  className="w-full mt-1 bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2 text-[var(--foreground)]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--foreground)]">Mensaje</label>
                <textarea
                  value={form.mensaje}
                  onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                  required
                  rows={4}
                  className="w-full mt-1 bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2 text-[var(--foreground)]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[var(--foreground)]">Tipo</label>
                  <select
                    value={form.tipo}
                    onChange={(e) => setForm({ ...form, tipo: e.target.value as any })}
                    className="w-full mt-1 bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2 text-[var(--foreground)]"
                  >
                    <option value="info">Info</option>
                    <option value="warning">Aviso</option>
                    <option value="success">Éxito</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--foreground)]">Vencimiento</label>
                  <input
                    type="datetime-local"
                    value={form.expires_at}
                    onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                    className="w-full mt-1 bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2 text-[var(--foreground)]"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                <input
                  type="checkbox"
                  checked={form.activo}
                  onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                  className="rounded"
                />
                Activo
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-xl border border-[var(--border)] text-[var(--foreground)]"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
