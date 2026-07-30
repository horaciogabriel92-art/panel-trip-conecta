"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import {
  Ticket,
  Plus,
  Loader2,
  MessageSquare,
  Send,
  X,
  CheckCircle2,
  Paperclip,
  ImageIcon,
  Trash2,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface TicketItem {
  id: string;
  asunto: string;
  categoria: string;
  mensaje: string;
  estado: "abierto" | "en_proceso" | "resuelto" | "cerrado";
  prioridad: "baja" | "media" | "alta" | "urgente";
  created_at: string;
  adjunto_url: string | null;
}

interface Reply {
  id: string;
  mensaje: string;
  created_at: string;
  superadmin_id?: string;
  usuario_id?: string;
  superadmins?: { nombre: string };
}

interface Attachment {
  id: string;
  file_name: string;
  file_url: string;
  content_type?: string;
}

const estados = {
  abierto: { label: "Abierto", color: "bg-blue-500/10 text-blue-500" },
  en_proceso: { label: "En proceso", color: "bg-amber-500/10 text-amber-500" },
  resuelto: { label: "Resuelto", color: "bg-emerald-500/10 text-emerald-500" },
  cerrado: { label: "Cerrado", color: "bg-gray-500/10 text-gray-500" },
};

export default function AyudaPage() {
  const { token } = useAuth();
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<TicketItem | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [adjuntos, setAdjuntos] = useState<Attachment[]>([]);
  const [reply, setReply] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    asunto: "",
    categoria: "soporte_tecnico",
    mensaje: "",
    prioridad: "media",
  });
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const api = axios.create({
    baseURL: `${API_URL}/support`,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const uploadApi = axios.create({
    baseURL: `${API_URL}/upload`,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const fetchTickets = async () => {
    try {
      const res = await api.get("/tickets");
      setTickets(res.data.tickets);
    } catch (err) {
      console.error("Error cargando tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [token]);

  const openTicket = async (ticket: TicketItem) => {
    setSelected(ticket);
    try {
      const res = await api.get(`/tickets/${ticket.id}`);
      setReplies(res.data.replies || []);
      setAdjuntos(res.data.adjuntos || []);
    } catch (err) {
      console.error("Error cargando ticket:", err);
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        const formData = new FormData();
        formData.append("adjunto", file);
        const res = await uploadApi.post("/support-attachment", formData);
        setPendingAttachments((prev) => [...prev, { id: res.data.path, file_name: res.data.file_name, file_url: res.data.url }]);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || "Error al subir adjunto");
    } finally {
      setUploading(false);
    }
  };

  const removePendingAttachment = (id: string) => {
    setPendingAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const createTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/tickets", {
        ...form,
        adjuntos: pendingAttachments.map((a) => ({ url: a.file_url, path: a.id, file_name: a.file_name })),
      });
      setShowForm(false);
      setForm({ asunto: "", categoria: "soporte_tecnico", mensaje: "", prioridad: "media" });
      setPendingAttachments([]);
      fetchTickets();
    } catch (err: any) {
      alert(err.response?.data?.error || "Error al crear ticket");
    }
  };

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !reply.trim()) return;
    try {
      await api.post(`/tickets/${selected.id}/reply`, { mensaje: reply });
      setReply("");
      openTicket(selected);
      fetchTickets();
    } catch (err: any) {
      alert(err.response?.data?.error || "Error al enviar respuesta");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Ayuda</h1>
          <p className="text-[var(--muted-foreground)]">Contactá al equipo de Quotix Travel</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white"
        >
          <Plus className="w-4 h-4" />
          Nuevo ticket
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
        <div className="glass-card rounded-2xl overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-[var(--muted-foreground)] p-8">
              <Ticket className="w-12 h-12 mb-4 opacity-20" />
              <p>No tenés tickets de soporte</p>
            </div>
          ) : (
            <div className="flex-1 overflow-auto divide-y divide-[var(--border)]">
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
                  <p className="text-xs text-[var(--muted-foreground)] mt-1 capitalize">{ticket.categoria.replace("_", " ")}</p>
                  <p className="text-xs text-[var(--muted-foreground)] mt-1">
                    {new Date(ticket.created_at).toLocaleDateString("es-AR")}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 glass-card rounded-2xl p-6 overflow-auto">
          {!selected ? (
            <div className="h-full flex flex-col items-center justify-center text-[var(--muted-foreground)]">
              <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
              <p>Seleccioná un ticket para ver el detalle</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-start justify-between border-b border-[var(--border)] pb-4">
                <div>
                  <h2 className="text-xl font-bold text-[var(--foreground)]">{selected.asunto}</h2>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1 capitalize">{selected.categoria.replace("_", " ")}</p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="p-2 rounded-lg hover:bg-[var(--accent)]/10 text-[var(--muted-foreground)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${estados[selected.estado].color}`}>
                {estados[selected.estado].label}
              </span>

              <div className="bg-[var(--background)] rounded-xl p-4">
                <p className="text-[var(--foreground)] whitespace-pre-wrap">{selected.mensaje}</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-4">
                  Recibido el {new Date(selected.created_at).toLocaleString("es-AR")}
                </p>
              </div>

              {adjuntos.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                    <Paperclip className="w-4 h-4" /> Adjuntos
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {adjuntos.map((a) => (
                      <a
                        key={a.id}
                        href={a.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl border border-[var(--border)] overflow-hidden hover:border-[var(--primary)] transition-colors"
                      >
                        <img src={a.file_url} alt={a.file_name} className="w-full h-32 object-cover" />
                        <p className="text-xs text-[var(--muted-foreground)] truncate p-2">{a.file_name}</p>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {replies.map((r) => (
                  <div
                    key={r.id}
                    className={`rounded-xl p-4 ${r.superadmin_id ? "bg-emerald-500/10" : "bg-[var(--accent)]/10"}`}
                  >
                    <p className="text-xs font-medium text-[var(--foreground)] mb-2">
                      {r.superadmin_id ? r.superadmins?.nombre || "Equipo de soporte" : "Vos"}
                    </p>
                    <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap">{r.mensaje}</p>
                    <p className="text-xs text-[var(--muted-foreground)] mt-2">
                      {new Date(r.created_at).toLocaleString("es-AR")}
                    </p>
                  </div>
                ))}
              </div>

              {selected.estado !== "cerrado" && selected.estado !== "resuelto" && (
                <form onSubmit={sendReply} className="space-y-3 pt-4 border-t border-[var(--border)]">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Escribí una respuesta..."
                    rows={4}
                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded-xl p-4 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                  />
                  <button
                    type="submit"
                    disabled={!reply.trim()}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    Enviar respuesta
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card)] rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-auto">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">Nuevo ticket de soporte</h2>
            <form onSubmit={createTicket} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[var(--foreground)]">Asunto</label>
                <input
                  type="text"
                  value={form.asunto}
                  onChange={(e) => setForm({ ...form, asunto: e.target.value })}
                  required
                  className="w-full mt-1 bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2 text-[var(--foreground)]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[var(--foreground)]">Categoría</label>
                  <select
                    value={form.categoria}
                    onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                    className="w-full mt-1 bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2 text-[var(--foreground)]"
                  >
                    <option value="soporte_tecnico">Soporte técnico</option>
                    <option value="facturacion">Facturación</option>
                    <option value="funcionalidad">Funcionalidad</option>
                    <option value="error">Reporte de error</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-[var(--foreground)]">Prioridad</label>
                  <select
                    value={form.prioridad}
                    onChange={(e) => setForm({ ...form, prioridad: e.target.value })}
                    className="w-full mt-1 bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2 text-[var(--foreground)]"
                  >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--foreground)]">Mensaje</label>
                <textarea
                  value={form.mensaje}
                  onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                  required
                  rows={5}
                  className="w-full mt-1 bg-[var(--background)] border border-[var(--border)] rounded-xl px-4 py-2 text-[var(--foreground)]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Capturas de pantalla
                </label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFiles(e.target.files)}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="mt-1 w-full py-3 rounded-xl border border-dashed border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]/5 transition-colors disabled:opacity-50"
                >
                  {uploading ? "Subiendo..." : "Hacé clic para adjuntar imágenes"}
                </button>

                {pendingAttachments.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {pendingAttachments.map((a) => (
                      <div key={a.id} className="relative rounded-xl border border-[var(--border)] overflow-hidden group">
                        <img src={a.file_url} alt={a.file_name} className="w-full h-20 object-cover" />
                        <button
                          type="button"
                          onClick={() => removePendingAttachment(a.id)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setPendingAttachments([]);
                  }}
                  className="px-4 py-2 rounded-xl border border-[var(--border)] text-[var(--foreground)]"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white">
                  Enviar ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
