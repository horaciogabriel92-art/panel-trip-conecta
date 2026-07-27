"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import api from "@/lib/api";
import { X, Calendar, Clock, MessageSquare, Loader2, Check, Video } from "lucide-react";

export default function OnboardingDemoModal() {
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    fecha_preferida: "",
    hora_preferida: "",
    comentarios: "",
  });

  const dismissedKey = `demo_modal_dismissed_${user?.id}`;

  useEffect(() => {
    if (!user?.id || !user?.fecha_registro) return;

    const registro = new Date(user.fecha_registro);
    const ahora = new Date();
    const horasDesdeRegistro = (ahora.getTime() - registro.getTime()) / (1000 * 60 * 60);

    // Solo usuarios registrados en las últimas 48 horas
    if (horasDesdeRegistro > 48) return;

    // Solo una vez por usuario
    if (localStorage.getItem(dismissedKey)) return;

    setVisible(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.fecha_registro]);

  const dismiss = () => {
    localStorage.setItem(dismissedKey, "1");
    setVisible(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fecha_preferida || !form.hora_preferida) return;

    setLoading(true);
    try {
      await api.post("/auth/demo-request", {
        fecha_preferida: form.fecha_preferida,
        hora_preferida: form.hora_preferida,
        comentarios: form.comentarios,
      });
      setSubmitted(true);
      toastSuccess("Un asesor se contactará por WhatsApp para confirmar la videollamada.", "Demo solicitada");
    } catch (err: any) {
      toastError(err.response?.data?.error || "Error al enviar la solicitud", "Error");
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--background)] border border-[var(--border)] rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="relative bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white">
          <button
            onClick={dismiss}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Video className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold uppercase tracking-wide opacity-90">Bienvenido a Quotix</span>
          </div>
          <h2 className="text-2xl font-black">¿Querés una demo guiada?</h2>
          <p className="text-sm text-white/90 mt-1">
            Te mostramos el cotizador PDF, el marketplace y el CRM paso a paso.
          </p>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {submitted ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">¡Solicitud enviada!</h3>
              <p className="text-[var(--muted-foreground)] mb-6">
                Un asesor se contactará por WhatsApp para confirmar fecha y hora.
              </p>
              <button
                onClick={dismiss}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
              >
                Entendido
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-[var(--muted-foreground)]">
                Elegí cuándo preferís que te contactemos. La llamada dura unos 20 minutos.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)] mb-1.5">
                    <Calendar className="w-4 h-4 text-blue-400" /> Fecha
                  </label>
                  <input
                    type="date"
                    required
                    value={form.fecha_preferida}
                    onChange={(e) => setForm({ ...form, fecha_preferida: e.target.value })}
                    className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)] mb-1.5">
                    <Clock className="w-4 h-4 text-blue-400" /> Hora
                  </label>
                  <input
                    type="time"
                    required
                    value={form.hora_preferida}
                    onChange={(e) => setForm({ ...form, hora_preferida: e.target.value })}
                    className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)] mb-1.5">
                  <MessageSquare className="w-4 h-4 text-blue-400" /> ¿Qué te gustaría ver?
                </label>
                <textarea
                  value={form.comentarios}
                  onChange={(e) => setForm({ ...form, comentarios: e.target.value })}
                  placeholder="Contanos qué funcionalidad te interesa más."
                  rows={3}
                  className="w-full bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-[var(--foreground)] focus:border-blue-500 focus:outline-none text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-xl font-semibold transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Enviando...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" /> Agendar demo gratuita
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={dismiss}
                className="w-full text-center text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
              >
                No por ahora, gracias
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
